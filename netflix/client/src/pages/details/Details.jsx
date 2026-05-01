import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import "./details.scss";

const API_URL = "http://localhost:9000/api/";

export default function Details() {
  const location = useLocation();
  const { id } = useParams();
  const [movie, setMovie] = useState(location.state?.movie || null);
  const [error, setError] = useState("");

  useEffect(() => {
    const getMovieById = async () => {
      if (movie || !id) return;

      try {
        const res = await axios.get(`${API_URL}movies/find/${id}`);
        setMovie(res.data);
      } catch (err) {
        setError("Failed to load movie details.");
      }
    };

    getMovieById();
  }, [id, movie]);

  if (!movie && error) {
    return (
      <div className="detailsPage">
        <div className="detailsOverlay" />
        <div className="detailsContent">
          <h1>Movie Details</h1>
          <p>{error}</p>
          <Link to="/" className="link detailsBackLink">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="detailsPage">
        <div className="detailsOverlay" />
        <div className="detailsContent">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="detailsPage">
      {movie?.img ? <img src={movie.img} alt={movie.title || "Movie"} className="detailsBg" /> : null}
      <div className="detailsOverlay" />
      <div className="detailsContent">
        <h1>{movie?.title || "Movie Details"}</h1>
        <p>{movie?.desc || "No description available."}</p>
        <div className="detailsMeta">
          <span>Genre: {movie?.genre || "-"}</span>
          <span>Year: {movie?.year || "-"}</span>
          <span>Limit: +{movie?.limit || "-"}</span>
        </div>
        <div className="detailsActions">
          <Link to="/watch" state={{ movie }} className="link">
            <button type="button">Play</button>
          </Link>
          <Link to="/" className="link">
            <button type="button" className="secondaryButton">
              Back
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
