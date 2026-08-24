import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Categories from './components/Categories';
import Books from './components/Books';
import Borrows from './components/Borrows';
import Requests from './components/Requests';
import Reservations from './components/Reservations';
import BorrowerBooks from './components/BorrowerBooks';
import MyBooks from './components/MyBooks';
import Notifications from './components/Notifications';
import Navigation from './components/Navigation';
import Profile from './components/Profile';
import { Calendar } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

const TopNavbar = () => {
  const location = useLocation();
  const path = location.pathname;

  const getPageTitle = () => {
    if (path.includes('/dashboard')) return 'Tổng quan Hệ Thống';
    if (path.includes('/requests')) return 'Yêu Cầu Mượn Sách';
    if (path.includes('/reservations')) return 'Quản lý Đặt Trước Sách';
    if (path.includes('/users')) return 'Quản lý Người Dùng';
    if (path.includes('/categories')) return 'Quản lý Thể Loại Sách';
    if (path === '/manager/books') return 'Quản lý Đầu Sách';
    if (path.includes('/borrows')) return 'Quản lý Mượn / Trả Sách';
    if (path === '/borrower/books') return 'Kho Sách & Mượn Sách';
    if (path.includes('/my-books')) return 'Sách Đang Mượn Của Tôi';
    if (path.includes('/notifications')) return 'Hộp Thư Thông Báo';
    if (path.includes('/profile')) return 'Hồ Sơ Tài Khoản';
    return 'Hệ Thống Quản Lý Thư Viện';
  };

  const todayStr = new Intl.DateTimeFormat('vi-VN', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }).format(new Date());

  return (
    <header className="top-navbar">
      <div className="top-navbar-title">
        <span>{getPageTitle()}</span>
      </div>
      <div className="top-navbar-actions">
        <div className="badge-status badge-status-neutral" style={{ padding: '0.45rem 0.9rem', fontSize: '0.825rem' }}>
          <Calendar size={14} style={{ color: 'var(--primary-light)' }} />
          <span>{todayStr}</span>
        </div>
      </div>
    </header>
  );
};

const PrivateRoute = ({ children, roleRequired }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" />;
  if (roleRequired && role !== roleRequired) return <Navigate to="/login" />;

  return (
    <div className="app-layout">
      <Navigation />
      <div className="main-wrapper">
        <TopNavbar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Manager Routes */}
        <Route path="/manager/dashboard" element={
          <PrivateRoute roleRequired="MANAGER">
            <Dashboard />
          </PrivateRoute>
        } />
        
        <Route path="/manager/requests" element={
          <PrivateRoute roleRequired="MANAGER">
            <Requests />
          </PrivateRoute>
        } />

        <Route path="/manager/reservations" element={<Navigate to="/manager/requests" />} />

        <Route path="/manager/users" element={
          <PrivateRoute roleRequired="MANAGER">
            <Users />
          </PrivateRoute>
        } />
        
        <Route path="/manager/books" element={
          <PrivateRoute roleRequired="MANAGER">
            <Books />
          </PrivateRoute>
        } />

        <Route path="/manager/categories" element={
          <PrivateRoute roleRequired="MANAGER">
            <Categories />
          </PrivateRoute>
        } />

        <Route path="/manager/borrows" element={
          <PrivateRoute roleRequired="MANAGER">
            <Borrows />
          </PrivateRoute>
        } />

        {/* Borrower Routes */}
        <Route path="/borrower/books" element={
          <PrivateRoute roleRequired="BORROWER">
            <BorrowerBooks />
          </PrivateRoute>
        } />

        <Route path="/borrower/my-books" element={
          <PrivateRoute roleRequired="BORROWER">
            <MyBooks />
          </PrivateRoute>
        } />

        <Route path="/borrower/notifications" element={
          <PrivateRoute roleRequired="BORROWER">
            <Notifications />
          </PrivateRoute>
        } />

        {/* Shared Profile */}
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
