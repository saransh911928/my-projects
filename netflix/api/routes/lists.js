const router = require("express").Router();
const List = require("../models/List");
const Movie = require("../models/Movie");
const verify = require("../verifyToken");

const normalizeType = (type = "") => String(type).trim().toLowerCase();

const validateListTypeAndContent = async ({ type, content }) => {
  const normalizedType = normalizeType(type);
  if (!["movie", "series"].includes(normalizedType)) {
    return 'Type must be either "movie" or "series".';
  }

  if (!Array.isArray(content) || content.length === 0) {
    return "Select at least one movie/series in content.";
  }

  const uniqueContentIds = [...new Set(content.map((id) => String(id)))];
  const contentMovies = await Movie.find({ _id: { $in: uniqueContentIds } }).select(
    "_id title isSeries"
  );

  if (contentMovies.length !== uniqueContentIds.length) {
    return "Some selected content items were not found.";
  }

  const expectsSeries = normalizedType === "series";
  const mismatchedMovies = contentMovies.filter(
    (movie) => Boolean(movie.isSeries) !== expectsSeries
  );

  if (!mismatchedMovies.length) return null;

  const preview = mismatchedMovies
    .slice(0, 3)
    .map((movie) => movie.title || movie._id.toString())
    .join(", ");
  const suffix = mismatchedMovies.length > 3 ? ", ..." : "";

  return `List type is "${normalizedType}" but these items do not match: ${preview}${suffix}.`;
};

//CREATE

router.post("/", verify, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const payload = {
        ...req.body,
        type: normalizeType(req.body.type),
        content: Array.isArray(req.body.content) ? req.body.content : [],
      };

      const validationError = await validateListTypeAndContent(payload);
      if (validationError) {
        return res.status(400).json({ message: validationError });
      }

      const newList = new List(payload);
      const savedList = await newList.save();
      res.status(201).json(savedList);
    } catch (err) {
      res.status(500).json({ message: err?.message || "Failed to create list." });
    }
  } else {
    res.status(403).json("You are not allowed!");
  }
});

//UPDATE

router.put("/:id", verify, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const existingList = await List.findById(req.params.id);
      if (!existingList) {
        return res.status(404).json({ message: "List not found." });
      }

      const payload = {
        ...req.body,
        type: req.body.type ? normalizeType(req.body.type) : normalizeType(existingList.type),
        content: Array.isArray(req.body.content) ? req.body.content : existingList.content,
      };

      const validationError = await validateListTypeAndContent(payload);
      if (validationError) {
        return res.status(400).json({ message: validationError });
      }

      const updatedList = await List.findByIdAndUpdate(
        req.params.id,
        { $set: payload },
        { new: true }
      );
      res.status(200).json(updatedList);
    } catch (err) {
      res.status(500).json({ message: err?.message || "Failed to update list." });
    }
  } else {
    res.status(403).json("You are not allowed!");
  }
});

//DELETE

router.delete("/:id", verify, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      await List.findByIdAndDelete(req.params.id);
      res.status(201).json("The list has been delete...");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You are not allowed!");
  }
});

//GET ALL (ADMIN)

router.get("/all", verify, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json("You are not allowed!");
  }

  try {
    const lists = await List.find().sort({ createdAt: -1 });
    res.status(200).json(lists);
  } catch (err) {
    res.status(500).json({ message: err?.message || "Failed to get all lists." });
  }
});

//GET

router.get("/", async (req, res) => {
  const typeQuery = req.query.type;
  const genreQuery = req.query.genre;
  let list = [];
  try {
    if (typeQuery) {
      if (genreQuery) {
        list = await List.aggregate([
          { $match: { type: typeQuery, genre: genreQuery } },
          { $sample: { size: 10 } },
        ]);
      } else {
        list = await List.aggregate([
          { $match: { type: typeQuery } },
          { $sample: { size: 10 } },
        ]);
      }
    } else {
      list = await List.aggregate([{ $sample: { size: 10 } }]);
    }
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ message: err?.message || "Failed to get lists." });
  }
});

module.exports = router;
