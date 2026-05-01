import  { useState } from "react";
import "./login.css";
import { AuthContext } from "../../context/authContext/AuthContext";
import { login } from "../../context/authContext/apiCalls";
import { useContext } from "react";
  
export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { isFetching, dispatch } = useContext(AuthContext);

  const handleLogin = (e) => {
    e.preventDefault();
      login({ email, password }, dispatch);
    console.log("Attempting login with email:", email, "and password:", password);
  };

  return (
    <div className="login"> 
        <form className="loginForm" onSubmit={handleLogin}>
            <input 
            type="text"
             placeholder="email" 
             className="loginInput" 
             value={email} 
             onChange={(e) => setEmail(e.target.value)} 
             />
            <input
             type="password" 
             placeholder="password"
             className="loginInput"
            value={password}
             onChange={(e) => setPassword(e.target.value)}
              />
            <button className="loginButton" type="submit" disabled={isFetching}>Login</button>
        </form>
     </div>
  );
}
