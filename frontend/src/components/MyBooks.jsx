import React, { useState, useEffect } from 'react';
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
  BookMarked, 
  BookmarkPlus,
  PackageCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MyBooks = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('borrowing'); // 'borrowing' | 'requests' | 'reservations' | 'ready'

  useEffect(() => {
    const fetchMyBooks = async () => {
      try {
        setLoading(true);
        // Gọi API GET /api/borrower/my-books của BorrowController
        const response = await api.get('/borrower/my-books');
        setRecords(response.data || []);
      } catch (error) {
        console.error("Error fetching my books", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyBooks();
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

  // Phân loại bản ghi theo usBook:
  // usBook === 0: Sách đang mượn / đã trả
  // usBook === 1: Yêu cầu mượn sách (mượn ngay)
  // usBook === 2: Đơn đặt trước đang chờ thủ thư duyệt
  // usBook === 4: Đơn đặt trước đã được duyệt, chờ độc giả đến lấy sách!
  const activeBorrows = records.filter(r => r.usBook === 0 || r.usBook === undefined || r.usBook === null);
  const pendingBorrowRequests = records.filter(r => r.usBook === 1);
  const pendingReservations = records.filter(r => r.usBook === 2);
  const readyReservations = records.filter(r => r.usBook === 4);

  const currentlyBorrowing = activeBorrows.filter(r => !r.returnDate && !isOverdue(r.dueDate, r.returnDate)).length;
  const overdueCount = activeBorrows.filter(r => isOverdue(r.dueDate, r.returnDate)).length;
  const returnedCount = activeBorrows.filter(r => r.returnDate).length;
  const borrowRequestCount = pendingBorrowRequests.length;
  const reservationCount = pendingReservations.length;
  const readyCount = readyReservations.length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Sách Của Tôi
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
            Theo dõi sách đang mượn, các yêu cầu chờ duyệt và các đơn đặt trước sẵn sàng nhận sách
          </p>
        </div>

        <Link to="/borrower/books" className="btn-primary-gradient">
          <BookOpen size={18} />
          <span>Tìm & Mượn Sách Mới</span>
        </Link>
      </div>

      {/* Mini Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div className="card-glass" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--warning-bg)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Đang Mượn</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{currentlyBorrowing}</div>
          </div>
        </div>

        <div className="card-glass" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Inbox size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Chờ Duyệt Mượn</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{borrowRequestCount}</div>
          </div>
        </div>

        <div className="card-glass" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookmarkPlus size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Chờ Duyệt Đặt</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-light)' }}>{reservationCount}</div>
          </div>
        </div>

        <div className="card-glass" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PackageCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Chờ Đến Nhận Sách</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>{readyCount}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        <button 
          className={`btn-secondary-modern ${activeTab === 'borrowing' ? 'btn-primary-gradient' : ''}`}
          style={{ padding: '0.6rem 1.15rem', fontSize: '0.875rem' }}
          onClick={() => setActiveTab('borrowing')}
        >
          <BookOpen size={16} />
          <span>Sách Đang Mượn & Lịch Sử ({activeBorrows.length})</span>
        </button>

        <button 
          className={`btn-secondary-modern ${activeTab === 'requests' ? 'btn-primary-gradient' : ''}`}
          style={{ padding: '0.6rem 1.15rem', fontSize: '0.875rem' }}
          onClick={() => setActiveTab('requests')}
        >
          <Inbox size={16} />
          <span>Yêu Cầu Chờ Duyệt ({pendingBorrowRequests.length})</span>
        </button>

        <button 
          className={`btn-secondary-modern ${activeTab === 'reservations' ? 'btn-primary-gradient' : ''}`}
          style={{ padding: '0.6rem 1.15rem', fontSize: '0.875rem' }}
          onClick={() => setActiveTab('reservations')}
        >
          <BookmarkPlus size={16} />
          <span>Đặt Trước Chờ Duyệt ({pendingReservations.length})</span>
        </button>

        <button 
          className={`btn-secondary-modern ${activeTab === 'ready' ? 'btn-primary-gradient' : ''}`}
          style={{ padding: '0.6rem 1.15rem', fontSize: '0.875rem', borderColor: readyCount > 0 ? 'var(--success)' : undefined }}
          onClick={() => setActiveTab('ready')}
        >
          <PackageCheck size={16} />
          <span>Đã Duyệt - Chờ Nhận Sách ({readyReservations.length})</span>
        </button>
      </div>

      {/* Table Sách Đang Mượn (usBook: 0) */}
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
                            {record.book?.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Mã phiếu: #{record.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-status badge-status-info">
                        <Tag size={12} />
                        {record.book?.category?.name || 'Chưa phân loại'}
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
                      {record.returnDate ? (
                        <span className="badge-status badge-status-success">
                          <CheckCircle2 size={12} />
                          Đã trả ({record.returnDate})
                        </span>
                      ) : overdue ? (
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

      {/* Table Yêu Cầu Chờ Duyệt (usBook: 1) */}
      {activeTab === 'requests' && (
        <div className="table-modern-wrapper">
          <table className="table-modern">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Đầu Sách Đã Yêu Cầu</th>
                <th style={{ width: '20%' }}>Thể Loại</th>
                <th style={{ width: '20%' }}>Thời Gian Đề Xuất</th>
                <th style={{ width: '20%', textAlign: 'right' }}>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {pendingBorrowRequests.map((record, idx) => (
                <tr key={record.id || idx}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--warning-bg)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <BookMarked size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          {record.book?.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Mã sách: #{record.book?.id ? record.book.id.substring(0, 8) : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge-status badge-status-info">
                      <Tag size={12} />
                      {record.book?.category?.name || 'Chưa phân loại'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      <div>Bắt đầu: <strong>{record.borrowDate || 'Hôm nay'}</strong></div>
                      <div>Hạn trả: <strong>{record.dueDate || '14 ngày'}</strong></div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="badge-status badge-status-warning" style={{ fontWeight: 700 }}>
                      <Clock size={14} />
                      <span>Chờ thủ thư duyệt</span>
                    </span>
                  </td>
                </tr>
              ))}

              {pendingBorrowRequests.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <Inbox size={48} style={{ opacity: 0.3 }} />
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                        Không có yêu cầu mượn sách nào đang chờ xử lý
                      </p>
                      <Link to="/borrower/books" className="btn-secondary-modern" style={{ marginTop: '0.5rem' }}>
                        <span>Đến danh mục để gửi yêu cầu</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Table Đặt Trước Chờ Duyệt (usBook: 2) */}
      {activeTab === 'reservations' && (
        <div className="table-modern-wrapper">
          <table className="table-modern">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Đầu Sách Đã Đặt Trước</th>
                <th style={{ width: '20%' }}>Thể Loại</th>
                <th style={{ width: '20%' }}>Ngày Nhận Dự Kiến</th>
                <th style={{ width: '20%', textAlign: 'right' }}>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {pendingReservations.map((record, idx) => (
                <tr key={record.id || idx}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <BookmarkPlus size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          {record.book?.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Mã phiếu đặt: #{record.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge-status badge-status-info">
                      <Tag size={12} />
                      {record.book?.category?.name || 'Chưa phân loại'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      <div>Nhận sách: <strong style={{ color: 'var(--primary-light)' }}>{record.borrowDate}</strong></div>
                      <div>Hạn trả: <strong>{record.dueDate}</strong></div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="badge-status badge-status-neutral" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary-light)', borderColor: 'rgba(99, 102, 241, 0.3)', fontWeight: 700 }}>
                      <Clock size={14} />
                      <span>Chờ thủ thư duyệt</span>
                    </span>
                  </td>
                </tr>
              ))}

              {pendingReservations.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <BookmarkPlus size={48} style={{ opacity: 0.3 }} />
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                        Bạn chưa có đơn đặt trước sách nào đang chờ duyệt
                      </p>
                      <Link to="/borrower/books" className="btn-secondary-modern" style={{ marginTop: '0.5rem' }}>
                        <span>Khám phá sách và đặt trước</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Table Đã Duyệt - Chờ Đến Nhận Sách (usBook: 4) */}
      {activeTab === 'ready' && (
        <div className="table-modern-wrapper">
          <table className="table-modern">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Đầu Sách Đã Được Duyệt</th>
                <th style={{ width: '20%' }}>Thể Loại</th>
                <th style={{ width: '20%' }}>Lịch Hẹn Nhận Sách</th>
                <th style={{ width: '20%', textAlign: 'right' }}>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {readyReservations.map((record, idx) => (
                <tr key={record.id || idx}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <PackageCheck size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          {record.book?.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Mã phiếu: #{record.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge-status badge-status-info">
                      <Tag size={12} />
                      {record.book?.category?.name || 'Chưa phân loại'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      <div>Đến nhận ngày: <strong style={{ color: 'var(--success)' }}>{record.borrowDate}</strong></div>
                      <div>Hạn trả dự kiến: <strong>{record.dueDate}</strong></div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="badge-status badge-status-success" style={{ fontWeight: 700 }}>
                      <PackageCheck size={14} />
                      <span>Đã duyệt - Đến nhận sách</span>
                    </span>
                  </td>
                </tr>
              ))}

              {readyReservations.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <PackageCheck size={48} style={{ opacity: 0.3 }} />
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                        Không có cuốn sách nào đang chờ đến nhận
                      </p>
                      <span style={{ fontSize: '0.875rem' }}>Khi thủ thư duyệt đơn đặt trước, thông tin sẽ hiển thị tại đây.</span>
                    </div>
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
