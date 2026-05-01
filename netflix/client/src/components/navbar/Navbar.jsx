import { useState, useEffect } from "react";
import "./navbar.scss";
import { ArrowDropDown, Search, Notifications } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ onLogout = () => {} }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.pageYOffset > 0);
    };

    window.addEventListener("scroll", handleScroll);

    // cleanup to avoid memory leaks
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate("/login", { replace: true });
  };

  return (
    <div className={isScrolled ? "navbar scrolled" : "navbar"}>
      <div className="container">
        <div className="left">
          <Link to="/" className="link">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png"
              alt="Netflix Logo"
            />
          </Link>

          <Link to="/" className="link">
            <span>Homepage</span>
          </Link>
          <Link to="/series" className="link">
            <span>Series</span>
          </Link>
          <Link to="/movies" className="link">
            <span>Movies</span>
          </Link>
          <Link to="/new-and-popular" className="link">
            <span>New and Popular</span>
          </Link>
          <Link to="/my-list" className="link">
            <span>My List</span>
          </Link>
        </div>

        <div className="right">
          <Search className="icon" />
          <span>KID</span>
          <Notifications className="icon" />

          <img
            src="https://images.pexels.com/photos/6899260/pexels-photo-6899260.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
            alt="Profile"
          />

          <div className="profile">
            <ArrowDropDown className="icon" />
            <div className="options">
              <Link to="/account" className="optionLink">
                Settings
              </Link>
              <button type="button" className="optionButton" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
