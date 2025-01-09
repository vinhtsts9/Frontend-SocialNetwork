import React, { useEffect, useState } from "react";
import Post from "./Post";
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Post.css';
import PostModal from "./PostModal";
import UserSearch from "./UserSearch";
import { getCookie } from "../utils/cookie";

const PostList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const user = getCookie("token")
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch("http://localhost:8080/v1/2024/timeline/all");
                const data = await response.json();
                console.log(data);
                const parsedPosts = data.data.map((post) => {
                    return {
                        ...post,
                        image_paths: post.image_paths || []
                    };
                });
                setPosts(parsedPosts);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching posts:", error);
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handlePost = async (formData) => {
        formData.forEach((value, key) => {
            console.log(key, value);
        });
        try {
            const response = await fetch("http://localhost:8080/v1/2024/post/create", {
                method: "POST",
                body: formData, // Gửi formData
            });

            if (!response.ok) {
                throw new Error("Đăng bài thất bại");
            }

            const newPost = await response.json(); // Nhận bài viết mới từ server
            setPosts((prevPosts) => [newPost, ...prevPosts]); // Thêm bài viết mới vào danh sách
        } catch (error) {
            console.error("Error posting:", error);
        }
    };

    return (
        <>
            <header className="header">
                <h1 className="header-logo">My Social App</h1>
                <UserSearch/>
                <div className="header-actions">
                    <button 
                        className="header-button messenger" 
                        onClick={() => navigate('/messages')}
                        title="Nhắn tin"
                    >
                        ✉️
                    </button>
                    <button 
                        className="header-button logout" 
                        onClick={handleLogout}
                        title="Đăng xuất"
                    >
                        ⏻
                    </button>
                </div>
            </header>
            
            <div className="posts-container">
                {/* Phần tạo bài viết mới */}
                <div className="create-post">
                    <div className="create-post-header">
                        <img
                            src={user?.avatar || 'https://via.placeholder.com/50'}
                            alt="Avatar"
                            className="post-avatar"
                            onClick={() => navigate('/profile')}
                            style={{cursor:"pointer"}}
                            />
                        <input 
                            type="text"
                            className="create-post-input"
                            placeholder="Bạn đang nghĩ gì?"
                            onClick={() => {setIsModalOpen(true)}}
                        />
                    </div>
                    <div className="create-post-actions">
                        <button className="post-type-button">
                            📷 Ảnh/Video
                        </button>
                        <button className="post-type-button">
                            😊 Cảm xúc
                        </button>
                        <button className="post-type-button">
                            📍 Check in
                        </button>
                    </div>
                </div>

                {/* Danh sách bài viết */}
                {loading ? (
                    <div className="loading">Đang tải bài viết...</div>
                ) : posts.length === 0 ? (
                    <div className="no-posts">Chưa có bài viết nào</div>
                ) : (
                    posts.map((post) => (
                        <div key={post.id}>
                            <Post post={post} />
                        </div>
                    ))
                )}
            </div>
            <PostModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onPost={handlePost} 
            />
        </>
    );
};

export default PostList;


