import { ArrowBackOutlined } from "@mui/icons-material";
import "./watch.scss";
import { Link, useLocation } from "react-router-dom";

export default function Watch() {
  const location = useLocation();
  const movie = location.state?.movie || location.movie || {};

  return (
    <div className="watch">
      <Link to="/" className="link">
        <div className="back">
          <ArrowBackOutlined />
          Home
        </div>
      </Link>
      {movie.video ? (
        <video className="video" autoPlay progress controls src={movie.video} />
      ) : (
        <div className="watchFallback">No video found for this title.</div>
      )}
    </div>
  );
}
