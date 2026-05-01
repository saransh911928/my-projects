const path = require("path");
const dns = require("dns");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Movie = require("../models/Movie");
const List = require("../models/List");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MONGO_URL = process.env.MONGO_URL_STANDARD || process.env.MONGO_URL;
const DB_NAME = process.env.MONGO_DB_NAME || "netflix";
const DEFAULT_LIST_SIZE = Number(process.env.LIST_REPAIR_SIZE || 10);

if (process.env.MONGO_DNS_SERVERS) {
  const servers = process.env.MONGO_DNS_SERVERS.split(",").map((s) => s.trim());
  try {
    dns.setServers(servers);
    console.log("Using custom DNS servers:", servers);
  } catch (err) {
    console.log("Failed to set custom DNS servers:", err.message || err);
  }
}

function normalizeGenre(genre = "") {
  return String(genre).trim().toLowerCase();
}

function normalizeType(type = "") {
  return String(type).trim().toLowerCase() === "series" ? "series" : "movie";
}

function pickRandomUnique(ids, count) {
  const arr = [...ids];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, Math.min(count, arr.length));
}

async function main() {
  if (!MONGO_URL) {
    throw new Error("Missing Mongo connection string in API/.env.");
  }

  await mongoose.connect(MONGO_URL, { dbName: DB_NAME });
  console.log(`Connected to MongoDB database: ${DB_NAME}`);

  const [lists, movies] = await Promise.all([
    List.find({}).lean(),
    Movie.find({}, { _id: 1, genre: 1, isSeries: 1 }).lean(),
  ]);

  const moviePool = new Map();
  const moviePoolByType = new Map([
    ["movie", []],
    ["series", []],
  ]);
  for (const movie of movies) {
    const type = movie.isSeries ? "series" : "movie";
    const key = `${type}::${normalizeGenre(movie.genre)}`;
    if (!moviePool.has(key)) moviePool.set(key, []);
    moviePool.get(key).push(movie._id.toString());
    moviePoolByType.get(type).push(movie._id.toString());
  }

  let repaired = 0;
  let unchanged = 0;
  let skipped = 0;
  const updates = [];

  for (const list of lists) {
    const type = normalizeType(list.type);
    const genre = normalizeGenre(list.genre);
    const key = `${type}::${genre}`;
    const pool = moviePool.get(key) || moviePoolByType.get(type) || [];

    if (!pool.length) {
      skipped += 1;
      continue;
    }

    const desiredSize = Math.max(1, Math.min(DEFAULT_LIST_SIZE, pool.length));
    const nextContent = pickRandomUnique(pool, desiredSize);
    const prevContent = Array.isArray(list.content) ? list.content.map(String) : [];
    const isSame =
      prevContent.length === nextContent.length &&
      prevContent.every((id, index) => id === nextContent[index]);

    if (isSame) {
      unchanged += 1;
      continue;
    }

    updates.push({
      updateOne: {
        filter: { _id: list._id },
        update: { $set: { content: nextContent } },
      },
    });
    repaired += 1;
  }

  if (updates.length) {
    await List.bulkWrite(updates, { ordered: false });
  }

  const duplicateStats = await List.aggregate([
    {
      $project: {
        title: 1,
        contentSize: { $size: { $ifNull: ["$content", []] } },
        uniqueSize: { $size: { $setUnion: [{ $ifNull: ["$content", []] }, []] } },
      },
    },
    {
      $project: {
        title: 1,
        duplicateItems: { $subtract: ["$contentSize", "$uniqueSize"] },
      },
    },
    { $sort: { duplicateItems: -1 } },
    { $limit: 5 },
  ]);

  console.log(`Lists repaired: ${repaired}`);
  console.log(`Lists unchanged: ${unchanged}`);
  console.log(`Lists skipped (no movie pool): ${skipped}`);
  console.log("Top duplicate stats after repair:", duplicateStats);
}

main()
  .catch((err) => {
    console.error("List repair failed:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
