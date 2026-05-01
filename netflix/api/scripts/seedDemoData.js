const path = require("path");
const dns = require("dns");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Movie = require("../models/Movie");
const List = require("../models/List");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MONGO_URL = process.env.MONGO_URL_STANDARD || process.env.MONGO_URL;
const DB_NAME = process.env.MONGO_DB_NAME || "netflix";
const MOVIES_PER_TYPE = Number(process.env.DEMO_MOVIES_PER_TYPE || 30);
const LIST_SIZE = Number(process.env.DEMO_LIST_SIZE || 10);
const SHOULD_RESET = String(process.env.DEMO_RESET || "false").toLowerCase() === "true";

if (process.env.MONGO_DNS_SERVERS) {
  const servers = process.env.MONGO_DNS_SERVERS.split(",").map((item) => item.trim());
  try {
    dns.setServers(servers);
    console.log("Using custom DNS servers:", servers);
  } catch (err) {
    console.log("Failed to set custom DNS servers:", err.message || err);
  }
}

const GENRES = [
  "adventure",
  "comedy",
  "crime",
  "fantasy",
  "historical",
  "horror",
  "romance",
  "sci-fi",
  "thriller",
  "western",
  "animation",
  "drama",
  "documentary",
];

const VIDEO_SOURCES = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
];

function titleCase(value) {
  return value
    .split("-")
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

function buildImage(seed, width, height) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}

function buildMovieDocument({ title, genre, isSeries, index }) {
  const baseSeed = `${title}-${genre}-${isSeries ? "series" : "movie"}-${index}`;
  const year = String(2000 + (index % 25));
  const limitOptions = [7, 13, 16, 18];
  const limit = limitOptions[index % limitOptions.length];
  const video = VIDEO_SOURCES[index % VIDEO_SOURCES.length];

  return {
    title,
    desc: `Demo ${isSeries ? "series" : "movie"} in ${titleCase(genre)} genre. Record ${index + 1}.`,
    img: buildImage(`${baseSeed}-hero`, 1280, 720),
    imgTitle: buildImage(`${baseSeed}-title`, 640, 360),
    imgSm: buildImage(`${baseSeed}-thumb`, 320, 180),
    trailer: video,
    video,
    year,
    limit,
    genre,
    isSeries,
  };
}

function pickRandomUnique(items, count) {
  const copied = [...items];
  for (let i = copied.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[randomIndex]] = [copied[randomIndex], copied[i]];
  }
  return copied.slice(0, Math.min(count, copied.length));
}

function createListOps(movies, type, genre, title) {
  const filteredIds = movies
    .filter((movie) => movie.isSeries === (type === "series") && movie.genre === genre)
    .map((movie) => movie._id.toString());

  if (!filteredIds.length) return null;

  return {
    updateOne: {
      filter: { title },
      update: {
        $set: {
          title,
          type,
          genre,
          content: pickRandomUnique(filteredIds, LIST_SIZE),
        },
      },
      upsert: true,
    },
  };
}

async function seedMovies() {
  const operations = [];
  const demoTitles = [];

  for (const isSeries of [false, true]) {
    for (let i = 0; i < MOVIES_PER_TYPE; i += 1) {
      const genre = GENRES[i % GENRES.length];
      const title = `Demo ${isSeries ? "Series" : "Movie"} ${titleCase(genre)} ${String(i + 1).padStart(2, "0")}`;
      const payload = buildMovieDocument({
        title,
        genre,
        isSeries,
        index: i,
      });

      demoTitles.push(title);
      operations.push({
        updateOne: {
          filter: { title },
          update: { $set: payload },
          upsert: true,
        },
      });
    }
  }

  if (operations.length) {
    await Movie.bulkWrite(operations, { ordered: false });
  }

  return Movie.find({ title: { $in: demoTitles } }).lean();
}

async function seedLists(seedMoviesList) {
  const operations = [];

  for (const genre of GENRES) {
    const movieListOp = createListOps(
      seedMoviesList,
      "movie",
      genre,
      `Demo ${titleCase(genre)} Movies`
    );
    const seriesListOp = createListOps(
      seedMoviesList,
      "series",
      genre,
      `Demo ${titleCase(genre)} Series`
    );

    if (movieListOp) operations.push(movieListOp);
    if (seriesListOp) operations.push(seriesListOp);
  }

  const allMovieIds = seedMoviesList
    .filter((movie) => !movie.isSeries)
    .map((movie) => movie._id.toString());
  const allSeriesIds = seedMoviesList
    .filter((movie) => movie.isSeries)
    .map((movie) => movie._id.toString());

  operations.push({
    updateOne: {
      filter: { title: "Demo Trending Movies" },
      update: {
        $set: {
          title: "Demo Trending Movies",
          type: "movie",
          genre: "trending",
          content: pickRandomUnique(allMovieIds, LIST_SIZE),
        },
      },
      upsert: true,
    },
  });

  operations.push({
    updateOne: {
      filter: { title: "Demo Trending Series" },
      update: {
        $set: {
          title: "Demo Trending Series",
          type: "series",
          genre: "trending",
          content: pickRandomUnique(allSeriesIds, LIST_SIZE),
        },
      },
      upsert: true,
    },
  });

  await List.bulkWrite(operations, { ordered: false });
  return operations.length;
}

async function main() {
  if (!MONGO_URL) {
    throw new Error("Missing Mongo connection string in API/.env (MONGO_URL or MONGO_URL_STANDARD).");
  }

  await mongoose.connect(MONGO_URL, { dbName: DB_NAME });
  console.log(`Connected to MongoDB database: ${DB_NAME}`);

  if (SHOULD_RESET) {
    await Movie.deleteMany({ title: /^Demo (Movie|Series) / });
    await List.deleteMany({ title: /^Demo / });
    console.log("Old demo movies/lists deleted.");
  }

  const movies = await seedMovies();
  const listCount = await seedLists(movies);

  const createdMovies = await Movie.countDocuments({ title: /^Demo (Movie|Series) / });
  const createdLists = await List.countDocuments({ title: /^Demo / });

  console.log("Demo seeding complete.");
  console.log(`Movies upserted this run: ${movies.length}`);
  console.log(`List upserts this run: ${listCount}`);
  console.log(`Total demo movies in DB: ${createdMovies}`);
  console.log(`Total demo lists in DB: ${createdLists}`);
}

main()
  .catch((err) => {
    console.error("Seeding failed:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
