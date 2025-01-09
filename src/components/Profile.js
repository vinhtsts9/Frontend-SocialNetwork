// src/components/Profile.js
import React from 'react';
import { useAuth } from '../AuthContext';

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return <p>Không tìm thấy thông tin người dùng!</p>;
  }

  return (
    <div className="profile-container">
      <h2>Hồ sơ của {user.username}</h2>
      <img
        src={user.avatar || 'https://via.placeholder.com/150'}
        alt="Avatar"
        className="profile-avatar"
      />
      <p>Email: {user.email}</p>
      <p>Giới thiệu: {user.bio || 'Chưa có thông tin cá nhân'}</p>
    </div>
  );
};

export default Profile;
