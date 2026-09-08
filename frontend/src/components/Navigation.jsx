import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FolderTree, 
  BookOpen, 
  Repeat, 
  BookmarkCheck, 
  Bell, 
  LogOut, 
  Library,
  ShieldCheck,
  UserCheck,
  Inbox
} from 'lucide-react';
import api from '../services/api';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [profile, setProfile] = useState({
    username: localStorage.getItem('username') || '',
    role: localStorage.getItem('role') || '',
    displayName: localStorage.getItem('username') || 'Người dùng'
  });

  const [pendingTotalCount, setPendingTotalCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile');
        const user = response.data?.data || response.data;
        if (user) {
          setProfile(prev => ({
            ...prev,
            displayName: user.displayName || user.username,
            role: user.role
          }));
          if (user.id && !localStorage.getItem('userId')) {
            localStorage.setItem('userId', user.id);
          }
        }
      } catch (err) {
        console.error("Error fetching profile for navigation", err);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    // If manager, fetch total pending count from RequestController
    if (profile.role === 'MANAGER') {
      const fetchCounts = async () => {
        try {
          const reqRes = await api.get('/requests').catch(() => ({ data: [] }));
          const list = Array.isArray(reqRes.data) ? reqRes.data : [];
          setPendingTotalCount(list.length);
        } catch (err) {
          // Ignore
        }
      };
      fetchCounts();
    }
  }, [profile.role, currentPath]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isManager = profile.role === 'MANAGER';

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Library size={24} />
          </div>
          <div>
            <div className="sidebar-title">Thư Viện Số</div>
            <div className="sidebar-subtitle">Deep Blue Pro</div>
          </div>
        </div>

        <div className="sidebar-nav">
          <div className="nav-section-title">
            {isManager ? 'QUẢN TRỊ HỆ THỐNG' : 'KHÔNG GIAN ĐỘC GIẢ'}
          </div>

          {isManager ? (
            <>
              <Link 
                className={`nav-link-item ${currentPath.includes('/dashboard') ? 'active' : ''}`} 
                to="/manager/dashboard"
              >
                <div className="nav-icon"><LayoutDashboard size={20} /></div>
                <span>Tổng quan</span>
              </Link>

              <Link 
                className={`nav-link-item ${currentPath.includes('/requests') ? 'active' : ''}`} 
                to="/manager/requests"
              >
                <div className="nav-icon" style={{ position: 'relative' }}>
                  <Inbox size={20} />
                  {pendingTotalCount > 0 && (
                    <span 
                      style={{ 
                        position: 'absolute', 
                        top: '-4px', 
                        right: '-6px', 
                        background: 'var(--warning)', 
                        color: '#0f172a', 
                        fontSize: '0.65rem', 
                        fontWeight: 800, 
                        borderRadius: '10px', 
                        padding: '1px 5px',
                        lineHeight: 1
                      }}
                    >
                      {pendingTotalCount}
                    </span>
                  )}
                </div>
                <span>Yêu Cầu Mượn</span>
              </Link>

              <Link 
                className={`nav-link-item ${currentPath.includes('/users') ? 'active' : ''}`} 
                to="/manager/users"
              >
                <div className="nav-icon"><Users size={20} /></div>
                <span>Quản lý Người dùng</span>
              </Link>

              <Link 
                className={`nav-link-item ${currentPath.includes('/categories') ? 'active' : ''}`} 
                to="/manager/categories"
              >
                <div className="nav-icon"><FolderTree size={20} /></div>
                <span>Quản lý Thể loại</span>
              </Link>

              <Link 
                className={`nav-link-item ${currentPath === '/manager/books' ? 'active' : ''}`} 
                to="/manager/books"
              >
                <div className="nav-icon"><BookOpen size={20} /></div>
                <span>Quản lý Đầu Sách</span>
              </Link>

              <Link 
                className={`nav-link-item ${currentPath.includes('/borrows') ? 'active' : ''}`} 
                to="/manager/borrows"
              >
                <div className="nav-icon"><Repeat size={20} /></div>
                <span>Mượn / Trả Sách</span>
              </Link>
            </>
          ) : (
            <>
              <Link 
                className={`nav-link-item ${currentPath === '/borrower/books' ? 'active' : ''}`} 
                to="/borrower/books"
              >
                <div className="nav-icon"><BookOpen size={20} /></div>
                <span>Kho Sách & Mượn Sách</span>
              </Link>
              <Link 
                className={`nav-link-item ${currentPath.includes('/my-books') ? 'active' : ''}`} 
                to="/borrower/my-books"
              >
                <div className="nav-icon"><BookmarkCheck size={20} /></div>
                <span>Sách Của Tôi</span>
              </Link>
              <Link 
                className={`nav-link-item ${currentPath.includes('/notifications') ? 'active' : ''}`} 
                to="/borrower/notifications"
              >
                <div className="nav-icon"><Bell size={20} /></div>
                <span>Thông Báo</span>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="sidebar-footer">
        <Link to="/profile" className="user-profile-chip" title="Xem hồ sơ">
          <div className="user-avatar-circle">
            {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-info-text">
            <div className="user-name">{profile.displayName}</div>
            <div className="user-role-badge">
              {isManager ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <ShieldCheck size={11} /> Thủ thư
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <UserCheck size={11} /> Độc giả
                </span>
              )}
            </div>
          </div>
        </Link>
        <button className="btn-logout-icon" onClick={handleLogout} title="Đăng xuất">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

export default Navigation;
