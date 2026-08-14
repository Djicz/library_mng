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
      <h2>{message || 'Welcome to Manager Dashboard'}</h2>
      <p>Use the navigation bar to manage books and borrows.</p>

      {jobMessage && <div className="alert alert-success">{jobMessage}</div>}
      {jobError && <div className="alert alert-danger">{jobError}</div>}

      <div className="card mt-4">
        <div className="card-body">
          <h5 className="card-title">System Actions</h5>
          <p className="card-text">Manually trigger the Notification Job to send out alerts immediately.</p>
          <button onClick={triggerJob} className="btn btn-warning btn-lg">Run Notification Job Now</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
