import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { 
  BookmarkCheck, 
  BookOpen, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Tag, 
  Sparkles, 
  Inbox, 
  ArrowRight, 
  XCircle,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MyBooks = () => {
  const [records, setRecords] = useState([]);
  const [booksMap, setBooksMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('borrowing'); // 'borrowing' | 'history' | 'pending' | 'rejected'

  const fetchAllData = async () => {
    try {
      setLoading(true);
      let userId = localStorage.getItem('userId');
      if (!userId) {
        const profileRes = await api.get('/profile');
        const user = profileRes.data?.data || profileRes.data;
        if (user?.id) {
          userId = user.id;
          localStorage.setItem('userId', userId);
        }
      }

      const [booksRes, borrowsRes] = await Promise.all([
        api.get('/books').catch(() => ({ data: [] })),
        userId ? api.get(`/borrows/user/${userId}`).catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
      ]);

      const booksList = Array.isArray(booksRes.data) ? booksRes.data : (booksRes.data?.data || []);
      const map = new Map();
      booksList.forEach(b => map.set(b.id, b));
      setBooksMap(map);

      const borrowList = Array.isArray(borrowsRes.data) ? borrowsRes.data : (borrowsRes.data?.data || []);
      setRecords(borrowList);
    } catch (error) {
      console.error("Error fetching my books data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const isOverdue = (dueDate, returnDate) => {
    if (returnDate) return false;
    if (!dueDate) return false;
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  };

  const getDaysLeft = (dueDate) => {
    if (!dueDate) return 0;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Group records by status
  const activeBorrows = useMemo(() => {
    return records.filter(r => r.status === 'APPROVED' && !r.returnDate);
  }, [records]);

  const historyBorrows = useMemo(() => {
    return records.filter(r => r.returnDate != null);
  }, [records]);

  const pendingRecords = useMemo(() => {
    return records.filter(r => r.status === 'PENDING' || r.status === 'IN_PROGRESS' || r.status === 'BOOK_RESERVED');
  }, [records]);

  const rejectedRecords = useMemo(() => {
    return records.filter(r => r.status === 'REJECTED' || r.status === 'REJECTED_OVERDUE' || r.status === 'REJECTED_OUT_OF_STOCK');
  }, [records]);

  const overdueCount = activeBorrows.filter(r => isOverdue(r.dueDate, r.returnDate)).length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Sách Của Tôi
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
            Theo dõi danh sách sách đang mượn, yêu cầu chờ duyệt và lịch sử mượn trả
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn-secondary-modern" 
            onClick={fetchAllData}
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>
          <Link to="/borrower/books" className="btn-primary-gradient">
            <BookOpen size={18} />
            <span>Mượn Thêm Sách</span>
          </Link>
        </div>
      </div>

      {/* Mini Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div 
          className="card-glass" 
          style={{ 
            padding: '1.25rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            cursor: 'pointer',
            border: activeTab === 'borrowing' ? '1.5px solid var(--primary-light)' : undefined 
          }}
          onClick={() => setActiveTab('borrowing')}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--warning-bg)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Đang Mượn</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{activeBorrows.length}</div>
          </div>
        </div>

        <div 
          className="card-glass" 
          style={{ 
            padding: '1.25rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            cursor: 'pointer',
            border: activeTab === 'history' ? '1.5px solid var(--success)' : undefined 
          }}
          onClick={() => setActiveTab('history')}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookmarkCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Đã Trả Xong</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>{historyBorrows.length}</div>
          </div>
        </div>

        <div 
          className="card-glass" 
          style={{ 
            padding: '1.25rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            cursor: 'pointer',
            border: activeTab === 'pending' ? '1.5px solid var(--warning)' : undefined 
          }}
          onClick={() => setActiveTab('pending')}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Inbox size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Chờ Duyệt / Saga</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{pendingRecords.length}</div>
          </div>
        </div>

        <div 
          className="card-glass" 
          style={{ 
            padding: '1.25rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            cursor: 'pointer',
            border: activeTab === 'rejected' ? '1.5px solid var(--danger)' : undefined 
          }}
          onClick={() => setActiveTab('rejected')}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <XCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bị Từ Chối / Hủy</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger)' }}>{rejectedRecords.length}</div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        <button 
          className={`btn-secondary-modern ${activeTab === 'borrowing' ? 'btn-primary-gradient' : ''}`}
          style={{ padding: '0.6rem 1.15rem', fontSize: '0.875rem' }}
          onClick={() => setActiveTab('borrowing')}
        >
          <BookOpen size={16} />
          <span>Sách Đang Mượn ({activeBorrows.length})</span>
        </button>

        <button 
          className={`btn-secondary-modern ${activeTab === 'history' ? 'btn-primary-gradient' : ''}`}
          style={{ padding: '0.6rem 1.15rem', fontSize: '0.875rem' }}
          onClick={() => setActiveTab('history')}
        >
          <BookmarkCheck size={16} />
          <span>Lịch Sử Đã Trả ({historyBorrows.length})</span>
        </button>

        <button 
          className={`btn-secondary-modern ${activeTab === 'pending' ? 'btn-primary-gradient' : ''}`}
          style={{ padding: '0.6rem 1.15rem', fontSize: '0.875rem' }}
          onClick={() => setActiveTab('pending')}
        >
          <Inbox size={16} />
          <span>Chờ Duyệt & Xử Lý ({pendingRecords.length})</span>
        </button>

        <button 
          className={`btn-secondary-modern ${activeTab === 'rejected' ? 'btn-primary-gradient' : ''}`}
          style={{ padding: '0.6rem 1.15rem', fontSize: '0.875rem' }}
          onClick={() => setActiveTab('rejected')}
        >
          <XCircle size={16} />
          <span>Đơn Bị Từ Chối ({rejectedRecords.length})</span>
        </button>
      </div>

      {/* Table: Sách Đang Mượn */}
      {activeTab === 'borrowing' && (
        <div className="table-modern-wrapper">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Đầu Sách</th>
                <th>Thể Loại</th>
                <th>Ngày Mượn</th>
                <th>Hạn Trả (Due Date)</th>
                <th style={{ textAlign: 'right' }}>Tình Trạng</th>
              </tr>
            </thead>
            <tbody>
              {activeBorrows.map(record => {
                const book = booksMap.get(record.bookId) || {};
                const daysLeft = getDaysLeft(record.dueDate);
                const overdue = isOverdue(record.dueDate, record.returnDate);

                return (
                  <tr key={record.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <BookOpen size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                            {book.title || book.name || `Sách #${record.bookId ? record.bookId.substring(0, 8) : 'N/A'}`}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Tác giả: {book.author || 'Chưa cập nhật'} • Mã phiếu #{record.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-status badge-status-info">
                        <Tag size={12} />
                        {book.category?.name || 'Chưa phân loại'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        <Calendar size={14} />
                        <span>{record.borrowDate || 'Hôm nay'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: 600, color: overdue ? 'var(--danger)' : 'var(--text-primary)' }}>
                        <Calendar size={14} />
                        <span>{record.dueDate || 'Chưa có'}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {overdue ? (
                        <span className="badge-status badge-status-danger">
                          <AlertTriangle size={12} />
                          Quá hạn {Math.abs(daysLeft)} ngày
                        </span>
                      ) : (
                        <span className="badge-status badge-status-warning">
                          <Clock size={12} />
                          Còn {daysLeft} ngày
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {activeBorrows.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <BookmarkCheck size={48} style={{ opacity: 0.3 }} />
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                        Bạn chưa có cuốn sách nào đang mượn
                      </p>
                      <Link to="/borrower/books" className="btn-primary-gradient" style={{ marginTop: '0.5rem' }}>
                        <span>Khám phá kho sách ngay</span>
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Table: Lịch Sử Đã Trả */}
      {activeTab === 'history' && (
        <div className="table-modern-wrapper">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Đầu Sách</th>
                <th>Ngày Mượn</th>
                <th>Hạn Trả</th>
                <th>Ngày Đã Trả</th>
                <th style={{ textAlign: 'right' }}>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {historyBorrows.map(record => {
                const book = booksMap.get(record.bookId) || {};
                return (
                  <tr key={record.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <CheckCircle2 size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                            {book.title || book.name || `Sách #${record.bookId ? record.bookId.substring(0, 8) : 'N/A'}`}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Tác giả: {book.author || 'Chưa cập nhật'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{record.borrowDate}</td>
                    <td>{record.dueDate}</td>
                    <td>
                      <strong style={{ color: 'var(--success)' }}>{record.returnDate}</strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="badge-status badge-status-success">
                        <CheckCircle2 size={12} />
                        Đã hoàn tất
                      </span>
                    </td>
                  </tr>
                );
              })}

              {historyBorrows.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>Chưa có lịch sử trả sách.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Table: Yêu Cầu Chờ Duyệt & Tiến Độ Saga */}
      {activeTab === 'pending' && (
        <div className="table-modern-wrapper">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Đầu Sách</th>
                <th>Mã Phiếu / Saga ID</th>
                <th>Ngày Tạo</th>
                <th>Hạn Trả</th>
                <th style={{ textAlign: 'right' }}>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {pendingRecords.map(record => {
                const book = booksMap.get(record.bookId) || {};
                const isPending = record.status === 'PENDING';
                const isInProgress = record.status === 'IN_PROGRESS';
                const isReserved = record.status === 'BOOK_RESERVED';

                return (
                  <tr key={record.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {book.title || book.name || `Sách #${record.bookId ? record.bookId.substring(0, 8) : 'N/A'}`}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Tác giả: {book.author || 'Chưa cập nhật'}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--primary-light)' }}>
                        {record.sagaId ? `${record.sagaId.substring(0, 13)}...` : `#${record.id}`}
                      </span>
                    </td>
                    <td>{record.borrowDate || 'Hôm nay'}</td>
                    <td>{record.dueDate || '14 ngày'}</td>
                    <td style={{ textAlign: 'right' }}>
                      {isPending ? (
                        <span className="badge-status badge-status-warning">
                          <Clock size={12} />
                          Chờ Thủ Thư Duyệt
                        </span>
                      ) : isInProgress ? (
                        <span className="badge-status badge-status-info">
                          <RefreshCw size={12} className="animate-spin" />
                          Đang giữ kho sách...
                        </span>
                      ) : (
                        <span className="badge-status badge-status-info">
                          <RefreshCw size={12} className="animate-spin" />
                          Đang kiểm tra quá hạn...
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {pendingRecords.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>Không có yêu cầu mượn sách nào đang chờ duyệt.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Table: Bị Từ Chối / Rollback */}
      {activeTab === 'rejected' && (
        <div className="table-modern-wrapper">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Đầu Sách</th>
                <th>Mã Phiếu</th>
                <th>Ngày Tạo</th>
                <th>Lý Do Từ Chối</th>
                <th style={{ textAlign: 'right' }}>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {rejectedRecords.map(record => {
                const book = booksMap.get(record.bookId) || {};
                const isOverdueReject = record.status === 'REJECTED_OVERDUE';
                const isOutOfStock = record.status === 'REJECTED_OUT_OF_STOCK';

                return (
                  <tr key={record.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {book.title || book.name || `Sách #${record.bookId ? record.bookId.substring(0, 8) : 'N/A'}`}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Tác giả: {book.author || 'Chưa cập nhật'}
                      </div>
                    </td>
                    <td>#{record.id}</td>
                    <td>{record.borrowDate || 'N/A'}</td>
                    <td>
                      <span style={{ color: 'var(--danger)', fontSize: '0.875rem', fontWeight: 600 }}>
                        {record.rejectReason || (isOverdueReject ? 'Tài khoản có sách nợ quá hạn (Saga Rollback)' : isOutOfStock ? 'Hết sách trong kho' : 'Bị từ chối bởi thủ thư')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="badge-status badge-status-danger">
                        <XCircle size={12} />
                        {isOverdueReject ? 'Saga Rollback' : isOutOfStock ? 'Hết kho' : 'Từ chối'}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {rejectedRecords.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>Không có đơn nào bị từ chối.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyBooks;
