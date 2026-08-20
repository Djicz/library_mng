import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLocation } from 'react-router-dom';
import { 
  Repeat, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  User, 
  BookOpen, 
  X, 
  ArrowRight,
  Send
} from 'lucide-react';

const Borrows = () => {
  const [records, setRecords] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignData, setAssignData] = useState({ username: '', bookId: '', dueDate: '' });
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [actionSuccess, setActionSuccess] = useState('');

  const location = useLocation();

  const fetchRecords = async (query = '') => {
    try {
      const url = query ? `/manager/borrows?search=${encodeURIComponent(query)}` : '/manager/borrows';
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
          api.get('/manager/user/get-all-users'),
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
      setShowAssignModal(true);
      setAssignData(prev => ({ ...prev, bookId }));
    }
  }, [location]);

  const triggerSuccess = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleReturn = async (id, bookName) => {
    if (window.confirm(`Xác nhận độc giả đã trả sách "${bookName || ''}"?`)) {
      try {
        await api.post(`/manager/borrows/return/${id}`);
        triggerSuccess(`Đã ghi nhận trả sách thành công!`);
        fetchRecords(searchTerm);
      } catch (error) {
        console.error("Error returning book", error);
        alert(error.response?.data?.message || "Lỗi khi nhận trả sách.");
      }
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/manager/borrows/assign', assignData);
      setAssignData({ username: '', bookId: '', dueDate: '' });
      setShowAssignModal(false);
      triggerSuccess('Tạo phiếu mượn sách thành công!');
      fetchRecords(searchTerm);
    } catch (err) {
      setError(err.response?.data || "Lỗi khi gán mượn sách.");
    }
  };

  const isOverdue = (dueDate, returnDate) => {
    if (returnDate) return false;
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  };

  // Stats calculation
  const totalBorrowing = records.filter(r => !r.returnDate && !isOverdue(r.dueDate, r.returnDate)).length;
  const totalOverdue = records.filter(r => isOverdue(r.dueDate, r.returnDate)).length;
  const totalReturned = records.filter(r => r.returnDate).length;

  return (
    <div className="animate-fade-in">
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Quản Lý Mượn / Trả Sách
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
            Theo dõi tình trạng mượn sách, gia hạn và thu hồi sách từ độc giả
          </p>
        </div>

        <div>
          <button 
            className="btn-primary-gradient" 
            onClick={() => setShowAssignModal(true)}
          >
            <Plus size={18} />
            <span>Tạo Phiếu Mượn Mới</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="badge-status badge-status-success w-100 mb-3" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
          <CheckCircle2 size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Summary Mini Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card-glass" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--warning-bg)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Đang Mượn</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalBorrowing}</div>
          </div>
        </div>

        <div className="card-glass" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Quá Hạn</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--danger)' }}>{totalOverdue}</div>
          </div>
        </div>

        <div className="card-glass" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Đã Hoàn Tất</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>{totalReturned}</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card-glass mb-4" style={{ padding: '1rem 1.25rem' }}>
        <div className="search-input-group" style={{ maxWidth: '100%' }}>
          <Search size={18} className="search-icon-inside" />
          <input
            type="text"
            className="search-input-field"
            placeholder="Tìm kiếm theo tên sách hoặc tài khoản độc giả (Nhấn Enter để lọc)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                fetchRecords(searchTerm);
              }
            }}
          />
        </div>
      </div>

      {/* Table Records */}
      <div className="table-modern-wrapper">
        <table className="table-modern">
          <thead>
            <tr>
              <th style={{ width: '100px' }}>Mã Phiếu</th>
              <th>Đầu Sách</th>
              <th>Độc Giả</th>
              <th>Ngày Mượn</th>
              <th>Hạn Trả</th>
              <th>Trạng Thái</th>
              <th style={{ textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {records.map(record => (
              <tr key={record.id}>
                <td>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-muted)' }}>
                    #{record.id}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <BookOpen size={16} style={{ color: 'var(--primary-light)', flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {record.book?.name}
                    </span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                      {(record.user?.username || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                      @{record.user?.username}
                    </span>
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {record.borrowDate}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isOverdue(record.dueDate, record.returnDate) ? 'var(--danger)' : 'var(--text-secondary)' }}>
                    {record.dueDate}
                  </span>
                </td>
                <td>
                  {record.returnDate ? (
                    <span className="badge-status badge-status-success">
                      <CheckCircle2 size={12} />
                      Đã trả ({record.returnDate})
                    </span>
                  ) : isOverdue(record.dueDate, record.returnDate) ? (
                    <span className="badge-status badge-status-danger">
                      <AlertTriangle size={12} />
                      Quá Hạn
                    </span>
                  ) : (
                    <span className="badge-status badge-status-warning">
                      <Clock size={12} />
                      Đang mượn
                    </span>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {!record.returnDate ? (
                    <button 
                      className="btn-primary-gradient" 
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
                      onClick={() => handleReturn(record.id, record.book?.name)}
                    >
                      <CheckCircle2 size={14} />
                      <span>Nhận Trả</span>
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Đã hoàn tất
                    </span>
                  )}
                </td>
              </tr>
            ))}

            {records.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <Repeat size={42} style={{ opacity: 0.3 }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>Không tìm thấy phiếu mượn sách nào.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Assign Book */}
      {showAssignModal && (
        <div className="modal-backdrop-custom" onClick={() => setShowAssignModal(false)}>
          <div className="modal-dialog-custom" onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom">
              <div className="modal-title-custom">
                <Send size={20} style={{ color: 'var(--primary-light)' }} />
                <span>Tạo Phiếu Gán Mượn Sách</span>
              </div>
              <button 
                onClick={() => setShowAssignModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit}>
              <div className="modal-body-custom">
                {error && (
                  <div className="badge-status badge-status-danger w-100 mb-3" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                    <AlertTriangle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="form-group-custom">
                  <label className="form-label-custom">Độc Giả Mượn Sách <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <select 
                    className="form-select-custom" 
                    value={assignData.username} 
                    onChange={e => setAssignData({ ...assignData, username: e.target.value })} 
                    required
                  >
                    <option value="">-- Chọn tài khoản độc giả --</option>
                    {users.filter(user => user.role !== 'MANAGER' && user.status === 'AVAILABLE').map(user => (
                      <option key={user.id} value={user.username}>
                        {user.displayName ? `${user.displayName} (@${user.username})` : user.username}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group-custom">
                  <label className="form-label-custom">Đầu Sách <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <select 
                    className="form-select-custom" 
                    value={assignData.bookId} 
                    onChange={e => setAssignData({ ...assignData, bookId: e.target.value })} 
                    required
                  >
                    <option value="">-- Chọn đầu sách --</option>
                    {books.filter(book => book.quantity > 0 || book.id === assignData.bookId).map(book => (
                      <option key={book.id} value={book.id}>
                        {book.name} (Tồn kho: {book.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group-custom">
                  <label className="form-label-custom">Hạn Trả Sách (Due Date) <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input 
                    type="date" 
                    className="form-control-custom" 
                    value={assignData.dueDate} 
                    onChange={e => setAssignData({ ...assignData, dueDate: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              <div className="modal-footer-custom">
                <button 
                  type="button" 
                  className="btn-secondary-modern" 
                  onClick={() => setShowAssignModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-primary-gradient">
                  <span>Xác Nhận Cho Mượn</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Borrows;
