import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Repeat,
  BellRing,
  Trophy,
  Medal,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  UserCheck,
  Inbox
} from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const [message, setMessage] = useState('');
  const [jobMessage, setJobMessage] = useState('');
  const [jobError, setJobError] = useState('');
  const [jobLoading, setJobLoading] = useState(false);

  const [userCount, setUserCount] = useState(0);
  const [bookCount, setBookCount] = useState(0);
  const [borrowCount, setBorrowCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [reservationCount, setReservationCount] = useState(0);
  const [topBorrowers, setTopBorrowers] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/manager/dashboard');
        setMessage(response.data.message);
      } catch (error) {
        console.error("Error fetching dashboard", error);
      }
    };

    const fetchStats = async () => {
      try {
        const [userRes, bookRes, borrowRes, reqRes, bookReqRes, endReqRes] = await Promise.all([
          api.get('/manager/dashboard/user-count'),
          api.get('/manager/dashboard/book-count'),
          api.get('/manager/dashboard/borrow-count'),
          api.get('/manager/request').catch(() => ({ data: [] })),
          api.get('/manager/request/book').catch(() => ({ data: [] })),
          api.get('/manager/request/end').catch(() => ({ data: [] }))
        ]);

        setUserCount(userRes.data || 0);
        setBookCount(bookRes.data || 0);
        
        const totalPending = (Array.isArray(reqRes.data) ? reqRes.data.length : 0) +
                             (Array.isArray(bookReqRes.data) ? bookReqRes.data.length : 0) +
                             (Array.isArray(endReqRes.data) ? endReqRes.data.length : 0);
        setRequestCount(totalPending);

        if (Array.isArray(borrowRes.data)) {
          const total = borrowRes.data.reduce((acc, curr) => acc + (curr.count || 0), 0);
          setBorrowCount(total);

          const filteredBorrowers = borrowRes.data.filter(u => u.username !== 'admin');
          setTopBorrowers(filteredBorrowers.slice(0, 10));
        }
      } catch (error) {
        console.error("Error fetching stats", error);
      }
    };

    fetchDashboard();
    fetchStats();
  }, []);

  const triggerJob = async () => {
    setJobLoading(true);
    setJobMessage('');
    setJobError('');
    try {
      const response = await api.post('/manager/dashboard/trigger-job');
      setJobMessage(response.data.message || 'Job kiểm tra quá hạn và gửi thông báo đã chạy thành công!');
    } catch (error) {
      setJobError(error.response?.data?.error || 'Lỗi khi kích hoạt Job thông báo.');
    } finally {
      setJobLoading(false);
    }
  };

  const getAvatarGradient = (str) => {
    const gradients = [
      'linear-gradient(135deg, #6366f1, #a855f7)',
      'linear-gradient(135deg, #3b82f6, #06b6d4)',
      'linear-gradient(135deg, #10b981, #14b8a6)',
      'linear-gradient(135deg, #f59e0b, #ef4444)',
      'linear-gradient(135deg, #ec4899, #8b5cf6)'
    ];
    let hash = 0;
    for (let i = 0; i < (str || '').length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  };

  return (
    <div className="animate-fade-in">
      {/* Mesh Banner */}
      <div className="banner-mesh">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.18)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem', backdropFilter: 'blur(4px)' }}>
            <Sparkles size={14} /> Tổng quan Quản trị Thư viện
          </div>
          <h1 className="banner-title">Xin chào, Quản trị viên!</h1>
          <p className="banner-subtitle">
            {message || 'Hệ thống Quản lý Thư viện Deep Blue Pro đã đồng bộ và sẵn sàng phục vụ độc giả.'}
          </p>
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <button
            onClick={triggerJob}
            disabled={jobLoading}
            className="btn-secondary-modern"
            style={{
              padding: '0.85rem 1.5rem',
              borderRadius: 'var(--radius-lg)',
              fontWeight: 700,
              color: 'var(--primary-dark)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <BellRing size={18} className={jobLoading ? 'animate-spin' : ''} style={{ color: 'var(--primary)' }} />
            <span>{jobLoading ? 'Đang gửi thông báo...' : 'Chạy Job Thông Báo'}</span>
          </button>
        </div>
      </div>

      {jobMessage && (
        <div className="badge-status badge-status-success w-100 mb-4" style={{ padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
          <CheckCircle2 size={18} />
          <span>{jobMessage}</span>
        </div>
      )}

      {jobError && (
        <div className="badge-status badge-status-danger w-100 mb-4" style={{ padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
          <AlertCircle size={18} />
          <span>{jobError}</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="stat-card-modern">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))', color: 'var(--primary)' }}>
            <Users size={28} />
          </div>
          <div>
            <div className="stat-label">Tổng Người Dùng</div>
            <div className="stat-value">{userCount}</div>
          </div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(20, 184, 166, 0.15))', color: 'var(--success)' }}>
            <BookOpen size={28} />
          </div>
          <div>
            <div className="stat-label">Tổng Đầu Sách</div>
            <div className="stat-value">{bookCount}</div>
          </div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.15))', color: 'var(--warning)' }}>
            <Repeat size={28} />
          </div>
          <div>
            <div className="stat-label">Lượt Mượn Sách</div>
            <div className="stat-value">{borrowCount}</div>
          </div>
        </div>

        <Link to="/manager/requests" className="stat-card-modern" style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.15))', color: 'var(--warning)' }}>
            <Inbox size={28} />
          </div>
          <div>
            <div className="stat-label">Yêu Cầu Chờ Duyệt</div>
            <div className="stat-value" style={{ color: requestCount > 0 ? 'var(--warning)' : undefined }}>
              {requestCount}
            </div>
          </div>
        </Link>
      </div>

      {/* Leaderboard */}
      <div className="card-glass">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
              <Trophy size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Top 10 Độc Giả Mượn Nhiều Nhất
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Bảng xếp hạng độc giả tích cực đọc sách nhất thư viện
              </span>
            </div>
          </div>
          <div className="badge-status badge-status-neutral">
            <TrendingUp size={14} /> Cập nhật tự động
          </div>
        </div>

        <div className="table-modern-wrapper">
          <table className="table-modern">
            <thead>
              <tr>
                <th style={{ width: '140px', whiteSpace: 'nowrap' }}>Thứ Hạng</th>
                <th>Độc Giả</th>
                <th>Tài Khoản</th>
                <th style={{ width: '180px', textAlign: 'right' }}>Số Sách Đã Mượn</th>
              </tr>
            </thead>
            <tbody>
              {topBorrowers.map((user, index) => {
                const isFirst = index === 0;
                const isSecond = index === 1;
                const isThird = index === 2;

                return (
                  <tr key={user.username}>
                    <td>
                      {isFirst ? (
                        <span
                          className="badge-status"
                          style={{
                            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                            color: '#b45309',
                            border: '1px solid #fcd34d',
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.35rem 0.75rem'
                          }}
                        >
                          <Trophy size={14} style={{ color: '#d97706', flexShrink: 0 }} />
                          <span>#1 Gold</span>
                        </span>
                      ) : isSecond ? (
                        <span
                          className="badge-status"
                          style={{
                            background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                            color: '#475569',
                            border: '1px solid #cbd5e1',
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.35rem 0.75rem'
                          }}
                        >
                          <Medal size={14} style={{ color: '#64748b', flexShrink: 0 }} />
                          <span>#2 Silver</span>
                        </span>
                      ) : isThird ? (
                        <span
                          className="badge-status"
                          style={{
                            background: 'linear-gradient(135deg, #ffedd5, #fed7aa)',
                            color: '#c2410c',
                            border: '1px solid #fdba74',
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.35rem 0.75rem'
                          }}
                        >
                          <Medal size={14} style={{ color: '#ea580c', flexShrink: 0 }} />
                          <span>#3 Bronze</span>
                        </span>
                      ) : (
                        <span
                          className="badge-status badge-status-neutral"
                          style={{
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '42px'
                          }}
                        >
                          #{index + 1}
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: getAvatarGradient(user.displayName || user.username),
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {(user.displayName || user.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {user.displayName || user.username}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        @{user.username}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="badge-status badge-status-info" style={{ fontWeight: 800 }}>
                        {user.count} cuốn sách
                      </span>
                    </td>
                  </tr>
                );
              })}

              {topBorrowers.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <UserCheck size={36} style={{ opacity: 0.4 }} />
                      <p style={{ margin: 0, fontWeight: 600 }}>Chưa có dữ liệu độc giả mượn sách.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
