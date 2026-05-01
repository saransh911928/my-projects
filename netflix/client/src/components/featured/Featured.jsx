import React, { useEffect, useState } from "react";
import "./featured.scss";
import { PlayArrow, InfoOutlined } from "@mui/icons-material";
import axios from "axios";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:9000/api/";
const FEATURE_REFRESH_MS = 12000;

function Featured({ type, genre, setGenre = () => {} }) {
  const [content, setContent] = useState(null);

  useEffect(() => {
    const getRandomContent = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
        const params = new URLSearchParams();

        if (type) params.append("type", type);
        if (genre) params.append("genre", genre);

        const queryString = params.toString();
        const url = `${API_URL}movies/random${queryString ? `?${queryString}` : ""}`;

        const res = await axios.get(url, {
          headers: {
            token: token ? `Bearer ${token}` : "",
          },
        }); 
        setContent(res.data?.[0] || null);
      } catch (err) {
        console.log(err);
        setContent(null);
      }
    };

    getRandomContent();
    const timer = setInterval(getRandomContent, FEATURE_REFRESH_MS);

    return () => clearInterval(timer);
  }, [type, genre]);

  const handleGenreChange = (e) => {
    const value = e.target.value;
    setGenre(value || null);
  };

  return (
    <div className="featured">
      {type && (
        <div className="category">
          <span>{type === "movie" ? "Movies" : "Series"}</span>
          <select name="genre" id="genre" value={genre || ""} onChange={handleGenreChange}>
            <option value="">Genre</option>
            <option value="adventure">Adventure</option>
            <option value="comedy">Comedy</option>
            <option value="crime">Crime</option>
            <option value="fantasy">Fantasy</option>
            <option value="historical">Historical</option>
            <option value="horror">Horror</option>
            <option value="romance">Romance</option>
            <option value="sci-fi">Sci-fi</option>
            <option value="thriller">Thriller</option>
            <option value="western">Western</option>
            <option value="animation">Animation</option>
            <option value="drama">Drama</option>
            <option value="documentary">Documentary</option>
          </select>
        </div>
      )}
      {content?.img ? <img src={content.img} alt="Featured" /> : null}
      <div className="info">
        {content?.imgTitle ? <img src={content.imgTitle} alt="" /> : null}
        <span className="desc">
          {/* Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae
          adipisci repellendus eum quasi illo, velit numquam, maxime tempora
          sint deleniti, aliquid qui? Facilis, adipisci! Ratione hic repudiandae
          temporibus eum earum? */}
          {content?.desc || ""}
        </span>
        <div className="buttons">
          {content ? (
            <Link to="/watch" state={{ movie: content }} className="link">
              <button className="play">
                <PlayArrow />
                <span>Play</span>
              </button>
            </Link>
          ) : (
            <button className="play" disabled>
              <PlayArrow />
              <span>Play</span>
            </button>
          )}
          {content?._id ? (
            <Link to={`/details/${content._id}`} state={{ movie: content }} className="link">
              <button className="more">
                <InfoOutlined />
                <span>Info</span>
              </button>
            </Link>
          ) : (
            <button className="more" disabled>
              <InfoOutlined />
              <span>Info</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Featured;
