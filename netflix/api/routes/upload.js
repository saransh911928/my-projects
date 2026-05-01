const router = require("express").Router();
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");

const storage = multer.memoryStorage();
const uploadMaxMb = Number(process.env.UPLOAD_MAX_MB || 95);
const upload = multer({
  storage,
  limits: { fileSize: uploadMaxMb * 1024 * 1024 },
});
const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const sanitizeContextValue = (value = "") =>
  String(value)
    .replace(/[|=]/g, " ")
    .trim();

router.post("/", (req, res) => {
  upload.single("file")(req, res, async (multerErr) => {
    if (multerErr) {
      const isSizeError = multerErr.code === "LIMIT_FILE_SIZE";
      const message = isSizeError
        ? `File too large. Max allowed is ${uploadMaxMb}MB.`
        : multerErr.message || "Upload failed before sending to Cloudinary.";
      return res.status(isSizeError ? 413 : 400).json({ message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const movieKey = slugify(req.body.movieKey || req.body.title || "");
      const type = req.body.type === "series" ? "series" : "movie";
      const genre = slugify(req.body.genre || "drama") || "drama";
      const role = sanitizeContextValue(req.body.role || "");
      const title = sanitizeContextValue(req.body.title || movieKey || "Untitled");
      const year = sanitizeContextValue(req.body.year || "");
      const limit = sanitizeContextValue(req.body.limit || "");

      const tags = [];
      if (movieKey) {
        tags.push(`movie:${movieKey}`);
        tags.push(`title:${movieKey}`);
      }
      tags.push(`type:${type}`);
      tags.push(`genre:${genre}`);
      if (role) tags.push(`role:${slugify(role)}`);
      if (year) tags.push(`year:${year}`);
      if (limit) tags.push(`limit:${limit}`);

      const contextPairs = [];
      if (movieKey) contextPairs.push(`movie=${movieKey}`);
      contextPairs.push(`title=${title}`);
      contextPairs.push(`type=${type}`);
      contextPairs.push(`genre=${genre}`);
      if (role) contextPairs.push(`role=${role}`);
      if (year) contextPairs.push(`year=${year}`);
      if (limit) contextPairs.push(`limit=${limit}`);

      const normalizedRole = slugify(role);
      let folder = "netflix/uploads";
      if (["trailer", "video"].includes(normalizedRole)) {
        folder = "netflix/movies/videos";
      } else if (["img", "imgtitle", "imgsm", "image", "poster", "thumbnail"].includes(normalizedRole)) {
        folder = "netflix/movies/images";
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder,
          tags,
          context: contextPairs.join("|"),
        },
        (error, result) => {
          if (error) {
            const message =
              error?.message ||
              error?.error?.message ||
              "Cloudinary upload failed.";
            console.error("Cloudinary upload error:", error);
            return res.status(500).json({ message });
          }

          return res.status(200).json({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );

      uploadStream.end(req.file.buffer);
    } catch (err) {
      console.error("Upload route error:", err);
      res.status(500).json({ message: err?.message || "Upload failed." });
    }
  });
});

module.exports = router;
