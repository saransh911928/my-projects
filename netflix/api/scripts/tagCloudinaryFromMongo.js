const path = require("path");
const dns = require("dns");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const cloudinary = require("../utils/cloudinary");
const Movie = require("../models/Movie");

const MONGO_URL = process.env.MONGO_URL_STANDARD || process.env.MONGO_URL;
const DB_NAME = process.env.MONGO_DB_NAME || "netflix";
const DRY_RUN = String(process.env.CLOUD_TAG_DRY_RUN || "false").toLowerCase() === "true";

if (process.env.MONGO_DNS_SERVERS) {
  const servers = process.env.MONGO_DNS_SERVERS.split(",").map((item) => item.trim());
  try {
    dns.setServers(servers);
    console.log("Using custom DNS servers:", servers);
  } catch (err) {
    console.log("Failed to set custom DNS servers:", err.message || err);
  }
}

function slugify(value = "") {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractPublicIdFromCloudinaryUrl(url = "") {
  if (!url.includes("/upload/")) return "";

  try {
    const withoutQuery = url.split("?")[0];
    const uploadPart = withoutQuery.split("/upload/")[1];
    if (!uploadPart) return "";

    const parts = uploadPart.split("/");
    let startIndex = 0;

    // Skip transformation segments until version segment (v123...)
    for (let i = 0; i < parts.length; i += 1) {
      if (/^v\d+$/.test(parts[i])) {
        startIndex = i + 1;
        break;
      }
    }

    const publicIdWithExt = parts.slice(startIndex).join("/");
    if (!publicIdWithExt) return "";
    return publicIdWithExt.replace(/\.[^.\/]+$/, "");
  } catch (err) {
    return "";
  }
}

function buildTags(movie, role) {
  const movieKey = slugify(movie.title);
  const type = movie.isSeries ? "series" : "movie";
  const genre = slugify(movie.genre || "drama") || "drama";
  const tags = [`movie:${movieKey}`, `title:${movieKey}`, `type:${type}`, `genre:${genre}`, `role:${role}`];

  if (movie.year) tags.push(`year:${String(movie.year).trim()}`);
  if (movie.limit) tags.push(`limit:${String(movie.limit).trim()}`);

  return tags;
}

function buildContext(movie, role) {
  const movieKey = slugify(movie.title);
  const type = movie.isSeries ? "series" : "movie";
  const genre = slugify(movie.genre || "drama") || "drama";
  const year = movie.year ? String(movie.year).trim() : "";
  const limit = movie.limit ? String(movie.limit).trim() : "";

  const contextPairs = [
    `movie=${movieKey}`,
    `title=${movie.title || movieKey}`,
    `type=${type}`,
    `genre=${genre}`,
    `role=${role}`,
  ];

  if (year) contextPairs.push(`year=${year}`);
  if (limit) contextPairs.push(`limit=${limit}`);

  return contextPairs.join("|");
}

async function tagOneResource({ movie, role, url, resourceType }) {
  const publicId = extractPublicIdFromCloudinaryUrl(url);
  if (!publicId) return { skipped: 1, tagged: 0, errors: 0 };

  if (DRY_RUN) {
    return { skipped: 0, tagged: 1, errors: 0 };
  }

  const tags = buildTags(movie, role);
  const context = buildContext(movie, role);

  try {
    await cloudinary.uploader.add_tag(tags, [publicId], { resource_type: resourceType });

    // Explicit with overwrite=false keeps asset while setting context metadata.
    await cloudinary.uploader.explicit(publicId, {
      type: "upload",
      resource_type: resourceType,
      context,
      overwrite: false,
    });

    return { skipped: 0, tagged: 1, errors: 0 };
  } catch (err) {
    console.log(`Failed tagging ${publicId}:`, err.message || err);
    return { skipped: 0, tagged: 0, errors: 1 };
  }
}

async function main() {
  if (!MONGO_URL) {
    throw new Error("Missing Mongo connection string. Set MONGO_URL or MONGO_URL_STANDARD in API/.env.");
  }

  await mongoose.connect(MONGO_URL, { dbName: DB_NAME });
  console.log(`Connected to MongoDB database: ${DB_NAME}`);
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "WRITE"}`);

  const movies = await Movie.find(
    {},
    { title: 1, genre: 1, isSeries: 1, year: 1, limit: 1, img: 1, imgTitle: 1, imgSm: 1, trailer: 1, video: 1 }
  ).lean();

  const tasks = [];
  for (const movie of movies) {
    const mediaMap = [
      { role: "img", url: movie.img, resourceType: "image" },
      { role: "imgTitle", url: movie.imgTitle, resourceType: "image" },
      { role: "imgSm", url: movie.imgSm, resourceType: "image" },
      { role: "trailer", url: movie.trailer, resourceType: "video" },
      { role: "video", url: movie.video, resourceType: "video" },
    ];

    for (const media of mediaMap) {
      if (!media.url || !String(media.url).includes("res.cloudinary.com")) continue;
      tasks.push(tagOneResource({ movie, ...media }));
    }
  }

  const results = await Promise.all(tasks);
  const summary = results.reduce(
    (acc, item) => {
      acc.tagged += item.tagged;
      acc.skipped += item.skipped;
      acc.errors += item.errors;
      return acc;
    },
    { tagged: 0, skipped: 0, errors: 0 }
  );

  console.log(`Movies scanned: ${movies.length}`);
  console.log(`Cloudinary assets processed: ${tasks.length}`);
  console.log(`Tagged: ${summary.tagged}, Skipped: ${summary.skipped}, Errors: ${summary.errors}`);
}

main()
  .catch((err) => {
    console.error("Cloudinary tagging failed:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
