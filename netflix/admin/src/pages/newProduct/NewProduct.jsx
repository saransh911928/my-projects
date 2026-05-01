import "./newProduct.css";
import { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import { uploadFile } from "../../utils/uploadFile";
import { MovieContext } from "../../context/movieContext/MovieContext";
import { createMovie } from "../../context/movieContext/apiCalls";

export default function NewProduct() {
  const history = useHistory();
  const { dispatch, isFetching, error } = useContext(MovieContext);
  const [movie, setMovie] = useState({
    title: "",
    desc: "",
    year: "",
    genre: "",
    limit: "",
    isSeries: false,
  });
  const [files, setFiles] = useState({
    img: null,
    imgTitle: null,
    imgSm: null,
    trailer: null,
    video: null,
  });
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formError, setFormError] = useState("");
  const slugify = (value) =>
    String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMovie((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: inputFiles } = e.target;
    setFiles((prev) => ({ ...prev, [name]: inputFiles[0] || null }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setUploadProgress(0);

    try {
      const payload = { ...movie };
      const selectedFiles = Object.entries(files).filter(([, file]) => file);
      let completedUploads = 0;

      if (selectedFiles.length > 0) setIsUploadingFiles(true);
      const movieKey = slugify(payload.title || `movie-${Date.now()}`);
      const type = payload.isSeries ? "series" : "movie";

      for (const [field, file] of selectedFiles) {
        payload[field] = await uploadFile(
          file,
          (filePercent) => {
            const overallPercent = Math.round(
              ((completedUploads + filePercent / 100) / selectedFiles.length) * 100
            );
            setUploadProgress(overallPercent);
          },
          {
            role: field,
            movieKey,
            title: payload.title,
            type,
            genre: payload.genre,
            year: payload.year,
            limit: payload.limit,
          }
        );

        completedUploads += 1;
        setUploadProgress(Math.round((completedUploads / selectedFiles.length) * 100));
      }

      setIsUploadingFiles(false);

      await createMovie(payload, dispatch);

      history.push("/movies");
    } catch (err) {
      setFormError(err?.message || "Failed to create movie.");
      setIsUploadingFiles(false);
    }
  };

  return (
    <div className="newProduct">
      <h1 className="addProductTitle">New Movie</h1>
      <form className="addProductForm" onSubmit={handleCreate}>
        <div className="addProductItem">
          <label>Image</label>
          <input type="file" name="img" onChange={handleFileChange} />
        </div>
        <div className="addProductItem">
          <label>Title Image</label>
          <input type="file" name="imgTitle" onChange={handleFileChange} />
        </div>
        <div className="addProductItem">
          <label>Thumbnail Image</label>
          <input type="file" name="imgSm" onChange={handleFileChange} />
        </div>
        <div className="addProductItem">
          <label>Title</label>
          <input type="text" placeholder="John Wick" name="title" onChange={handleChange} required />
        </div>
        <div className="addProductItem">
          <label>Description</label>
          <input type="text" placeholder="description" name="desc" onChange={handleChange} required />
        </div>
        <div className="addProductItem">
          <label>Year</label>
          <input type="text" placeholder="Year" name="year" onChange={handleChange} />
        </div>
        <div className="addProductItem">
          <label>Genre</label>
          <input type="text" placeholder="Genre" name="genre" onChange={handleChange} />
        </div>
        <div className="addProductItem">
          <label>Limit</label>
          <input type="number" placeholder="16" name="limit" onChange={handleChange} />
        </div>
        <div className="addProductItem">
          <label>Is Series</label>
          <select
            name="isSeries"
            onChange={(e) =>
              setMovie((prev) => ({ ...prev, isSeries: e.target.value === "true" }))
            }
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>
        <div className="addProductItem">
          <label>Trailer</label>
          <input type="file" name="trailer" onChange={handleFileChange} />
        </div>
        <div className="addProductItem">
          <label>Video</label>
          <input type="file" name="video" onChange={handleFileChange} />
        </div>
        {isUploadingFiles ? <span>Upload Progress: {uploadProgress}%</span> : null}
        {formError ? <span>{formError}</span> : null}
        {!formError && error ? <span>Failed to create movie. Please try again.</span> : null}
        <button className="addProductButton" type="submit" disabled={isUploadingFiles || isFetching}>
          {isUploadingFiles ? `Uploading Media... ${uploadProgress}%` : isFetching ? "Saving Movie..." : "Create"}
        </button>
      </form>
    </div>
  );
}
