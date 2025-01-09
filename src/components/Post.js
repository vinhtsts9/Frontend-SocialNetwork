import React, { useState, useEffect, useCallback } from 'react';
import '../styles/Post.css';
import { AuthProvider, useAuth } from '../AuthContext';
import { getCookie } from '../utils/cookie';

const Post = ({ post }) => {
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([]);
    const [replyParentId, setReplyParentId] = useState(null);
    const [commentReplies, setCommentReplies] = useState({});
    const [showReplies, setShowReplies] = useState({});
    const [commentCounts, setCommentCounts] = useState({});
    const user = getCookie("token")
    // Không cần parse content nữa vì đã được parse từ PostList
    const { image_paths, id, user_nickname, created_at, title, likes } = post;
    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    // Lấy danh sách bình luận khi component mount
    const fetchComments = useCallback((parentId = null) => {
        const url = parentId === null
            ? `http://localhost:8080/v1/2024/comment/${id}/root`
            : `http://localhost:8080/v1/2024/comment/${id}/${parentId}`;

        fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${user}`
            }
        })
            .then((response) => response.json())  
            .then((data) => {
                console.log(`comment ${data}`);
                const validComments = data?.data ? data.data.filter((comment) => !comment.Isdeleted) : [];
                setComments(validComments);
                
                // Lưu số lượng replies của mỗi comment
                const counts = {};
                validComments.forEach(comment => {
                    counts[comment.comment_id] = comment.reply_count;
                });
                setCommentCounts(counts);
            })
            .catch((error) => console.error("Error fetching comments:", error));
    }, []);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    // Thêm bình luận hoặc trả lời
    const handleComment = (e) => {
        e.preventDefault();
        if (commentText.trim() === "") return;
        console.log(`user_nickname ${user.userNickname}`)
        console.log(`reply parent ${replyParentId}`)

        fetch(`http://localhost:8080/v1/2024/comment/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user}`
            },
            body: JSON.stringify({ 
                comment_content: commentText, 
                comment_parentId: replyParentId,
                post_id: id,
                user_nickname: user 
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                setComments((prev) => [...prev, data.data]);
                setCommentText("");
                setReplyParentId(null);
            })
            .catch((error) => console.error("Error adding comment:", error));
    };

    // Xử lý trả lời bình luận
    const handleReply = (parentId) => {
        setReplyParentId(parentId);
    };

    // Thêm hàm để lấy replies cho một comment
    const fetchReplies = useCallback((commentId) => {
        fetch(`http://localhost:8080/v1/2024/comment/${id}/${commentId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user}`
            }
        }
)
            .then((response) => response.json())
            .then((data) => {
                const validReplies = data?.data ? data.data.filter((reply) => !reply.isDeleted) : [];
                setCommentReplies(prev => ({
                    ...prev,
                    [commentId]: validReplies
                }));
            })
            .catch((error) => console.error("Error fetching replies:", error));
    }, [id]);

    // Hàm xử lý việc hiển thị/ẩn replies
    const toggleReplies = (commentId) => {
        setShowReplies(prev => {
            const newState = { ...prev, [commentId]: !prev[commentId] };
            if (newState[commentId] && !commentReplies[commentId]) {
                fetchReplies(commentId);
            }
            return newState;
        });
    };
    return (
        <div className="post">
            <div className="post-header">
                <div className="post-avatar"></div>
                <div>
                    <div className="post-username">{user_nickname || 'Người dùng'}</div>
                    <div className="post-time">{formatDate(created_at)}</div>
                </div>
            </div>
            
            <div className="post-content">
                <div className="post-description">
                    {title || ''}
                </div>
                
                {image_paths && image_paths.length > 0 && image_paths.map((url, index) => (
                    <img 
                        key={index}
                        src={url} 
                        alt="Nội dung bài viết" 
                        className="post-image"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                        }}
                    />
                ))}
            </div>

            <div className="post-actions">
                <button className="action-button">
                    👍 Thích
                </button>
                <button className="action-button">
                    💬 Bình luận
                </button>
                <button className="action-button">
                    ↪️ Chia sẻ
                </button>
            </div>
            
            <div className="post-likes">
                {likes || 0} lượt thích
            </div>

            <div className="comments-section">
                <form onSubmit={handleComment} className="comment-input-container">
                    <div className="post-avatar"></div>
                    <input
                        type="text"
                        className="comment-input"
                        placeholder={replyParentId ? "Viết phản hồi..." : "Viết bình luận..."}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                    />
                </form>

                <div className="comment-list">
                    {comments.map(comment => (
                        <div key={comment.comment_id} className="comment">
                            <div className="post-avatar"></div>
                            <div>
                                <div className="comment-content">
                                    <div className="comment-user">{comment.user_nickname}</div>
                                    <div className="comment-text">{comment.comment_content}</div>
                                </div>
                                <div className="comment-actions">
                                    <span className="comment-action">Thích</span>
                                    <span className="comment-action" onClick={() => handleReply(comment.comment_id)}>
                                        Phản hồi
                                    </span>
                                    {commentCounts[comment.comment_id] > 0 && (
                                        <span 
                                            className="comment-action reply-toggle"
                                            onClick={() => toggleReplies(comment.comment_id)}
                                        >
                                            {showReplies[comment.comment_id] ? 
                                                `🔽 Ẩn ${commentCounts[comment.comment_id]} phản hồi` : 
                                                `🔼 Xem ${commentCounts[comment.comment_id]} phản hồi`
                                            }
                                        </span>
                                    )}
                                    <span className="comment-time">{formatDate(comment.created_at)}</span>
                                </div>

                                {/* Hiển thị phần replies */}
                                {showReplies[comment.comment_id] && commentReplies[comment.comment_id] && (
                                    <div className="comment-replies">
                                        {commentReplies[comment.comment_id].map(reply => (
                                            <div key={reply.comment_id} className="comment reply">
                                                <div className="post-avatar"></div>
                                                <div>
                                                    <div className="comment-content">
                                                        <div className="comment-user">{reply.user_nickname}</div>
                                                        <div className="comment-text">{reply.comment_content}</div>
                                                    </div>
                                                    <div className="comment-actions">
                                                        <span className="comment-action">Thích</span>
                                                        <span className="comment-action" onClick={() => handleReply(reply.comment_id)}>
                                                            Phản hồi
                                                        </span>
                                                        <span>{formatDate(comment.created_at)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Post;