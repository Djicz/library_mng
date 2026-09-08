import React, { useState, useEffect, useMemo } from 'react';
import api, { getErrorMessage } from '../services/api';
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
  Send,
  RefreshCw,
  XCircle,
  ShieldCheck
} from 'lucide-react';

const Borrows = () => {
  const [records, setRecords] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignData, setAssignData] = useState({ userId: '', bookId: '', borrowDays: 14 });
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [actionSuccess, setActionSuccess] = useState('');
  const [loading, setLoading] = useState(true);

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

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [borrowsRes, usersRes, booksRes] = await Promise.all([
        api.get('/manager/borrow/all').catch(() => ({ data: [] })),
        api.get('/users').catch(() => ({ data: [] })),
        api.get('/books').catch(() => ({ data: [] }))
      ]);

      const bList = Array.isArray(borrowsRes.data) ? borrowsRes.data : (borrowsRes.data?.data || []);
      const uList = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.data || []);
      const kList = Array.isArray(booksRes.data) ? booksRes.data : (booksRes.data?.data || []);

      setRecords(bList);
      setUsers(uList);
      setBooks(kList);
    } catch (error) {
      console.error("Error fetching borrow records", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Quick lookup maps
  const usersMap = useMemo(() => {
    const map = new Map();
    users.forEach(u => map.set(u.id, u));
    return map;
  }, [users]);

  const booksMap = useMemo(() => {
    const map = new Map();
    books.forEach(b => map.set(b.id, b));
    return map;
  }, [books]);

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
        setBookSearchTerm(found.title || found.name);
      }
    }
  }, [location.search, books]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) setShowUserDropdown(false);
      if (bookDropdownRef.current && !bookDropdownRef.current.contains(event.target)) setShowBookDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter users on search term change
  useEffect(() => {
    const term = userSearchTerm.trim().toLowerCase();
    const filtered = users.filter(u => {
      if (u.role === 'MANAGER' || u.status !== 'AVAILABLE') return false;
      if (!term) return true;
      const uName = (u.username || '').toLowerCase();
      const dName = (u.displayName || '').toLowerCase();
      return uName.includes(term) || dName.includes(term);
    });
    setUserOptions(filtered);
  }, [userSearchTerm, users]);

  // Filter books on search term change
  useEffect(() => {
    const term = bookSearchTerm.trim().toLowerCase();
    const filtered = books.filter(b => {
      if (b.quantity <= 0 && b.id !== assignData.bookId) return false;
      if (!term) return true;
      const bTitle = (b.title || b.name || '').toLowerCase();
      const bAuthor = (b.author || '').toLowerCase();
      const cName = (b.category?.name || '').toLowerCase();
      return bTitle.includes(term) || bAuthor.includes(term) || cName.includes(term);
    });
    setBookOptions(filtered);
  }, [bookSearchTerm, books, assignData.bookId]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setAssignData(prev => ({ ...prev, userId: user.id }));
    setUserSearchTerm(user.displayName ? `${user.displayName} (@${user.username})` : user.username);
    setShowUserDropdown(false);
  };

  const handleSelectBook = (book) => {
    setSelectedBook(book);
    setAssignData(prev => ({ ...prev, bookId: book.id }));
    setBookSearchTerm(book.title || book.name);
    setShowBookDropdown(false);
  };

  const triggerSuccess = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleReturn = async (id, bookTitle) => {
    if (window.confirm(`Xác nhận độc giả đã trả sách "${bookTitle || ''}"?`)) {
      try {
        const response = await api.post(`/manager/borrow/return/${id}`);
        triggerSuccess(response.data?.message || `Đã ghi nhận trả sách thành công!`);
        fetchAllData();
      } catch (error) {
        console.error("Error returning book", error);
        alert(getErrorMessage(error, "Lỗi khi nhận trả sách."));
      }
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!assignData.userId || !assignData.bookId) {
      setError('Vui lòng chọn đầy đủ độc giả và đầu sách.');
      return;
    }

    try {
      const response = await api.post('/borrows', {
        userId: assignData.userId,
        bookId: assignData.bookId,
        borrowDays: parseInt(assignData.borrowDays) || 14
      });

      setAssignData({ userId: '', bookId: '', borrowDays: 14 });
      setUserSearchTerm('');
      setBookSearchTerm('');
      setSelectedUser(null);
      setSelectedBook(null);
      setShowAssignModal(false);
      triggerSuccess('Tạo phiếu mượn và kích hoạt Saga thành công!');
      fetchAllData();
    } catch (err) {
      setError(getErrorMessage(err, "Lỗi khi gán mượn sách."));
    }
  };

  const isOverdue = (dueDate, returnDate) => {
    if (returnDate) return false;
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  };

  // Filter records by search
  const filteredRecords = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return records;

    return records.filter(r => {
      const user = usersMap.get(r.userId) || {};
      const book = booksMap.get(r.bookId) || {};
      const uName = (user.username || '').toLowerCase();
      const dName = (user.displayName || '').toLowerCase();
      const bTitle = (book.title || book.name || '').toLowerCase();
      return uName.includes(term) || dName.includes(term) || bTitle.includes(term);
    });
  }, [records, searchTerm, usersMap, booksMap]);

  // Stats calculation
  const totalBorrowing = records.filter(r => !r.returnDate && r.status === 'APPROVED').length;
  const totalOverdue = records.filter(r => isOverdue(r.dueDate, r.returnDate) && r.status === 'APPROVED').length;
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
            Theo dõi tình trạng mượn sách, nhận trả sách và quản lý phiếu mượn toàn hệ thống
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn-secondary-modern" 
            onClick={fetchAllData}
            title="Tải lại dữ liệu"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Tải lại</span>
          </button>
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
            placeholder="Tìm kiếm theo tên độc giả, tên sách..."
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
            {filteredRecords.map(record => {
              const book = booksMap.get(record.bookId) || {};
              const user = usersMap.get(record.userId) || {};
              const overdue = isOverdue(record.dueDate, record.returnDate) && record.status === 'APPROVED';

              return (
                <tr key={record.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-muted)' }}>
                      #{record.id}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <BookOpen size={16} style={{ color: 'var(--primary-light)', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {book.title || book.name || `Sách #${record.bookId ? record.bookId.substring(0, 8) : 'N/A'}`}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Tác giả: {book.author || 'Chưa cập nhật'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                        {(user.displayName || user.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                          {user.displayName || user.username || 'Độc giả'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          @{user.username || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {record.borrowDate}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: overdue ? 'var(--danger)' : 'var(--text-secondary)' }}>
                      {record.dueDate}
                    </span>
                  </td>
                  <td>
                    {record.returnDate ? (
                      <span className="badge-status badge-status-success">
                        <CheckCircle2 size={12} />
                        Đã trả ({record.returnDate})
                      </span>
                    ) : record.status === 'APPROVED' ? (
                      overdue ? (
                        <span className="badge-status badge-status-danger">
                          <AlertTriangle size={12} />
                          Quá Hạn
                        </span>
                      ) : (
                        <span className="badge-status badge-status-warning">
                          <Clock size={12} />
                          Đang mượn
                        </span>
                      )
                    ) : record.status === 'REJECTED_OVERDUE' ? (
                      <span className="badge-status badge-status-danger">
                        <XCircle size={12} />
                        Bị từ chối (Nợ quá hạn)
                      </span>
                    ) : (
                      <span className="badge-status badge-status-info">
                        <Clock size={12} />
                        {record.status}
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {!record.returnDate && record.status === 'APPROVED' ? (
                      <button 
                        className="btn-primary-gradient" 
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
                        onClick={() => handleReturn(record.id, book.title || book.name)}
                      >
                        <CheckCircle2 size={14} />
                        <span>Nhận Trả</span>
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Hoàn tất
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}

            {filteredRecords.length === 0 && (
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
                            setAssignData(prev => ({ ...prev, userId: '' }));
                          }
                        }}
                        onFocus={() => setShowUserDropdown(true)}
                        required={!assignData.userId}
                      />
                      {userSearchTerm && (
                        <button 
                          type="button" 
                          className="btn-clear-input"
                          onClick={() => {
                            setUserSearchTerm('');
                            setSelectedUser(null);
                            setAssignData(prev => ({ ...prev, userId: '' }));
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
                            const isSelected = assignData.userId === user.id;
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
                        placeholder="Gõ tên đầu sách hoặc tác giả..."
                        value={bookSearchTerm}
                        onChange={(e) => {
                          setBookSearchTerm(e.target.value);
                          setShowBookDropdown(true);
                          if (selectedBook && e.target.value !== (selectedBook.title || selectedBook.name)) {
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
                            const title = book.title || book.name;
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
                                      {title}
                                    </span>
                                    <span className="autocomplete-subtitle">
                                      {book.author ? `Tác giả: ${book.author}` : (book.category?.name ? `Thể loại: ${book.category.name}` : '')}
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
                  <label className="form-label-custom">Thời hạn mượn (Số ngày) <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <select
                    className="form-select-custom"
                    value={assignData.borrowDays}
                    onChange={e => setAssignData({ ...assignData, borrowDays: Number(e.target.value) })}
                    required
                  >
                    <option value={7}>7 ngày (1 tuần)</option>
                    <option value={14}>14 ngày (2 tuần)</option>
                    <option value={30}>30 ngày (1 tháng)</option>
                  </select>
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
