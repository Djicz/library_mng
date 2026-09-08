import React, { useState, useEffect, useMemo } from 'react';
import api, { getErrorMessage } from '../services/api';
import { 
  BookOpen, 
  Search, 
  Send, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  BookmarkCheck
} from 'lucide-react';

const BorrowerBooks = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  
  // Current user's active borrow book IDs
  const [userBorrowedBookIds, setUserBorrowedBookIds] = useState(new Set());

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [borrowDays, setBorrowDays] = useState(14);
  const [submitting, setSubmitting] = useState(false);
  const [sagaStatus, setSagaStatus] = useState(''); // 'PROCESSING' | 'APPROVED' | 'REJECTED'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/books');
      const list = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setBooks(list);
    } catch (error) {
      console.error("Error fetching books", error);
      setActionError("Không thể tải danh sách sách từ máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/manager/category');
      const list = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setCategories(list);
    } catch (error) {
      console.warn("Categories loaded");
    }
  };

  const fetchUserBorrows = async () => {
    try {
      let userId = localStorage.getItem('userId');
      if (!userId) {
        const profileRes = await api.get('/profile');
        const user = profileRes.data?.data || profileRes.data;
        if (user?.id) {
          userId = user.id;
          localStorage.setItem('userId', userId);
        }
      }
      if (userId) {
        const res = await api.get(`/borrows/user/${userId}`);
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const activeIds = new Set();
        list.forEach(r => {
          if (!r.returnDate && r.status === 'APPROVED') {
            activeIds.add(r.bookId);
          }
        });
        setUserBorrowedBookIds(activeIds);
      }
    } catch (error) {
      console.error("Error fetching user borrows", error);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchCategories();
    fetchUserBorrows();
  }, []);

  const triggerSuccess = (msg) => {
    setActionSuccess(msg);
    setActionError('');
    setTimeout(() => setActionSuccess(''), 6000);
  };

  const triggerError = (msg) => {
    setActionError(msg);
    setActionSuccess('');
    setTimeout(() => setActionError(''), 6000);
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const openBorrowModal = (book) => {
    if (userBorrowedBookIds.has(book.id)) {
      triggerError(`Bạn hiện đang mượn cuốn sách "${book.title || book.name}" này.`);
      return;
    }

    if (book.quantity <= 0) {
      triggerError(`Sách "${book.title || book.name}" hiện đã hết trong kho.`);
      return;
    }

    setSelectedBook(book);
    setBorrowDays(14);
    setSagaStatus('');
    setShowModal(true);
  };

  // Poll saga status from GET /api/borrows/saga/{sagaId}
  const pollSaga = async (sagaId, bookTitle) => {
    setSagaStatus('Đang kích hoạt giao dịch Kafka Saga...');
    let attempts = 0;
    const maxAttempts = 15;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const response = await api.get(`/borrows/saga/${sagaId}`);
        const record = response.data?.data || response.data;
        if (!record) return;

        if (record.status === 'IN_PROGRESS') {
          setSagaStatus('Bước 1/2: Đang gửi lệnh ReserveBook đến Book Service...');
        } else if (record.status === 'BOOK_RESERVED') {
          setSagaStatus('Bước 2/2: Sách đã được giữ kho, đang kiểm tra quá hạn tại User Service...');
        } else if (record.status === 'APPROVED') {
          clearInterval(interval);
          setSubmitting(false);
          setShowModal(false);
          triggerSuccess(`🎉 Mượn sách "${bookTitle}" thành công qua luồng Kafka Saga! Hạn trả: ${record.dueDate}.`);
          fetchBooks();
          fetchUserBorrows();
        } else if (record.status === 'REJECTED_OVERDUE') {
          clearInterval(interval);
          setSubmitting(false);
          setShowModal(false);
          triggerError(`❌ Saga Rollback: Mượn sách thất bại vì tài khoản của bạn đang có sách nợ quá hạn! (Book đã tự động hoàn kho bù trừ).`);
          fetchBooks();
        } else if (record.status === 'REJECTED_OUT_OF_STOCK') {
          clearInterval(interval);
          setSubmitting(false);
          setShowModal(false);
          triggerError(`❌ Mượn sách thất bại: Sách đã hết hàng trong kho.`);
          fetchBooks();
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setSubmitting(false);
          setShowModal(false);
          triggerSuccess(`Yêu cầu mượn sách đã được gửi và đang được xử lý ngầm trong hệ thống.`);
          fetchBooks();
          fetchUserBorrows();
        }
      } catch (e) {
        // Poll error ignore
      }
    }, 1000);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBook) return;

    let userId = localStorage.getItem('userId');
    if (!userId) {
      try {
        const profileRes = await api.get('/profile');
        const user = profileRes.data?.data || profileRes.data;
        if (user?.id) {
          userId = user.id;
          localStorage.setItem('userId', userId);
        }
      } catch (err) {
        triggerError('Không tìm thấy thông tin tài khoản người dùng.');
        return;
      }
    }

    if (!userId) {
      triggerError('Vui lòng đăng nhập lại để thực hiện mượn sách.');
      return;
    }

    setSubmitting(true);

    try {
      const days = parseInt(borrowDays) || 14;
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      const dueDateStr = targetDate.toISOString().split('T')[0];

      // POST /api/borrows -> creates PENDING borrow request waiting for admin approval
      await api.post('/borrows', {
        userId: userId,
        bookId: selectedBook.id,
        dueDate: dueDateStr,
        borrowDays: days
      });

      const bookTitle = selectedBook.title || selectedBook.name;
      setSubmitting(false);
      setShowModal(false);
      triggerSuccess(`🎉 Yêu cầu mượn sách "${bookTitle}" đã được gửi thành công và đang chờ Quản trị viên/Thủ thư phê duyệt! Bạn có thể theo dõi trong mục "Sách Của Tôi".`);
      fetchBooks();
      fetchUserBorrows();
    } catch (error) {
      console.error("Error submitting borrow request", error);
      setSubmitting(false);
      triggerError(getErrorMessage(error, "Lỗi khi gửi yêu cầu mượn sách."));
    }
  };

  const allCategories = useMemo(() => {
    if (categories.length > 0) return categories;
    const catMap = new Map();
    books.forEach(b => {
      if (b.category && b.category.id) {
        catMap.set(b.category.id, b.category);
      }
    });
    return Array.from(catMap.values());
  }, [categories, books]);

  const filteredBooks = useMemo(() => {
    let list = books;
    if (selectedCategory) {
      list = list.filter(b => b.category?.id === selectedCategory);
    }
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      list = list.filter(b => 
        (b.title && b.title.toLowerCase().includes(term)) ||
        (b.author && b.author.toLowerCase().includes(term)) ||
        (b.name && b.name.toLowerCase().includes(term))
      );
    }
    return list;
  }, [books, selectedCategory, search]);

  const totalPages = Math.ceil(filteredBooks.length / pageSize) || 1;

  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBooks.slice(start, start + pageSize);
  }, [filteredBooks, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, search]);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const delta = 1;
    const range = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }
    if (currentPage - delta > 2) range.unshift('...');
    if (currentPage + delta < totalPages - 1) range.push('...');
    range.unshift(1);
    if (totalPages > 1) range.push(totalPages);
    return range;
  };

  return (
    <div className="animate-fade-in">
      {/* Banner */}
      <div className="banner-mesh mb-4" style={{ padding: '1.75rem 2rem' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.18)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem', backdropFilter: 'blur(4px)' }}>
            <Sparkles size={14} /> Mượn Sách Trực Tuyến Tự Động (Kafka Saga)
          </div>
          <h1 className="banner-title" style={{ fontSize: '1.75rem' }}>Kho Tàng Tri Thức Trực Tuyến</h1>
          <p className="banner-subtitle" style={{ maxWidth: '650px' }}>
            Tra cứu nhanh chóng các đầu sách, mượn sách trực tuyến với cơ chế đồng bộ giao dịch phân tán <strong>Kafka Saga Orchestration</strong>.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="badge-status badge-status-success w-100 mb-3" style={{ padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
          <CheckCircle2 size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="badge-status badge-status-danger w-100 mb-3" style={{ padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
          <AlertCircle size={18} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="card-glass mb-4" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <form onSubmit={handleSearch} className="search-input-group" style={{ flex: '1 1 320px', maxWidth: '500px' }}>
            <Search size={18} className="search-icon-inside" />
            <input 
              type="text" 
              className="search-input-field" 
              placeholder="Tìm kiếm theo tên sách hoặc tác giả..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Thể loại:</span>
            <select 
              className="form-select-custom" 
              style={{ width: 'auto', minWidth: '200px', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="">Tất cả thể loại ({allCategories.length})</option>
              {allCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {paginatedBooks.map(book => {
          const isCurrentlyBorrowed = userBorrowedBookIds.has(book.id);
          const isAvailable = book.quantity > 0;
          const bookTitle = book.title || book.name;

          return (
            <div 
              key={book.id} 
              className="card-glass" 
              style={{ 
                padding: '1.35rem', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <div>
                {/* Header tag */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className="badge-status badge-status-info" style={{ fontSize: '0.75rem' }}>
                    <Tag size={12} />
                    {book.category?.name || 'Chưa phân loại'}
                  </span>
                  
                  {isAvailable ? (
                    <span className="badge-status badge-status-success" style={{ fontSize: '0.75rem' }}>
                      <span className="badge-dot"></span>
                      Còn {book.quantity} cuốn
                    </span>
                  ) : (
                    <span className="badge-status badge-status-danger" style={{ fontSize: '0.75rem' }}>
                      <span className="badge-dot"></span>
                      Hết sách (0)
                    </span>
                  )}
                </div>

                {/* Book Title & Icon */}
                <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '1.25rem' }}>
                  <div style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: 'var(--radius-md)', 
                    background: 'var(--primary-subtle)', 
                    color: 'var(--primary)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    flexShrink: 0 
                  }}>
                    <BookOpen size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem 0', lineHeight: 1.35 }}>
                      {bookTitle}
                    </h3>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      Tác giả: {book.author || 'Chưa cập nhật'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                {isCurrentlyBorrowed ? (
                  <button 
                    disabled 
                    className="w-100 btn-secondary-modern"
                    style={{ 
                      justifyContent: 'center', 
                      background: 'var(--success-bg)', 
                      borderColor: 'rgba(16, 185, 129, 0.3)', 
                      color: 'var(--success)', 
                      cursor: 'not-allowed',
                      fontSize: '0.85rem'
                    }}
                  >
                    <BookmarkCheck size={16} />
                    <span>Bạn Đang Mượn Cuốn Này</span>
                  </button>
                ) : isAvailable ? (
                  <button 
                    className="btn-primary-gradient w-100" 
                    onClick={() => openBorrowModal(book)}
                    style={{ justifyContent: 'center', fontSize: '0.9rem', padding: '0.65rem 1rem' }}
                    title="Mượn sách ngay qua Kafka Saga"
                  >
                    <Send size={15} />
                    <span>Mượn Sách Ngay</span>
                  </button>
                ) : (
                  <button 
                    disabled
                    className="w-100 btn-secondary-modern"
                    style={{ 
                      justifyContent: 'center', 
                      fontSize: '0.85rem',
                      opacity: 0.6,
                      cursor: 'not-allowed'
                    }}
                  >
                    <span>Tạm Hết Sách</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredBooks.length === 0 && !loading && (
        <div className="card-glass" style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <BookOpen size={48} style={{ opacity: 0.3 }} />
            <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              Không tìm thấy đầu sách nào phù hợp
            </p>
            <span style={{ fontSize: '0.875rem' }}>Thử tìm kiếm với từ khóa khác hoặc đổi thể loại sách.</span>
          </div>
        </div>
      )}

      {/* Pagination Bar */}
      {filteredBooks.length > 0 && (
        <div className="pagination-wrapper">
          <div className="pagination-info">
            <span>
              Hiển thị <span className="highlight">{Math.min((currentPage - 1) * pageSize + 1, filteredBooks.length)}</span> - <span className="highlight">{Math.min(currentPage * pageSize, filteredBooks.length)}</span> trên <span className="highlight">{filteredBooks.length}</span> đầu sách
            </span>
          </div>

          <div className="pagination-controls">
            <button
              className="pagination-btn"
              title="Trang đầu tiên"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              className="pagination-btn"
              title="Trang trước"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              <ChevronLeft size={16} />
            </button>

            {getPageNumbers().map((pageNum, idx) => (
              pageNum === '...' ? (
                <span key={`ellipsis-${idx}`} className="pagination-ellipsis">...</span>
              ) : (
                <button
                  key={`page-${pageNum}`}
                  className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              )
            ))}

            <button
              className="pagination-btn"
              title="Trang tiếp"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              <ChevronRight size={16} />
            </button>
            <button
              className="pagination-btn"
              title="Trang cuối cùng"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal Mượn Sách & Saga Progress */}
      {showModal && selectedBook && (
        <div className="modal-backdrop-custom" onClick={() => !submitting && setShowModal(false)}>
          <div className="modal-dialog-custom" onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom">
              <div className="modal-title-custom">
                <Send size={20} style={{ color: 'var(--primary-light)' }} />
                <span>Xác Nhận Mượn Sách</span>
              </div>
              {!submitting && (
                <button 
                  onClick={() => setShowModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <form onSubmit={handleModalSubmit}>
              <div className="modal-body-custom">
                {/* Book Info Summary */}
                <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Đầu sách:</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {selectedBook.title || selectedBook.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tác giả:</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {selectedBook.author || 'Chưa cập nhật'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Thể loại:</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {selectedBook.category?.name || 'Chưa phân loại'}
                    </span>
                  </div>
                </div>

                {/* Form Duration */}
                <div className="form-group-custom">
                  <label className="form-label-custom">
                    Thời gian mượn (Số ngày) <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <select 
                    className="form-select-custom"
                    value={borrowDays}
                    onChange={e => setBorrowDays(Number(e.target.value))}
                    disabled={submitting}
                  >
                    <option value={7}>7 ngày (1 tuần)</option>
                    <option value={14}>14 ngày (2 tuần - Mặc định)</option>
                    <option value={30}>30 ngày (1 tháng)</option>
                  </select>
                </div>

                <div style={{ background: 'rgba(99, 102, 241, 0.06)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '1rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  <Clock size={16} style={{ color: 'var(--primary-light)', flexShrink: 0 }} />
                  <span>Yêu cầu sẽ được gửi tới Thủ thư để phê duyệt trước khi giao dịch trừ kho và xuất phiếu hoàn tất.</span>
                </div>
              </div>

              <div className="modal-footer-custom">
                <button 
                  type="button" 
                  className="btn-secondary-modern" 
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="btn-primary-gradient"
                  disabled={submitting}
                >
                  <span>
                    {submitting ? 'Đang gửi yêu cầu...' : 'Gửi Yêu Cầu Mượn Sách'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowerBooks;
