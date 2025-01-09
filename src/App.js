import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import './App.css';
import Login from './components/Login'; // Giao diện đăng nhập
import PostList from './components/PostList'; // Trang chính
import Message from './components/Message';
import Register from './components/Register';
import Profile from './components/Profile'
// Bảo vệ các route cần đăng nhập
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Route cho trang đăng nhập */}
          <Route path="/login" element={<Login />} />
          
          {/* Route cần đăng nhập */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div className='container'>
                  <PostList />
                </div>
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={<Profile/>}/>
          <Route path="/messages" element={<Message />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
