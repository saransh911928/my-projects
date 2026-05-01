import { Link, useHistory, useLocation } from "react-router-dom";
import "./product.css";
import { Publish } from "@material-ui/icons";
import { useContext, useState } from "react";
import { uploadFile } from "../../utils/uploadFile";
import { MovieContext } from "../../context/movieContext/MovieContext";
import { updateMovie } from "../../context/movieContext/apiCalls";

export default function Product() {
  const history = useHistory();
  const location = useLocation();
  const { dispatch, isFetching, error } = useContext(MovieContext);
  const movie = location.state?.movie || window.history.state?.state?.movie || {};
  const [movieData, setMovieData] = useState({
    title: movie.title || "",
    year: movie.year || "",
    limit: movie.limit || "",
    genre: movie.genre || "",
  });
  const [files, setFiles] = useState({
    img: null,
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
    setMovieData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: inputFiles } = e.target;
    setFiles((prev) => ({ ...prev, [name]: inputFiles[0] || null }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormError("");
    setUploadProgress(0);

    if (!movie._id) {
      setFormError("Missing movie id. Open this page from Movies list.");
      return;
    }

    try {
      const payload = {};

      if (movieData.title !== (movie.title || "")) payload.title = movieData.title;
      if (movieData.year !== (movie.year || "")) payload.year = movieData.year;
      if (String(movieData.genre) !== String(movie.genre || "")) payload.genre = movieData.genre;
      if (String(movieData.limit) !== String(movie.limit || "")) {
        payload.limit = movieData.limit === "" ? undefined : Number(movieData.limit);
      }

      const selectedFiles = Object.entries(files).filter(([, file]) => file);
      let completedUploads = 0;

      if (selectedFiles.length > 0) setIsUploadingFiles(true);
      const resolvedTitle = movieData.title || movie.title || `movie-${movie._id || Date.now()}`;
      const movieKey = slugify(resolvedTitle);
      const type = movie.isSeries ? "series" : "movie";

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
            title: resolvedTitle,
            type,
            genre: movieData.genre || movie.genre,
            year: movieData.year || movie.year,
            limit: movieData.limit || movie.limit,
          }
        );

        completedUploads += 1;
        setUploadProgress(Math.round((completedUploads / selectedFiles.length) * 100));
      }

      setIsUploadingFiles(false);

      if (Object.keys(payload).length === 0) {
        setFormError("No changes detected.");
        return;
      }

      await updateMovie(movie._id, payload, dispatch);

      history.push("/movies");
    } catch (err) {
      setFormError(err?.message || "Failed to update movie.");
      setIsUploadingFiles(false);
    }
  };

  return (
    <div className="product">
      <div className="productTitleContainer">
        <h1 className="productTitle">Movie</h1>
        <Link to="/newproduct">
          <button className="productAddButton">Create</button>
        </Link>
      </div>
      <div className="productTop">
          <div className="productTopRight">
              <div className="productInfoTop">
                  <img src={movie.img || ""} alt="" className="productInfoImg" />
                  <span className="productName">{movie.title || ""}</span>
              </div>
              <div className="productInfoBottom">
                  <div className="productInfoItem">
                      <span className="productInfoKey">id:</span>
                      <span className="productInfoValue">{movie._id || ""}</span>
                  </div>
                  <div className="productInfoItem">
                      <span className="productInfoKey">genre:</span>
                      <span className="productInfoValue">{movie.genre || ""}</span>
                  </div>
                  <div className="productInfoItem">
                      <span className="productInfoKey">year:</span>
                      <span className="productInfoValue">{movie.year || ""}</span>
                  </div>
                  <div className="productInfoItem">
                      <span className="productInfoKey">limit:</span>
                      <span className="productInfoValue">{movie.limit || ""}</span>
                  </div>
              </div>
          </div>
      </div>
      <div className="productBottom">
          <form className="productForm" onSubmit={handleUpdate}>
              <div className="productFormLeft">
                  <label>Movie Title</label>
                  <input
                    type="text"
                    name="title"
                    value={movieData.title}
                    onChange={handleChange}
                  />
                  <label>Year</label>
                  <input
                    type="text"
                    name="year"
                    value={movieData.year}
                    onChange={handleChange}
                  />
                  <label>Limit</label>
                  <input
                    type="number"
                    name="limit"
                    value={movieData.limit}
                    onChange={handleChange}
                  />
                  <label>Genre</label>
                  <input
                    type="text"
                    name="genre"
                    value={movieData.genre}
                    onChange={handleChange}
                  />
                  <label>Trailer</label>
                  <input type="file" name="trailer" onChange={handleFileChange} />
                  <label>Video</label>
                  <input type="file" name="video" onChange={handleFileChange} />
              </div>
              <div className="productFormRight">
                  <div className="productUpload">
                      <img src={movie.img || ""} alt="" className="productUploadImg" />
                      <label htmlFor="img">
                          <Publish/>
                      </label>
                      <input
                        type="file"
                        id="img"
                        name="img"
                        onChange={handleFileChange}
                        style={{display:"none"}}
                      />
                  </div>
                  <button className="productButton" type="submit" disabled={isUploadingFiles || isFetching}>
                    {isUploadingFiles ? `Uploading Media... ${uploadProgress}%` : isFetching ? "Saving Changes..." : "Update"}
                  </button>
              </div>
              {isUploadingFiles ? <span>Upload Progress: {uploadProgress}%</span> : null}
              {formError ? <span>{formError}</span> : null}
              {!formError && error ? <span>Failed to update movie. Please try again.</span> : null}
          </form>
      </div>
    </div>
  );
}
