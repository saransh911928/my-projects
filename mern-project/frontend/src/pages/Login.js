import { useState } from "react";
import { useLogin } from "../hooks/useLogin";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emptyFields, setEmptyFields] = useState([]);
    const {login, isLoading, error} = useLogin();
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate fields
        let empty = [];
        if (!email) empty.push('email');
        if (!password) empty.push('password');

        if (empty.length > 0) {
            setEmptyFields(empty);
            return;
        }

        setEmptyFields([]);
        await login(email, password);
    }

    return (
        <form className="Login" onSubmit={handleSubmit}>
            <h3>Login</h3>  

            <label>Email:</label>   
            <input 
                type="email" 
                onChange={(e) => setEmail(e.target.value)} 
                value={email}
                className={emptyFields.includes('email') ? 'error' : ''}
            />  

            <label>Password:</label>   
            <input 
                type="password" 
                onChange={(e) => setPassword(e.target.value)} 
                value={password}
                className={emptyFields.includes('password') ? 'error' : ''}
            />

            <button disabled={isLoading}>Login</button>
            {error && <div className="error">{error}</div>}
        </form>
    )
}

export default Login;