import React from "react";
import "./listItem.scss";
import { PlayArrow, Add, ThumbUpAltOutlined, ThumbDownOutlined } from "@mui/icons-material";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:9000/api/";

export default function ListItem({ index, item }) {
  const [isHovered, setIsHovered] = useState(false);
  const [movie, setMovie] = useState({});

  useEffect(() => {
    const getMovie = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
        const res = await axios.get(`${API_URL}movies/find/${item}`, {
          headers: {
            token: token ? `Bearer ${token}` : "",
          },
        });
        setMovie(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getMovie();
  }, [item]);

  return (
    <Link to="/watch" state={{ movie }} className="link">
      <div
        className="listItem"
        style={{ left: isHovered && index * 225 - 50 + index * 2.5 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {movie.img ? <img src={movie.img} alt={movie.title || "Movie"} /> : null}
        {isHovered && (
          <>
            {movie.trailer ? <video src={movie.trailer} autoPlay={true} loop /> : null}
            <div className="itemInfo">
              <div className="icons">
                <PlayArrow className="icon" />
                <Add className="icon" />
                <ThumbUpAltOutlined className="icon" />
                <ThumbDownOutlined className="icon" />
              </div>
              <div className="itemInfoTop">
                <span>{movie.duration}</span>
                <span className="limit">+{movie.limit}</span>
                <span>{movie.year}</span>
              </div>
              <div className="desc">{movie.desc}</div>
              <div className="genre">{movie.genre}</div>
            </div>
          </>
        )}
      </div>
    </Link>
  );
}
