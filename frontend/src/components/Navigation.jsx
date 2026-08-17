import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navigation = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const currentPath = window.location.pathname;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">TV</div>
        <div>
          <div className="sidebar-title">Thư Viện Số</div>
          <div className="sidebar-subtitle">Deep Blue Edition</div>
        </div>
      </div>

      <div className="sidebar-nav">
        {role === 'MANAGER' && (
          <>
            <Link className={`nav-link-item ${currentPath.includes('/dashboard') ? 'active' : ''}`} to="/manager/dashboard">
              📊 Tổng quan
            </Link>
            <Link className={`nav-link-item ${currentPath.includes('/books') ? 'active' : ''}`} to="/manager/books">
              📚 Quản lý Đầu Sách
            </Link>
            <Link className={`nav-link-item ${currentPath.includes('/borrows') ? 'active' : ''}`} to="/manager/borrows">
              🔄 Mượn / Trả Sách
            </Link>
          </>
        )}
        {role === 'BORROWER' && (
          <>
            <Link className={`nav-link-item ${currentPath.includes('/my-books') ? 'active' : ''}`} to="/borrower/my-books">
              📖 Sách của tôi
            </Link>
            <Link className={`nav-link-item ${currentPath.includes('/notifications') ? 'active' : ''}`} to="/borrower/notifications">
              🔔 Thông báo
            </Link>
          </>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">{username ? username.charAt(0).toUpperCase() : 'U'}</div>
          <div>
            <div className="user-info-name">{username}</div>
            <div className="user-info-role">{role === 'MANAGER' ? 'Thủ thư' : 'Độc giả'}</div>
          </div>
        </div>
        <button className="btn-logout" onClick={handleLogout} title="Đăng xuất">
          🚪
        </button>
      </div>
    </aside>
  );
};

export default Navigation;
