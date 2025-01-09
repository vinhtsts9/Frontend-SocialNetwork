import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import '../styles/Register.css';

function Register() {
    const { registerStep1, verifyOTP, completeRegister } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: "",
        otp: "",
        password: "",
        confirmPassword: "",
        nickname: "",
        mobile: "",
        gender: 1,
        avatar: "",
    });
    const [error, setError] = useState(null);
    const [token, setToken] = useState(null);

    const handleStep1 = async (e) => {
        e.preventDefault();
        try {
            await registerStep1(formData.email);
            setStep(2);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        try {
            const result = await verifyOTP(formData.email, formData.otp);
            console.log(result);
            setToken(result.data.token);
            setStep(3);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleFinalStep = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp");
            return;
        }
        try {
            const data = {
                userToken: token,
                userPassword: formData.password,
                userNickname: formData.nickname,
                userMobile: formData.mobile,
                userGender: formData.gender,
                userAvatar: formData.avatar
            }
            await completeRegister(data);
            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    const renderStep = () => {
        switch(step) {
            case 1:
                return (
                    <form onSubmit={handleStep1}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                        <button type="submit">Gửi mã OTP</button>
                    </form>
                );
            case 2:
                return (
                    <form onSubmit={handleVerifyOTP}>
                        <input
                            type="text"
                            placeholder="Nhập mã OTP"
                            value={formData.otp}
                            onChange={(e) => setFormData({...formData, otp: e.target.value})}
                            required
                        />
                        <button type="submit">Xác thực OTP</button>
                    </form>
                );
            case 3:
                return (
                    <form onSubmit={handleFinalStep}>
                        <input
                            type="password"
                            placeholder="Mật khẩu"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Xác nhận mật khẩu"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Nickname"
                            value={formData.nickname}
                            onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Số điện thoại"
                            value={formData.mobile}
                            onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                        />
                        <select 
                            value={formData.gender}
                            onChange={(e) => setFormData({...formData, gender: parseInt(e.target.value)})}
                        >
                            <option value={1}>Nam</option>
                            <option value={2}>Nữ</option>
                        </select>
                        <button type="submit">Hoàn tất đăng ký</button>
                    </form>
                );
            default:
                return null;
        }
    };

    return (
        <div className="register-container">
            <div className="register-form-container">
                <h1>Đăng ký tài khoản</h1>
                {error && <p className="error-message">{error}</p>}
                {renderStep()}
                <button
                    type="button"
                    className="back-to-login"
                    onClick={() => navigate('/login')}
                >
                    Đã có tài khoản? Đăng nhập
                </button>
            </div>
        </div>
    );
}

export default Register; 