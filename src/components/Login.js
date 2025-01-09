import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import '../styles/Login.css';

function Login() {
    const {  login,} = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCreateAccount = () => {
        navigate('/register');
    };

    return (
        <div className="login-container">
            <div className="login-left">
                <h1 className="login-logo">My Social App</h1>
                <h2 className="login-subtitle">
                    Kết nối với bạn bè và thế giới xung quanh bạn trên My Social App.
                </h2>
            </div>
            <div className="login-right">
                <div className="login-form-container">
                    <form className="login-form" onSubmit={handleSubmit}>
                        <input
                            type="email"
                            className="login-input"
                            placeholder="Email hoặc số điện thoại"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            className="login-input"
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button type="submit" className="login-button">
                            Đăng nhập
                        </button>
                        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
                        <div className="forgot-password">
                            <button type="button" className="forgot-password-btn">Quên mật khẩu?</button>
                        </div>  
                        <div className="divider"></div>
                        <button 
                            type="button" 
                            className="create-account-button"
                            onClick={handleCreateAccount}
                        >
                            Tạo tài khoản mới
                        </button>
                    </form>
                </div>
            </div>
            
        </div>
    );
}

export default Login;