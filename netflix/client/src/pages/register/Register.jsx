import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./register.scss";

const API_URL = "http://localhost:9000/api/";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleStart = () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }

    const suggestedUsername = trimmedEmail.split("@")[0]?.trim() || "";
    setUsername((prev) => prev || suggestedUsername);
    setError("");
    setIsStarted(true);
  };

  const handleFinish = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !username.trim() || !password) {
      setError("Email, username, and password are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post(`${API_URL}auth/register`, {
        email: email.trim(),
        username: username.trim(),
        password,
      });
      navigate("/login", { replace: true, state: { email: email.trim() } });
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed. Try another email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register">
      <div className="top">
        <div className="wrapper">
          <img
            className="logo"
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png"
            alt=""
          />
          <Link to="/login" className="link">
            <button className="loginButton">Sign In</button>
          </Link>
        </div>
      </div>
      <div className="container">
        <h1>Unlimited movies, TV shows, and more.</h1>
        <h2>Watch anywhere. Cancel anytime.</h2>
        <p>
          Ready to watch? Enter your email to create or restart your membership.
        </p>
        {!isStarted ? (
          <div className="input">
            <input
              type="email"
              placeholder="email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <button className="registerButton" onClick={handleStart}>
              Get Started
            </button>
          </div>
        ) : (
          <form className="inputColumn" onSubmit={handleFinish}>
            <div className="input">
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>
            <div className="input">
              <input
                type="password"
                placeholder="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button className="registerButton" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Start"}
              </button>
            </div>
            {error ? <p className="registerError">{error}</p> : null}
            <button
              type="button"
              className="backButton"
              onClick={() => setIsStarted(false)}
            >
              Change Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
