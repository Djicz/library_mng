import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Dashboard = () => {
  const [message, setMessage] = useState('');
  const [jobMessage, setJobMessage] = useState('');
  const [jobError, setJobError] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/manager/dashboard');
        setMessage(response.data.message);
      } catch (error) {
        console.error("Error fetching dashboard", error);
      }
    };
    const fetchUsers = async () => {
      try {
        const response = await api.get('/user/get-all-users');
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };
    fetchDashboard();
    fetchUsers();
  }, []);

  const triggerJob = async () => {
    try {
      const response = await api.post('/manager/dashboard/trigger-job');
      setJobMessage(response.data.message);
      setJobError('');
    } catch (error) {
      setJobError(error.response?.data?.error || 'Error triggering job');
      setJobMessage('');
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard Tổng Quan Hệ Thống</h1>
      </div>

      {jobMessage && <div className="alert alert-success" style={{borderRadius: 'var(--border-radius)'}}>{jobMessage}</div>}
      {jobError && <div className="alert alert-danger" style={{borderRadius: 'var(--border-radius)'}}>{jobError}</div>}

      <div className="card-modern" style={{marginBottom: '2rem'}}>
        <h3 style={{marginBottom: '1rem', color: 'var(--primary)'}}>👥 Danh Sách Người Dùng</h3>
        <div className="table-responsive">
          <table className="table table-hover align-middle" style={{marginBottom: 0, width: '100%', borderCollapse: 'collapse'}}>
            <thead style={{backgroundColor: 'rgba(0,0,0,0.02)', textAlign: 'left'}}>
              <tr>
                <th style={{padding: '1rem', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)'}}>ID</th>
                <th style={{padding: '1rem', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)'}}>Tài Khoản</th>
                <th style={{padding: '1rem', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)'}}>Vai Trò</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{borderBottom: '1px solid var(--border-color)'}}>
                  <td style={{padding: '1rem', color: 'var(--text-muted)'}}>#{user.id}</td>
                  <td style={{padding: '1rem', fontWeight: '600'}}>{user.username}</td>
                  <td style={{padding: '1rem'}}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      backgroundColor: user.role === 'MANAGER' ? 'rgba(30, 58, 138, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                      color: user.role === 'MANAGER' ? 'var(--primary)' : 'var(--text-muted)'
                    }}>
                      {user.role === 'MANAGER' ? 'Quản lý' : 'Độc giả'}
                    </span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="3" style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>Không có dữ liệu người dùng.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card-modern">
        <h3 style={{marginBottom: '1rem', color: 'var(--primary)'}}>Thao Tác Nhanh</h3>
        <p style={{color: 'var(--text-muted)', marginBottom: '1.5rem'}}>Sử dụng menu bên trái để thực hiện các thao tác quản lý Đầu Sách và Mượn/Trả.</p>
        {/* We keep the original action trigger just in case */}
        <button onClick={triggerJob} className="btn btn-primary" style={{backgroundColor: 'var(--primary)', borderColor: 'var(--primary)'}}>Run Notification Job Now</button>
      </div>
    </div>
  );
};

export default Dashboard;
