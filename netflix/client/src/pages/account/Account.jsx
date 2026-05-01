import { Link, useNavigate } from "react-router-dom";
import "./account.scss";

export default function Account({ onLogout = () => {}, user = null }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="accountPage">
      <div className="accountCard">
        <h1>Account</h1>
        <p>Email: {user?.email || "-"}</p>
        <p>Username: {user?.username || "-"}</p>
        <div className="accountActions">
          <Link to="/" className="link">
            <button type="button">Back to Home</button>
          </Link>
          <button type="button" className="logoutButton" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

