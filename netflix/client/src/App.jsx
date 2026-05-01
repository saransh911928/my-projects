import { useEffect, useState } from "react";
import "./App.scss";
import Home from "./pages/home/Home";
import Register from "./pages/register/Register";
import Watch from "./pages/watch/Watch";
import Login from "./pages/login/Login";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Details from "./pages/details/Details";
import Account from "./pages/account/Account";

const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (err) {
    return null;
  }
};

const App = () => {
  const [user, setUser] = useState(getStoredUser);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const handleLogin = (authUser) => {
    setUser(authUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const protectedRoute = (element) => (user ? element : <Navigate to="/login" replace />);

  return (
    <Router>
      <Routes>
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />}
        />
        <Route path="/" element={protectedRoute(<Home onLogout={handleLogout} />)} />
        <Route path="/movies" element={protectedRoute(<Home type="movie" onLogout={handleLogout} />)} />
        <Route
          path="/series"
          element={protectedRoute(<Home type="series" onLogout={handleLogout} />)}
        />
        <Route
          path="/new-and-popular"
          element={protectedRoute(<Home type="movie" onLogout={handleLogout} />)}
        />
        <Route path="/my-list" element={protectedRoute(<Home onLogout={handleLogout} />)} />
        <Route path="/watch" element={protectedRoute(<Watch />)} />
        <Route path="/details/:id" element={protectedRoute(<Details />)} />
        <Route
          path="/account"
          element={protectedRoute(<Account onLogout={handleLogout} user={user} />)}
        />
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
      </Routes>
    </Router>
  );
};

export default App;
