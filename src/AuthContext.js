
import React, { createContext, useState, useContext, useEffect } from "react";
import {setCookie,getCookie,eraseCookie} from './utils/cookie'

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Lấy thông tin người dùng từ localStorage khi ứng dụng tải lần đầu
        const storedUser = getCookie("token");
        return storedUser ? storedUser : null; // Parse chuỗi JSON thành đối tượng
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch("http://localhost:8080/v1/2024/user/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ user_account: email, user_password: password }),
            });

            const data = await response.json();
            

            if (response.ok) {
                const token = data.data.token;
                console.log("Data:", token);
                setCookie("token", token,2)
                setUser(token)
                return data;
            } else {
                throw new Error(data.message || "Đăng nhập thất bại");
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout =  () => {
        setUser(null);
        eraseCookie("token")
        // Cập nhật lại danh sách người dùng nếu cần
    };

    const register = async (email, password, fullName) => {
        try {
            // Gọi API đăng ký của bạn ở đây
            const response = await fetch('http://localhost:8080/v1/2024/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, fullName }),
            });

            if (!response.ok) {
                throw new Error('Đăng ký thất bại');
            }

            const data = await response.json();
            setUser(data.token);
            setCookie('token', data.token);
        } catch (error) {
            throw new Error(error.message);
        }
    };

    const registerStep1 = async (email) => {
        try {
            const response = await fetch("http://localhost:8080/v1/2024/user/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    verify_key: email,
                    verify_type: 1,
                    verify_purpose: "REGISTER"
                }),
            });

            if (!response.ok) {
                throw new Error('Gửi OTP thất bại');
            }
        } catch (error) {
            throw new Error(error.message);
        }
    };

    const verifyOTP = async (email, otp) => {
        try {
            const response = await fetch("http://localhost:8080/v1/2024/user/verify_account", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    verify_key: email,
                    verify_code: otp
                }),
            });

            if (!response.ok) {
                throw new Error('Mã OTP không hợp lệ');
            }

            return await response.json();
        } catch (error) {
            throw new Error(error.message);
        }
    };

    const completeRegister = async (userData) => {
        try {
            console.log(userData)
            const response = await fetch("http://localhost:8080/v1/2024/user/update_pass_register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_token: userData.userToken,
                    user_password: userData.userPassword,
                    user_nickname: userData.userNickname,
                    user_avatar: userData.userAvatar,
                    user_mobile: userData.userMobile,
                    user_gender: userData.userGender
                }),
            });

            if (!response.ok) {
                throw new Error('Đăng ký thất bại');
            }

            return await response.json();
        } catch (error) {
            throw new Error(error.message);
        }
    };
    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            logout, 
            registerStep1, 
            verifyOTP, 
            completeRegister,
            isLoading,
            register,
        }}>
            {children}
        </AuthContext.Provider>
    );
    
};
    export const useAuth = () => useContext(AuthContext);