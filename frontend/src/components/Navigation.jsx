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

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <span className="navbar-brand">Library System</span>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto">
            {role === 'MANAGER' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/manager/dashboard">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/manager/books">Manage Books</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/manager/borrows">Manage Borrows</Link>
                </li>
              </>
            )}
            {role === 'BORROWER' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/borrower/my-books">My Books</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/borrower/notifications">Notifications</Link>
                </li>
              </>
            )}
          </ul>
          <span className="navbar-text me-3">Welcome, {username}</span>
          <button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
