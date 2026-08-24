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

  // Autocomplete states
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [bookSearchTerm, setBookSearchTerm] = useState('');
  const [userOptions, setUserOptions] = useState([]);
  const [bookOptions, setBookOptions] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showBookDropdown, setShowBookDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const userDropdownRef = React.useRef(null);
  const bookDropdownRef = React.useRef(null);

  const location = useLocation();

  const fetchRecords = async (query = '') => {
    try {
      const cleanQuery = (query || '').trim().replace(/^@/, '');
      const url = cleanQuery ? `/manager/borrows?search=${encodeURIComponent(cleanQuery)}` : '/manager/borrows';
      const response = await api.get(url);
      setRecords(response.data || []);
    } catch (error) {
      console.error("Error fetching records", error);
    }
  };

  // Initial load for records and modal options
  useEffect(() => {
    fetchRecords();
    const fetchUsersAndBooks = async () => {
      try {
        const [usersRes, booksRes] = await Promise.all([
          api.get('/manager/user/get-all-users'),
          api.get('/books')
        ]);
        setUsers(usersRes.data || []);
        setBooks(booksRes.data || []);
      } catch (error) {
        console.error("Error fetching users or books", error);
      }
    };
    fetchUsersAndBooks();
  }, []);

  // Handle URL query parameter assignBookId
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const bookId = queryParams.get('assignBookId');
    if (bookId && books.length > 0) {
      setShowAssignModal(true);
      setAssignData(prev => ({ ...prev, bookId }));
      const found = books.find(b => b.id === bookId);
      if (found) {
        setSelectedBook(found);
        setBookSearchTerm(found.name);
      }
    }
  }, [location.search, books]);

  // Debounced auto-search when typing
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecords(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) setShowUserDropdown(false);
      if (bookDropdownRef.current && !bookDropdownRef.current.contains(event.target)) setShowBookDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter and Fetch users on search term change
  useEffect(() => {
    // 1. Instant local filter
    const term = userSearchTerm.trim().toLowerCase();
    const localFiltered = users.filter(u => {
      if (u.role === 'MANAGER' || u.status !== 'AVAILABLE') return false;
      if (!term) return true;
      const uName = (u.username || '').toLowerCase();
      const dName = (u.displayName || '').toLowerCase();
      return uName.includes(term) || dName.includes(term);
    });
    setUserOptions(localFiltered);

    // 2. Debounced API search for server sync
    const fetchUsersDebounced = async () => {
      try {
        const response = await api.get('/manager/user/get-user-by-name', { params: { name: userSearchTerm.trim() } });
        const validUsers = (response.data || []).filter(u => u.role !== 'MANAGER' && u.status === 'AVAILABLE');
        setUserOptions(validUsers);
      } catch (error) {
        console.error("Error searching users", error);
      }
    };
    const timer = setTimeout(fetchUsersDebounced, 250);
    return () => clearTimeout(timer);
  }, [userSearchTerm, users]);

  // Filter and Fetch books on search term change
  useEffect(() => {
    // 1. Instant local filter
    const term = bookSearchTerm.trim().toLowerCase();
    const localFiltered = books.filter(b => {
      if (b.quantity <= 0 && b.id !== assignData.bookId) return false;
      if (!term) return true;
      const bName = (b.name || '').toLowerCase();
      const cName = (b.category?.name || '').toLowerCase();
      return bName.includes(term) || cName.includes(term);
    });
    setBookOptions(localFiltered);

    // 2. Debounced API search for server sync
    const fetchBooksDebounced = async () => {
      try {
        const response = await api.get('/books/search', { params: { name: bookSearchTerm.trim() } });
        const validBooks = (response.data || []).filter(b => b.quantity > 0 || b.id === assignData.bookId);
        setBookOptions(validBooks);
      } catch (error) {
        console.error("Error searching books", error);
      }
    };
    const timer = setTimeout(fetchBooksDebounced, 250);
    return () => clearTimeout(timer);
  }, [bookSearchTerm, books, assignData.bookId]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setAssignData(prev => ({ ...prev, username: user.username }));
    setUserSearchTerm(user.displayName ? `${user.displayName} (@${user.username})` : user.username);
    setShowUserDropdown(false);
  };

  const handleSelectBook = (book) => {
    setSelectedBook(book);
    setAssignData(prev => ({ ...prev, bookId: book.id }));
    setBookSearchTerm(book.name);
    setShowBookDropdown(false);
  };

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
      setUserSearchTerm('');
      setBookSearchTerm('');
      setSelectedUser(null);
      setSelectedBook(null);
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
        <div className="search-input-group" style={{ maxWidth: '100%', position: 'relative' }}>
          <Search size={18} className="search-icon-inside" />
          <input
            type="text"
            className="search-input-field"
            placeholder="Tìm kiếm theo tài khoản độc giả (ví dụ: testuser, @testuser)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingRight: searchTerm ? '2.5rem' : '1rem' }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px'
              }}
              title="Xóa tìm kiếm"
            >
              <X size={16} />
            </button>
          )}
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

                {/* Reader Autocomplete Field */}
                <div className="form-group-custom" ref={userDropdownRef}>
                  <label className="form-label-custom">
                    Độc Giả Mượn Sách <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  
                  <div className="autocomplete-wrapper">
                    <div className="autocomplete-input-box">
                      <User size={17} className="input-icon-left" />
                      <input
                        type="text"
                        className="form-control-custom"
                        placeholder="Gõ tên hoặc username độc giả..."
                        value={userSearchTerm}
                        onChange={(e) => {
                          setUserSearchTerm(e.target.value);
                          setShowUserDropdown(true);
                          if (selectedUser && e.target.value !== (selectedUser.displayName || selectedUser.username)) {
                            setSelectedUser(null);
                            setAssignData(prev => ({ ...prev, username: '' }));
                          }
                        }}
                        onFocus={() => setShowUserDropdown(true)}
                        required={!assignData.username}
                      />
                      {userSearchTerm && (
                        <button 
                          type="button" 
                          className="btn-clear-input"
                          onClick={() => {
                            setUserSearchTerm('');
                            setSelectedUser(null);
                            setAssignData(prev => ({ ...prev, username: '' }));
                            setShowUserDropdown(true);
                          }}
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    {showUserDropdown && (
                      <div className="autocomplete-dropdown">
                        {userOptions.length > 0 ? (
                          userOptions.map(user => {
                            const isSelected = assignData.username === user.username;
                            const initial = (user.displayName || user.username || 'U').charAt(0).toUpperCase();
                            return (
                              <div 
                                key={user.id} 
                                className={`autocomplete-item ${isSelected ? 'selected' : ''}`}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSelectUser(user);
                                }}
                                onClick={() => handleSelectUser(user)}
                              >
                                <div className="autocomplete-item-main">
                                  <div className="autocomplete-avatar">
                                    {initial}
                                  </div>
                                  <div className="autocomplete-item-text">
                                    <span className="autocomplete-title">
                                      {user.displayName || user.username}
                                    </span>
                                    <span className="autocomplete-subtitle">
                                      @{user.username}
                                    </span>
                                  </div>
                                </div>
                                {isSelected && (
                                  <CheckCircle2 size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="autocomplete-empty">
                            <User size={24} style={{ opacity: 0.3 }} />
                            <span>Không tìm thấy độc giả phù hợp</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Book Autocomplete Field */}
                <div className="form-group-custom" ref={bookDropdownRef}>
                  <label className="form-label-custom">
                    Đầu Sách <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  
                  <div className="autocomplete-wrapper">
                    <div className="autocomplete-input-box">
                      <BookOpen size={17} className="input-icon-left" />
                      <input
                        type="text"
                        className="form-control-custom"
                        placeholder="Gõ tên đầu sách hoặc thể loại..."
                        value={bookSearchTerm}
                        onChange={(e) => {
                          setBookSearchTerm(e.target.value);
                          setShowBookDropdown(true);
                          if (selectedBook && e.target.value !== selectedBook.name) {
                            setSelectedBook(null);
                            setAssignData(prev => ({ ...prev, bookId: '' }));
                          }
                        }}
                        onFocus={() => setShowBookDropdown(true)}
                        required={!assignData.bookId}
                      />
                      {bookSearchTerm && (
                        <button 
                          type="button" 
                          className="btn-clear-input"
                          onClick={() => {
                            setBookSearchTerm('');
                            setSelectedBook(null);
                            setAssignData(prev => ({ ...prev, bookId: '' }));
                            setShowBookDropdown(true);
                          }}
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    {showBookDropdown && (
                      <div className="autocomplete-dropdown">
                        {bookOptions.length > 0 ? (
                          bookOptions.map(book => {
                            const isSelected = assignData.bookId === book.id;
                            return (
                              <div 
                                key={book.id} 
                                className={`autocomplete-item ${isSelected ? 'selected' : ''}`}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSelectBook(book);
                                }}
                                onClick={() => handleSelectBook(book)}
                              >
                                <div className="autocomplete-item-main">
                                  <div className="autocomplete-book-icon">
                                    <BookOpen size={16} />
                                  </div>
                                  <div className="autocomplete-item-text">
                                    <span className="autocomplete-title">
                                      {book.name}
                                    </span>
                                    <span className="autocomplete-subtitle">
                                      {book.category?.name ? `Thể loại: ${book.category.name}` : 'Chưa phân loại'}
                                    </span>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                                  <span className="badge-status badge-status-success" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                                    Kho: {book.quantity}
                                  </span>
                                  {isSelected && (
                                    <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="autocomplete-empty">
                            <BookOpen size={24} style={{ opacity: 0.3 }} />
                            <span>Không tìm thấy sách phù hợp</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
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
