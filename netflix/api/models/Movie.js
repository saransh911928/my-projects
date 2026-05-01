const mongoose = require("mongoose");

const MovieSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    desc: { type: String, required: true },
    img: { type: String },
    imgTitle: { type: String },
    imgSm: { type: String },
    trailer: { type: String },
    video: { type: String },
    year: { type: String },
    limit: { type: Number },
    genre: { type: String },
    isSeries: { type: Boolean, default: false },
    cloudinaryMeta: {
      imgPublicId: { type: String },
      imgTitlePublicId: { type: String },
      imgSmPublicId: { type: String },
      trailerPublicId: { type: String },
      videoPublicId: { type: String },
      movieKey: { type: String },
    },
},
{ timestamps: true }
);  

module.exports = mongoose.model("Movie", MovieSchema);
