import React, { useState } from 'react';

import '../styles/PostModal.css'; // Tạo file CSS cho modal

const PostModal = ({ isOpen, onClose, onPost }) => {
    const [postTitle, setPostTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);


    const handlePost = () => {
        if (postTitle.trim() || postContent.trim() || selectedImages.length > 0) {
            if (postTitle.trim() || selectedImages.length > 0) {
                const postData = {
                    user_id: 3, // Thay đổi theo ID người dùng hiện tại
                    title: postTitle,
                    image_paths: [], // Lưu trữ đường dẫn ảnh sẽ được trả về từ backend
                    is_published: true, // Hoặc false tùy thuộc vào logic của bạn
                    metadata: JSON.stringify({ /* Thêm metadata nếu cần */ }),
                };
        
                const formData = new FormData();
                formData.append("user_id", postData.user_id);
                formData.append("title", postData.title);
                formData.append("is_published", postData.is_published);
                formData.append("metadata", postData.metadata);
        
                // Thêm hình ảnh vào formData
                selectedImages.forEach(image => {
                    formData.append("image_paths", image); // Gửi hình ảnh cục bộ
                });
            

            // Gửi formData qua hàm onPost
            onPost(formData);

            // Reset trạng thái sau khi gửi
            setPostTitle('');
            setPostContent('');
            setSelectedImages([]);
            onClose();
        }}
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedImages(files); // Lưu nhiều file hình ảnh
    };

    if (!isOpen) return null; // Nếu modal không mở, không render gì cả

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Tạo bài viết mới</h2>
                <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="Tiêu đề bài viết"
                    className="post-title-input"
                />
                <input type="file" accept="image/*" multiple onChange={handleImageChange} />
                {selectedImages.length > 0 && selectedImages.map((image, index) => (
                    <img key={index} src={URL.createObjectURL(image)} alt="Selected" style={{ width: '100%', margin: '10px 0' }} />
                ))}
                <div className="modal-actions">
                    <button onClick={handlePost} className="post-button">Đăng</button>
                    <button onClick={onClose} className="cancel-button">Hủy</button>
                </div>
            </div>
        </div>
    );
};

export default PostModal; 