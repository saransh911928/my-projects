const path = require("path");
const dns = require("dns");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const cloudinary = require("../utils/cloudinary");
const Movie = require("../models/Movie");
const List = require("../models/List");

const argv = new Set(process.argv.slice(2));
const MONGO_URL = process.env.MONGO_URL_STANDARD || process.env.MONGO_URL;
const DB_NAME = process.env.MONGO_DB_NAME || "netflix";
const LIST_SIZE = Number(process.env.CLOUD_SYNC_LIST_SIZE || 10);
const DRY_RUN =
  argv.has("--dry-run") || String(process.env.CLOUD_SYNC_DRY_RUN || "false").toLowerCase() === "true";

if (process.env.MONGO_DNS_SERVERS) {
  const servers = process.env.MONGO_DNS_SERVERS.split(",").map((server) => server.trim());
  try {
    dns.setServers(servers);
    console.log("Using custom DNS servers:", servers);
  } catch (err) {
    console.log("Failed to set custom DNS servers:", err.message || err);
  }
}

function titleCase(value = "") {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

function parseTagMap(tags = []) {
  const map = {};

  for (const rawTag of tags) {
    if (!rawTag || typeof rawTag !== "string") continue;
    const separatorIndex = rawTag.indexOf(":");
    if (separatorIndex <= 0) continue;

    const key = rawTag.slice(0, separatorIndex).trim().toLowerCase();
    const value = rawTag.slice(separatorIndex + 1).trim();
    if (!key || !value) continue;

    if (!map[key]) map[key] = [];
    map[key].push(value);
  }

  return map;
}

function firstTag(tagMap, key) {
  const values = tagMap[key];
  return Array.isArray(values) && values.length ? values[0] : "";
}

function normalizeGenre(value = "") {
  return value.trim().toLowerCase();
}

function normalizeType(value = "") {
  const normalized = value.trim().toLowerCase();
  return normalized === "series" ? "series" : "movie";
}

function normalizeRole(role = "", resourceType = "") {
  const normalized = role.toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalizedResource = (resourceType || "").toLowerCase();

  if (["img", "image", "poster", "thumbnail", "thumb"].includes(normalized)) return "img";
  if (["imgtitle", "titleimage", "title"].includes(normalized)) return "imgTitle";
  if (["imgsm", "smallthumb", "smallimage", "thumbnailsm"].includes(normalized)) return "imgSm";
  if (["trailer", "preview"].includes(normalized)) return "trailer";
  if (["video", "fullvideo", "fullmovie", "movievideo"].includes(normalized)) return "video";

  if (normalizedResource === "video") return "video";
  if (normalizedResource === "image") return "img";

  return "";
}

function parseContext(resource) {
  const contextCustom = resource?.context?.custom || {};
  return {
    title: contextCustom.title || "",
    type: contextCustom.type || "",
    genre: contextCustom.genre || "",
    desc: contextCustom.desc || contextCustom.description || "",
    year: contextCustom.year || "",
    limit: contextCustom.limit || "",
    role: contextCustom.role || "",
    movie: contextCustom.movie || contextCustom.slug || "",
  };
}

function toTimestamp(value) {
  const time = Date.parse(value || "");
  return Number.isNaN(time) ? 0 : time;
}

function pickLatestByRole(resources, targetRole) {
  return resources
    .filter((resource) => resource.role === targetRole)
    .sort((a, b) => toTimestamp(b.created_at) - toTimestamp(a.created_at))[0];
}

function pickLatestByType(resources, resourceType) {
  return resources
    .filter((resource) => resource.resource_type === resourceType)
    .sort((a, b) => toTimestamp(b.created_at) - toTimestamp(a.created_at));
}

function pickRandomUnique(items, count) {
  const copied = [...items];
  for (let i = copied.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[randomIndex]] = [copied[randomIndex], copied[i]];
  }
  return copied.slice(0, Math.min(count, copied.length));
}

async function fetchCloudinaryResources(resourceType) {
  const allResources = [];
  let nextCursor;

  do {
    // Cloudinary Admin API pagination.
    // eslint-disable-next-line no-await-in-loop
    const page = await cloudinary.api.resources({
      type: "upload",
      resource_type: resourceType,
      max_results: 500,
      next_cursor: nextCursor,
      context: true,
      tags: true,
    });

    allResources.push(...(page.resources || []));
    nextCursor = page.next_cursor;
  } while (nextCursor);

  return allResources;
}

function buildGroupedAssets(resources) {
  const grouped = new Map();
  let skippedWithoutMovieTag = 0;

  for (const resource of resources) {
    const tagMap = parseTagMap(resource.tags || []);
    const context = parseContext(resource);
    const movieKeyFromTag = firstTag(tagMap, "movie");
    const movieKey = (movieKeyFromTag || context.movie || "").trim().toLowerCase();

    if (!movieKey) {
      skippedWithoutMovieTag += 1;
      continue;
    }

    if (!grouped.has(movieKey)) {
      grouped.set(movieKey, {
        key: movieKey,
        type: "",
        genre: "",
        title: "",
        desc: "",
        year: "",
        limit: "",
        assets: [],
      });
    }

    const group = grouped.get(movieKey);

    const type = normalizeType(firstTag(tagMap, "type") || context.type || group.type || "movie");
    const genre = normalizeGenre(firstTag(tagMap, "genre") || context.genre || group.genre || "drama");
    const title = (firstTag(tagMap, "title") || context.title || group.title || titleCase(movieKey)).trim();
    const desc =
      (firstTag(tagMap, "desc") || context.desc || group.desc || `Imported from Cloudinary group "${title}".`)
        .trim();
    const year = (firstTag(tagMap, "year") || context.year || group.year || "").trim();
    const limit = (firstTag(tagMap, "limit") || context.limit || group.limit || "").trim();
    const role = normalizeRole(firstTag(tagMap, "role") || context.role, resource.resource_type);

    group.type = type;
    group.genre = genre;
    group.title = title;
    group.desc = desc;
    group.year = year;
    group.limit = limit;
    group.assets.push({
      secure_url: resource.secure_url,
      public_id: resource.public_id,
      resource_type: resource.resource_type,
      created_at: resource.created_at,
      role,
    });
  }

  return { grouped, skippedWithoutMovieTag };
}

function buildMoviePayload(group) {
  const videos = pickLatestByType(group.assets, "video");
  const images = pickLatestByType(group.assets, "image");

  const img = pickLatestByRole(group.assets, "img") || images[0];
  const imgTitle = pickLatestByRole(group.assets, "imgTitle") || images[1] || images[0];
  const imgSm = pickLatestByRole(group.assets, "imgSm") || images[2] || images[0];
  const trailer = pickLatestByRole(group.assets, "trailer") || videos[0];
  const video = pickLatestByRole(group.assets, "video") || videos[1] || videos[0];

  const parsedLimit = Number(group.limit);
  const payload = {
    title: group.title,
    desc: group.desc || `Imported from Cloudinary group "${group.title}".`,
    img: img?.secure_url || "",
    imgTitle: imgTitle?.secure_url || "",
    imgSm: imgSm?.secure_url || "",
    trailer: trailer?.secure_url || "",
    video: video?.secure_url || "",
    year: group.year || "",
    limit: Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 16,
    genre: group.genre || "drama",
    isSeries: group.type === "series",
    cloudinaryMeta: {
      imgPublicId: img?.public_id || "",
      imgTitlePublicId: imgTitle?.public_id || "",
      imgSmPublicId: imgSm?.public_id || "",
      trailerPublicId: trailer?.public_id || "",
      videoPublicId: video?.public_id || "",
      movieKey: group.key,
    },
  };

  return payload;
}

async function upsertMovies(grouped) {
  const summaries = [];
  const upsertedMovieIds = [];
  let skippedWithoutMedia = 0;

  for (const group of grouped.values()) {
    const payload = buildMoviePayload(group);
    const hasAnyMedia = Boolean(payload.img || payload.imgTitle || payload.imgSm || payload.trailer || payload.video);

    if (!hasAnyMedia) {
      skippedWithoutMedia += 1;
      continue;
    }

    if (DRY_RUN) {
      summaries.push({
        title: payload.title,
        genre: payload.genre,
        isSeries: payload.isSeries,
        media: {
          img: Boolean(payload.img),
          imgTitle: Boolean(payload.imgTitle),
          imgSm: Boolean(payload.imgSm),
          trailer: Boolean(payload.trailer),
          video: Boolean(payload.video),
        },
      });
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const doc = await Movie.findOneAndUpdate(
      { title: payload.title },
      { $set: payload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    upsertedMovieIds.push(doc._id.toString());
    summaries.push({
      title: doc.title,
      genre: doc.genre,
      isSeries: doc.isSeries,
    });
  }

  return { summaries, upsertedMovieIds, skippedWithoutMedia };
}

async function ensureIndexes() {
  if (DRY_RUN) return;
  await Movie.collection.createIndex({ isSeries: 1, genre: 1 });
  await List.collection.createIndex({ type: 1, genre: 1 });
}

async function syncListsFromMovies() {
  const movies = await Movie.find(
    {
      genre: { $exists: true, $nin: ["", null] },
    },
    { _id: 1, genre: 1, isSeries: 1 }
  ).lean();

  const byKey = new Map();
  for (const movie of movies) {
    const type = movie.isSeries ? "series" : "movie";
    const genre = normalizeGenre(movie.genre);
    const key = `${type}::${genre}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(movie._id.toString());
  }

  const operations = [];
  for (const [key, ids] of byKey.entries()) {
    const [type, genre] = key.split("::");
    if (!ids.length) continue;

    operations.push({
      updateOne: {
        filter: { title: `Cloud ${titleCase(genre)} ${type === "series" ? "Series" : "Movies"}` },
        update: {
          $set: {
            title: `Cloud ${titleCase(genre)} ${type === "series" ? "Series" : "Movies"}`,
            type,
            genre,
            content: pickRandomUnique(ids, LIST_SIZE),
          },
        },
        upsert: true,
      },
    });
  }

  const movieIds = movies.filter((movie) => !movie.isSeries).map((movie) => movie._id.toString());
  const seriesIds = movies.filter((movie) => movie.isSeries).map((movie) => movie._id.toString());

  operations.push({
    updateOne: {
      filter: { title: "Cloud Trending Movies" },
      update: {
        $set: {
          title: "Cloud Trending Movies",
          type: "movie",
          genre: "trending",
          content: pickRandomUnique(movieIds, LIST_SIZE),
        },
      },
      upsert: true,
    },
  });

  operations.push({
    updateOne: {
      filter: { title: "Cloud Trending Series" },
      update: {
        $set: {
          title: "Cloud Trending Series",
          type: "series",
          genre: "trending",
          content: pickRandomUnique(seriesIds, LIST_SIZE),
        },
      },
      upsert: true,
    },
  });

  if (DRY_RUN) {
    return { operationCount: operations.length };
  }

  if (operations.length) {
    await List.bulkWrite(operations, { ordered: false });
  }
  return { operationCount: operations.length };
}

async function main() {
  if (!MONGO_URL) {
    throw new Error("Missing Mongo connection string. Set MONGO_URL or MONGO_URL_STANDARD in API/.env.");
  }

  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "WRITE"}`);
  console.log("Fetching Cloudinary resources...");

  const [imageResources, videoResources] = await Promise.all([
    fetchCloudinaryResources("image"),
    fetchCloudinaryResources("video"),
  ]);

  const allResources = [...imageResources, ...videoResources];
  console.log(`Cloudinary resources fetched: ${allResources.length}`);

  const { grouped, skippedWithoutMovieTag } = buildGroupedAssets(allResources);
  console.log(`Grouped movie keys: ${grouped.size}`);
  console.log(`Skipped assets without movie tag/context: ${skippedWithoutMovieTag}`);

  await mongoose.connect(MONGO_URL, { dbName: DB_NAME });
  console.log(`Connected to MongoDB database: ${DB_NAME}`);

  await ensureIndexes();
  const movieSync = await upsertMovies(grouped);
  const listSync = await syncListsFromMovies();

  console.log(`Movies processed: ${movieSync.summaries.length}`);
  console.log(`Skipped groups without usable media: ${movieSync.skippedWithoutMedia}`);
  if (DRY_RUN) {
    console.log("Sample movie preview:", movieSync.summaries.slice(0, 5));
  }
  console.log(`List operations prepared: ${listSync.operationCount}`);
}

main()
  .catch((err) => {
    console.error("Cloudinary sync failed:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
