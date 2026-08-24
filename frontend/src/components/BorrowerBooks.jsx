import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
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
  BookMarked,
  BookmarkPlus
} from 'lucide-react';

const BorrowerBooks = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  
  // Pending records tracking
  // Map bookId -> { usBook: 1 | 2, borrowDate, dueDate }
  const [userBookStatusMap, setUserBookStatusMap] = useState(new Map());

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [requestType, setRequestType] = useState('BORROW'); // 'BORROW' (/borrow/{id}) | 'RESERVE' (/book/{id})
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const fetchBooks = async (searchTerm = '') => {
    try {
      setLoading(true);
      const response = await api.get(`/books${searchTerm ? '?search=' + encodeURIComponent(searchTerm) : ''}`);
      setBooks(response.data || []);
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
      setCategories(response.data || []);
    } catch (error) {
      console.warn("Categories loaded from book items");
    }
  };

  const fetchMyPendingRecords = async () => {
    try {
      const response = await api.get('/borrower/my-books');
      if (Array.isArray(response.data)) {
        const statusMap = new Map();
        response.data.forEach(record => {
          if (record.book?.id && (record.usBook === 1 || record.usBook === 2)) {
            statusMap.set(record.book.id, {
              usBook: record.usBook,
              borrowDate: record.borrowDate,
              dueDate: record.dueDate
            });
          }
        });
        setUserBookStatusMap(statusMap);
      }
    } catch (error) {
      console.error("Error fetching my books for pending status", error);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchCategories();
    fetchMyPendingRecords();
  }, []);

  const triggerSuccess = (msg) => {
    setActionSuccess(msg);
    setActionError('');
    setTimeout(() => setActionSuccess(''), 5000);
  };

  const triggerError = (msg) => {
    setActionError(msg);
    setActionSuccess('');
    setTimeout(() => setActionError(''), 5000);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks(search);
  };

  // Mở form Yêu Cầu Mượn Sách (POST /borrow/{id})
  const openBorrowModal = (book) => {
    const existing = userBookStatusMap.get(book.id);
    if (existing) {
      if (existing.usBook === 1) {
        triggerError(`Bạn đã gửi yêu cầu mượn sách "${book.name}" trước đó rồi.`);
        return;
      } else if (existing.usBook === 2) {
        triggerError(`Bạn đã đặt trước sách "${book.name}" rồi.`);
        return;
      }
    }

    if (book.quantity <= 0) {
      triggerError(`Sách "${book.name}" hiện đang hết trong kho. Bạn có thể chọn "Đặt Trước Sách".`);
      return;
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const next14Days = new Date();
    next14Days.setDate(today.getDate() + 14);

    setSelectedBook(book);
    setRequestType('BORROW');
    setStartDate(todayStr);
    setEndDate(next14Days.toISOString().split('T')[0]);
    setShowModal(true);
  };

  // Mở form Đặt Trước Sách (POST /book/{id})
  const openReserveModal = (book) => {
    const existing = userBookStatusMap.get(book.id);
    if (existing) {
      if (existing.usBook === 1) {
        triggerError(`Bạn đã gửi yêu cầu mượn sách "${book.name}" rồi.`);
        return;
      } else if (existing.usBook === 2) {
        triggerError(`Bạn đã đặt trước sách "${book.name}" (ngày nhận ${existing.borrowDate}) rồi.`);
        return;
      }
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const next15Days = new Date();
    next15Days.setDate(tomorrow.getDate() + 14);

    setSelectedBook(book);
    setRequestType('RESERVE');
    setStartDate(tomorrowStr);
    setEndDate(next15Days.toISOString().split('T')[0]);
    setShowModal(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBook) return;

    if (!startDate || !endDate) {
      triggerError("Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      triggerError("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.");
      return;
    }

    setSubmitting(true);
    try {
      if (requestType === 'BORROW') {
        // Gửi API Yêu cầu mượn sách: POST /api/borrower/my-books/borrow/{id}
        await api.post(`/borrower/my-books/borrow/${selectedBook.id}`, {
          start: startDate,
          end: endDate
        });

        setUserBookStatusMap(prev => {
          const next = new Map(prev);
          next.set(selectedBook.id, { usBook: 1, borrowDate: startDate, dueDate: endDate });
          return next;
        });

        setShowModal(false);
        triggerSuccess(`Đã gửi YÊU CẦU MƯỢN sách "${selectedBook.name}" thành công! Vui lòng chờ thủ thư phê duyệt.`);
      } else {
        // Gửi API Đặt trước sách: POST /api/borrower/my-books/book/{id}
        await api.post(`/borrower/my-books/book/${selectedBook.id}`, {
          start: startDate,
          end: endDate
        });

        setUserBookStatusMap(prev => {
          const next = new Map(prev);
          next.set(selectedBook.id, { usBook: 2, borrowDate: startDate, dueDate: endDate });
          return next;
        });

        setShowModal(false);
        triggerSuccess(`Đã gửi ĐẶT TRƯỚC sách "${selectedBook.name}" thành công (ngày nhận: ${startDate})!`);
      }

      fetchMyPendingRecords();
    } catch (error) {
      console.error("Error submitting borrow/reserve request", error);
      triggerError(error.response?.data?.message || error.response?.data || "Lỗi khi xử lý yêu cầu.");
    } finally {
      setSubmitting(false);
    }
  };

  // Extract categories if categories list was empty
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
    return selectedCategory 
      ? books.filter(b => b.category?.id === selectedCategory) 
      : books;
  }, [books, selectedCategory]);

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

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="animate-fade-in">
      {/* Banner */}
      <div className="banner-mesh mb-4" style={{ padding: '1.75rem 2rem' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.18)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem', backdropFilter: 'blur(4px)' }}>
            <Sparkles size={14} /> Mượn Sách & Đặt Trước Trực Tuyến
          </div>
          <h1 className="banner-title" style={{ fontSize: '1.75rem' }}>Kho Tàng Tri Thức Trực Tuyến</h1>
          <p className="banner-subtitle" style={{ maxWidth: '650px' }}>
            Tra cứu nhanh chóng các đầu sách, gửi <strong>Yêu Cầu Mượn Sách</strong> (hôm nay) hoặc <strong>Đặt Trước Sách</strong> (tương lai).
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
              placeholder="Tìm kiếm sách theo tên tác phẩm..." 
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
          const userStatus = userBookStatusMap.get(book.id);
          const isRequestedBorrow = userStatus?.usBook === 1;
          const isReserved = userStatus?.usBook === 2;
          const isAvailable = book.quantity > 0;

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
                borderRadius: 'var(--radius-lg)',
                border: isRequestedBorrow 
                  ? '1px solid rgba(245, 158, 11, 0.4)' 
                  : isReserved 
                    ? '1px solid rgba(99, 102, 241, 0.4)' 
                    : undefined
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
                      {book.name}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Mã: #{book.id ? book.id.substring(0, 8) : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                {isRequestedBorrow ? (
                  <button 
                    disabled 
                    className="w-100 btn-secondary-modern"
                    style={{ 
                      justifyContent: 'center', 
                      background: 'var(--warning-bg)', 
                      borderColor: 'rgba(245, 158, 11, 0.3)', 
                      color: 'var(--warning)', 
                      cursor: 'not-allowed',
                      fontSize: '0.85rem'
                    }}
                  >
                    <Clock size={16} />
                    <span>Đang Chờ Duyệt Mượn</span>
                  </button>
                ) : isReserved ? (
                  <button 
                    disabled 
                    className="w-100 btn-secondary-modern"
                    style={{ 
                      justifyContent: 'center', 
                      background: 'rgba(99, 102, 241, 0.1)', 
                      borderColor: 'rgba(99, 102, 241, 0.3)', 
                      color: 'var(--primary-light)', 
                      cursor: 'not-allowed',
                      fontSize: '0.85rem'
                    }}
                  >
                    <BookmarkPlus size={16} />
                    <span>Đã Đặt Trước ({userStatus.borrowDate})</span>
                  </button>
                ) : isAvailable ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <button 
                      className="btn-primary-gradient" 
                      onClick={() => openBorrowModal(book)}
                      style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem 0.6rem' }}
                      title="Gửi yêu cầu mượn sách ngay"
                    >
                      <Send size={14} />
                      <span>Mượn Sách</span>
                    </button>
                    <button 
                      className="btn-secondary-modern" 
                      onClick={() => openReserveModal(book)}
                      style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem 0.6rem' }}
                      title="Đặt trước ngày nhận sách trong tương lai"
                    >
                      <BookmarkPlus size={14} />
                      <span>Đặt Trước</span>
                    </button>
                  </div>
                ) : (
                  <button 
                    className="w-100 btn-secondary-modern"
                    onClick={() => openReserveModal(book)}
                    style={{ 
                      justifyContent: 'center', 
                      fontSize: '0.85rem',
                      borderColor: 'rgba(99, 102, 241, 0.4)',
                      color: 'var(--primary-light)'
                    }}
                  >
                    <BookmarkPlus size={16} />
                    <span>Đặt Trước Sách</span>
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

      {/* Modal Điền Form Mượn / Đặt Trước */}
      {showModal && selectedBook && (
        <div className="modal-backdrop-custom" onClick={() => setShowModal(false)}>
          <div className="modal-dialog-custom" onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom">
              <div className="modal-title-custom">
                {requestType === 'BORROW' ? (
                  <>
                    <Send size={20} style={{ color: 'var(--primary-light)' }} />
                    <span>Yêu Cầu Mượn Sách</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus size={20} style={{ color: 'var(--primary-light)' }} />
                    <span>Đặt Trước Sách</span>
                  </>
                )}
              </div>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleModalSubmit}>
              <div className="modal-body-custom">
                {/* Book Info Summary */}
                <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Đầu sách:</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {selectedBook.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Thể loại:</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {selectedBook.category?.name || 'Chưa phân loại'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Phương thức:</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: requestType === 'BORROW' ? 'var(--warning)' : 'var(--primary-light)' }}>
                      {requestType === 'BORROW' ? 'Mượn Sách (/borrow)' : 'Đặt Trước Sách (/book)'}
                    </span>
                  </div>
                </div>

                {/* Form Dates */}
                <div className="form-group-custom">
                  <label className="form-label-custom">
                    {requestType === 'BORROW' ? 'Ngày Bắt Đầu Mượn' : 'Ngày Nhận Sách Dự Kiến'} <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="date" 
                      className="form-control-custom" 
                      style={{ paddingLeft: '2.75rem' }}
                      value={startDate} 
                      onChange={e => setStartDate(e.target.value)} 
                      min={requestType === 'BORROW' ? todayStr : new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                      required 
                    />
                  </div>
                </div>

                <div className="form-group-custom">
                  <label className="form-label-custom">
                    Ngày Kết Thúc (Hạn Trả Sách) <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="date" 
                      className="form-control-custom" 
                      style={{ paddingLeft: '2.75rem' }}
                      value={endDate} 
                      onChange={e => setEndDate(e.target.value)} 
                      min={startDate || todayStr}
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer-custom">
                <button 
                  type="button" 
                  className="btn-secondary-modern" 
                  onClick={() => setShowModal(false)}
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="btn-primary-gradient"
                  disabled={submitting}
                >
                  <span>
                    {submitting 
                      ? 'Đang gửi...' 
                      : requestType === 'BORROW' 
                        ? 'Gửi Yêu Cầu Mượn' 
                        : 'Xác Nhận Đặt Trước'}
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
