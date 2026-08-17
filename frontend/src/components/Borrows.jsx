import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLocation } from 'react-router-dom';

const Borrows = () => {
  const [records, setRecords] = useState([]);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignData, setAssignData] = useState({ username: '', bookId: '', dueDate: '' });
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);

  const location = useLocation();

  const fetchRecords = async (query = '') => {
    try {
      const url = query ? `/manager/borrows?search=${query}` : '/manager/borrows';
      const response = await api.get(url);
      setRecords(response.data);
    } catch (error) {
      console.error("Error fetching records", error);
    }
  };

  useEffect(() => {
    fetchRecords();
    const fetchUsersAndBooks = async () => {
      try {
        const [usersRes, booksRes] = await Promise.all([
          api.get('/user/get-all-users'),
          api.get('/manager/books')
        ]);
        setUsers(usersRes.data);
        setBooks(booksRes.data);
      } catch (error) {
        console.error("Error fetching users or books", error);
      }
    };
    fetchUsersAndBooks();
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
      <div className="dashboard-header" style={{ marginBottom: '1rem' }}>
        <h2 className="dashboard-title">Mượn Trả Gần Đây</h2>
        <div className="input-group" style={{ width: '350px', boxShadow: 'var(--shadow-sm)', borderRadius: '20px' }}>
          <span className="input-group-text" style={{ backgroundColor: 'white', borderRadius: '20px 0 0 20px', borderRight: 'none', color: 'var(--text-muted)' }}>
            🔍
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm sách hoặc người mượn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                fetchRecords(searchTerm);
              }
            }}
            style={{ borderRadius: '0 20px 20px 0', borderLeft: 'none', outline: 'none', boxShadow: 'none' }}
          />
        </div>
      </div>

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
                <select className="form-select" value={assignData.username} onChange={e => setAssignData({ ...assignData, username: e.target.value })} required>
                  <option value="">-- Select User --</option>
                  {users.filter(user => user.role !== 'MANAGER').map(user => (
                    <option key={user.id} value={user.username}>{user.username}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Book</label>
                <select className="form-select" value={assignData.bookId} onChange={e => setAssignData({ ...assignData, bookId: e.target.value })} required>
                  <option value="">-- Select Book --</option>
                  {books.filter(book => book.quantity > 0 || book.id === assignData.bookId).map(book => (
                    <option key={book.id} value={book.id}>{book.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Due Date</label>
                <input type="date" className="form-control" value={assignData.dueDate} onChange={e => setAssignData({ ...assignData, dueDate: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary me-2">Assign Book</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAssignForm(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      <div className="card-modern" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle" style={{ marginBottom: 0, width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'rgba(0,0,0,0.02)', textAlign: 'left' }}>
              <tr>
                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>Mã Phiếu (ID)</th>
                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>Tên Sách</th>
                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>Độc Giả</th>
                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>Ngày Mượn</th>
                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>Hạn Trả</th>
                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>Trạng Thái</th>
                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>#{record.id}</td>
                  <td style={{ padding: '1rem', fontWeight: '600' }}>{record.book?.name}</td>
                  <td style={{ padding: '1rem' }}>{record.user?.username}</td>
                  <td style={{ padding: '1rem' }}>{record.borrowDate}</td>
                  <td style={{ padding: '1rem' }}>{record.dueDate}</td>
                  <td style={{ padding: '1rem' }}>
                    {record.returnDate ? (
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>Đã Trả ({record.returnDate})</span>
                    ) : isOverdue(record.dueDate, record.returnDate) ? (
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>Quá Hạn</span>
                    ) : (
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>Đang Mượn</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {!record.returnDate && (
                      <button className="btn btn-sm btn-outline-primary" style={{ borderRadius: '8px' }} onClick={() => handleReturn(record.id)}>Nhận Trả</button>
                    )}
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Không tìm thấy phiếu mượn nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Borrows;
