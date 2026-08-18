import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Categories from './components/Categories';
import Books from './components/Books';
import Borrows from './components/Borrows';
import MyBooks from './components/MyBooks';
import Notifications from './components/Notifications';
import Navigation from './components/Navigation';
import 'bootstrap/dist/css/bootstrap.min.css';

const PrivateRoute = ({ children, roleRequired }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" />;
  if (roleRequired && role !== roleRequired) return <Navigate to="/login" />;

  return (
    <div className="app-layout">
      <Navigation />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/manager/dashboard" element={
          <PrivateRoute roleRequired="MANAGER">
            <Dashboard />
          </PrivateRoute>
        } />
        
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

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
