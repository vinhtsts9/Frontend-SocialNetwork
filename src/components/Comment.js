const Comment = ({ comment }) => {
    return (
        <div className="comment">
            <p>{comment.CommentContent}</p>
            {/* Hiển thị bình luận con nếu có */}
            {comment.CommentLeft !== 0 && (
                <div className="comment-replies">
                    {/* Tìm và hiển thị các comment con có CommentParentId bằng Id của comment hiện tại */}
                    {comment.replies && comment.replies.map((reply) => (
                        <Comment key={reply.Id} comment={reply} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Comment;
