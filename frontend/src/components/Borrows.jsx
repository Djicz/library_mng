import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLocation } from 'react-router-dom';

const Borrows = () => {
  const [records, setRecords] = useState([]);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignData, setAssignData] = useState({ username: '', bookId: '', dueDate: '' });
  const [error, setError] = useState('');
  
  const location = useLocation();

  const fetchRecords = async () => {
    try {
      const response = await api.get('/manager/borrows');
      setRecords(response.data);
    } catch (error) {
      console.error("Error fetching records", error);
    }
  };

  useEffect(() => {
    fetchRecords();
    const queryParams = new URLSearchParams(location.search);
    const bookId = queryParams.get('assignBookId');
    if (bookId) {
      setShowAssignForm(true);
      setAssignData(prev => ({ ...prev, bookId }));
    }
  }, [location]);

  const handleReturn = async (id) => {
    if (window.confirm('Mark this book as returned?')) {
      try {
        await api.post(`/manager/borrows/return/${id}`);
        fetchRecords();
      } catch (error) {
        console.error("Error returning book", error);
      }
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/manager/borrows/assign', assignData);
      setAssignData({ username: '', bookId: '', dueDate: '' });
      setShowAssignForm(false);
      setError('');
      fetchRecords();
    } catch (err) {
      setError(err.response?.data || "Error assigning book");
    }
  };

  const isOverdue = (dueDate, returnDate) => {
    if (returnDate) return false;
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  };

  return (
    <div>
      <h2>Borrowing Records</h2>
      
      {!showAssignForm && (
        <button className="btn btn-primary mb-3" onClick={() => setShowAssignForm(true)}>Assign Book Manually</button>
      )}

      {showAssignForm && (
        <div className="card mb-4">
          <div className="card-header">Assign Book to User</div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleAssignSubmit}>
              <div className="mb-3">
                <label className="form-label">Username of Borrower</label>
                <input type="text" className="form-control" value={assignData.username} onChange={e => setAssignData({...assignData, username: e.target.value})} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Book ID</label>
                <input type="text" className="form-control" value={assignData.bookId} onChange={e => setAssignData({...assignData, bookId: e.target.value})} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Due Date</label>
                <input type="date" className="form-control" value={assignData.dueDate} onChange={e => setAssignData({...assignData, dueDate: e.target.value})} required />
              </div>
              <button type="submit" className="btn btn-primary me-2">Assign Book</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAssignForm(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Book Name</th>
            <th>Borrower</th>
            <th>Borrow Date</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {records.map(record => (
            <tr key={record.id}>
              <td>{record.id}</td>
              <td>{record.book?.name}</td>
              <td>{record.user?.username}</td>
              <td>{record.borrowDate}</td>
              <td>{record.dueDate}</td>
              <td>
                {record.returnDate ? (
                  <span className="text-success">Returned on {record.returnDate}</span>
                ) : isOverdue(record.dueDate, record.returnDate) ? (
                  <span className="text-danger fw-bold">Not Returned (Overdue)</span>
                ) : (
                  <span className="text-warning">Borrowing</span>
                )}
              </td>
              <td>
                {!record.returnDate && (
                  <button className="btn btn-success btn-sm" onClick={() => handleReturn(record.id)}>Mark Returned</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Borrows;
