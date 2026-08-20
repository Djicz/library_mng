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
  Sparkles
} from 'lucide-react';

const MyBooks = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyBooks = async () => {
      try {
        const response = await api.get('/borrower/my-books');
        setRecords(response.data);
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
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  };

  const getDaysLeft = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const currentlyBorrowing = records.filter(r => !r.returnDate && !isOverdue(r.dueDate, r.returnDate)).length;
  const overdueCount = records.filter(r => isOverdue(r.dueDate, r.returnDate)).length;
  const returnedCount = records.filter(r => r.returnDate).length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Sách Của Tôi
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
          Theo dõi danh sách các đầu sách bạn đang mượn và lịch sử trả sách
        </p>
      </div>

      {/* Mini Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
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
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Quá Hạn</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger)' }}>{overdueCount}</div>
          </div>
        </div>

        <div className="card-glass" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Đã Trả Sách</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>{returnedCount}</div>
          </div>
        </div>
      </div>

      {/* Table */}
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
            {records.map(record => {
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
                      <span>{record.borrowDate}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: 600, color: overdue ? 'var(--danger)' : 'var(--text-primary)' }}>
                      <Calendar size={14} />
                      <span>{record.dueDate}</span>
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

            {records.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <BookmarkCheck size={48} style={{ opacity: 0.3 }} />
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      Bạn chưa mượn cuốn sách nào
                    </p>
                    <span style={{ fontSize: '0.875rem' }}>Hãy liên hệ thủ thư để mượn các đầu sách yêu thích nhé!</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyBooks;
