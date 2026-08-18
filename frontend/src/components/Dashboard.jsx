import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Dashboard = () => {
  const [message, setMessage] = useState('');
  const [jobMessage, setJobMessage] = useState('');
  const [jobError, setJobError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/manager/dashboard');
        setMessage(response.data.message);
      } catch (error) {
        console.error("Error fetching dashboard", error);
      }
    };
    fetchDashboard();
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

      <div className="card-modern">
        <h3 style={{marginBottom: '1rem', color: 'var(--primary)'}}>Thao Tác Nhanh</h3>
        <p style={{color: 'var(--text-muted)', margin: '1rem 0'}}>Chào mừng bạn đến với trang quản trị. Sử dụng menu bên trái để thực hiện các thao tác quản lý Người dùng, Đầu Sách và Mượn/Trả.</p>
        {/* We keep the original action trigger just in case */}
        <button onClick={triggerJob} className="btn btn-primary mt-2" style={{backgroundColor: 'var(--primary)', borderColor: 'var(--primary)'}}>Chạy Job Thông Báo Ngay</button>
      </div>
    </div>
  );
};

export default Dashboard;
