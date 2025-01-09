import React, { useCallback, useState } from "react";
import "../styles/Search.css";

const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

const UserSearch = () => {
    const [query, setQuery] = useState(""); // Trạng thái lưu nội dung tìm kiếm
    const [users, setUsers] = useState([]); // Trạng thái lưu danh sách người dùng
    const [loading, setLoading] = useState(false);

    const fetchUsers = async (value) => {
        if (value.trim() === "") {
            setUsers([]); // Xóa danh sách gợi ý nếu ô tìm kiếm trống
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:8080/search?name=${encodeURIComponent(value)}`
            );
            const data = await response.json();
            setUsers(data || []); // Backend trả về danh sách trực tiếp
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const debouncedFetchUsers = useCallback(debounce(fetchUsers, 300), []);

    const handleSearch = (e) => {
        const value = e.target.value;
        setQuery(value);
        debouncedFetchUsers(value);
    };

    return (
        <div className="user-search">
            <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                value={query}
                onChange={handleSearch}
                className="search-input"
            />
            {loading && <div className="loading">Đang tìm kiếm...</div>}
            {users.length > 0 && (
                <ul className="search-results">
                    {users.map((user, index) => (
                        <li key={index} className="search-item">
                            <img
                                src={user.user_avatar || "https://via.placeholder.com/40"}
                                alt="Avatar"
                                className="user-avatar"
                            />
                            <span>{user.user_nickname}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default UserSearch;
