const router = require("express").Router();
const Movie = require("../models/Movie");
const verify = require("../verifyToken");
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");

const upload = multer({ storage: multer.memoryStorage() });
const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const uploadToCloudinary = (fileBuffer, folder, resourceType = "image") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });

//CREATE

router.post(
  "/",
  verify,
  upload.fields([
    { name: "img", maxCount: 1 },
    { name: "imgTitle", maxCount: 1 },
    { name: "imgSm", maxCount: 1 },
    { name: "trailer", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const files = req.files || {};

      const img = files.img?.[0]
        ? await uploadToCloudinary(files.img[0].buffer, "netflix/movies/images")
        : req.body.img;
      const imgTitle = files.imgTitle?.[0]
        ? await uploadToCloudinary(files.imgTitle[0].buffer, "netflix/movies/images")
        : req.body.imgTitle;
      const imgSm = files.imgSm?.[0]
        ? await uploadToCloudinary(files.imgSm[0].buffer, "netflix/movies/images")
        : req.body.imgSm;
      const trailer = files.trailer?.[0]
        ? await uploadToCloudinary(files.trailer[0].buffer, "netflix/movies/trailers", "video")
        : req.body.trailer;
      const video = files.video?.[0]
        ? await uploadToCloudinary(files.video[0].buffer, "netflix/movies/videos", "video")
        : req.body.video;

      const newMovie = new Movie({
        title: req.body.title,
        desc: req.body.desc,
        img,
        imgTitle,
        imgSm,
        trailer,
        video,
        year: req.body.year,
        limit: req.body.limit ? Number(req.body.limit) : undefined,
        genre: req.body.genre,
        isSeries: req.body.isSeries === "true" || req.body.isSeries === true,
      });

      const savedMovie = await newMovie.save();
      res.status(201).json(savedMovie);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You are not allowed!");
  }
});

//UPDATE

router.put("/:id", verify, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const updatedMovie = await Movie.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(updatedMovie);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You are not allowed!");
  }
});

//DELETE

router.delete("/:id", verify, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      await Movie.findByIdAndDelete(req.params.id);
      res.status(200).json("The movie has been deleted...");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You are not allowed!");
  }
});

//GET

router.get("/find/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    res.status(200).json(movie);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET RANDOM

router.get("/random", async (req, res) => {
  const { type, genre } = req.query;
  const match = {};

  if (type === "series") {
    match.isSeries = true;
  } else {
    match.isSeries = false;
  }

  const trimmedGenre = typeof genre === "string" ? genre.trim() : "";
  if (trimmedGenre) {
    match.genre = { $regex: `^${escapeRegex(trimmedGenre)}$`, $options: "i" };
  }

  try {
    let movie = await Movie.aggregate([
      { $match: match },
      { $sample: { size: 1 } },
    ]);

    // Fallback: if selected genre has no title, return random by type instead of blank.
    if (!movie.length && trimmedGenre) {
      const fallbackMatch = { ...match };
      delete fallbackMatch.genre;
      movie = await Movie.aggregate([
        { $match: fallbackMatch },
        { $sample: { size: 1 } },
      ]);
    }

    res.status(200).json(movie);
  } catch (err) {
    res.status(500).json({ message: err?.message || "Failed to get random movie." });
  }
});

//GET ALL

router.get("/", verify, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const movies = await Movie.find();
      res.status(200).json(movies.reverse());
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You are not allowed!");
  }
});

module.exports = router;
