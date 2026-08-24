import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { 
  BookmarkPlus, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  BookOpen, 
  Calendar, 
  User, 
  Clock, 
  Tag, 
  ShieldCheck,
  X,
  Inbox
} from 'lucide-react';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Modal approve state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [approving, setApproving] = useState(false);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      // Lấy toàn bộ bản ghi và lọc các đơn đặt trước (usBook == 2)
      const response = await api.get('/manager/borrows');
      if (Array.isArray(response.data)) {
        const list = response.data.filter(r => r.usBook === 2);
        setReservations(list);
      } else {
        setReservations([]);
      }
    } catch (error) {
      console.error("Error fetching reservations", error);
      setActionError("Lỗi khi tải danh sách đặt trước sách.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
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

  const openApproveModal = (res) => {
    setSelectedReservation(res);
    setShowApproveModal(true);
  };

  const handleApproveSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedReservation) return;

    setApproving(true);
    try {
      // Phê duyệt đơn đặt trước qua API PUT /api/manager/borrows/approve/{id}
      await api.put(`/manager/borrows/approve/${selectedReservation.id}`);

      setShowApproveModal(false);
      triggerSuccess(`Đã phê duyệt đơn đặt trước sách "${selectedReservation.book?.name}" cho độc giả ${selectedReservation.user?.displayName || selectedReservation.user?.username}!`);
      fetchReservations();
    } catch (error) {
      console.error("Error approving reservation", error);
      triggerError(error.response?.data?.message || error.response?.data || "Lỗi khi phê duyệt đặt trước.");
    } finally {
      setApproving(false);
    }
  };

  const filteredReservations = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return reservations;

    return reservations.filter(r => {
      const uName = (r.user?.username || '').toLowerCase();
      const dName = (r.user?.displayName || '').toLowerCase();
      const bName = (r.book?.name || '').toLowerCase();
      return uName.includes(term) || dName.includes(term) || bName.includes(term);
    });
  }, [reservations, search]);

  const getAvatarGradient = (str) => {
    const gradients = [
      'linear-gradient(135deg, #6366f1, #a855f7)',
      'linear-gradient(135deg, #3b82f6, #06b6d4)',
      'linear-gradient(135deg, #10b981, #14b8a6)',
      'linear-gradient(135deg, #f59e0b, #ef4444)',
      'linear-gradient(135deg, #8b5cf6, #ec4899)'
    ];
    if (!str) return gradients[0];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  };

  return (
    <div className="animate-fade-in">
      {/* Header Banner */}
      <div className="banner-mesh mb-4" style={{ padding: '1.75rem 2rem' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.18)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem', backdropFilter: 'blur(4px)' }}>
            <ShieldCheck size={14} /> Quản Trị Đặt Trước
          </div>
          <h1 className="banner-title" style={{ fontSize: '1.75rem' }}>Quản Lý Đơn Đặt Trước Sách</h1>
          <p className="banner-subtitle" style={{ maxWidth: '650px' }}>
            Xem xét và phê duyệt các đơn <strong>đặt trước sách cho ngày tương lai</strong> từ độc giả.
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

      {/* Search & Filter */}
      <div className="card-glass mb-4" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge-status badge-status-neutral" style={{ padding: '0.5rem 1rem', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-light)', borderColor: 'rgba(99, 102, 241, 0.3)', fontWeight: 700 }}>
              <BookmarkPlus size={16} />
              <span>Tổng đơn đặt trước: {reservations.length}</span>
            </span>
          </div>

          <div className="search-input-group" style={{ flex: '1 1 250px', maxWidth: '400px' }}>
            <Search size={18} className="search-icon-inside" />
            <input 
              type="text" 
              className="search-input-field" 
              placeholder="Tìm theo tên độc giả hoặc tên sách..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* Table Reservations */}
      <div className="table-modern-wrapper">
        <table className="table-modern">
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Độc Giả</th>
              <th style={{ width: '25%' }}>Đầu Sách</th>
              <th style={{ width: '20%' }}>Thời Gian Đặt Trước</th>
              <th style={{ width: '15%' }}>Tồn Kho</th>
              <th style={{ width: '15%', textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.map((res, idx) => {
              const bookAvailable = (res.book?.quantity || 0) > 0;
              const avatarLetter = (res.user?.displayName || res.user?.username || 'U').charAt(0).toUpperCase();

              return (
                <tr key={res.id || idx}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div 
                        style={{ 
                          width: '38px', 
                          height: '38px', 
                          borderRadius: '50%', 
                          background: getAvatarGradient(res.user?.displayName || res.user?.username),
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {avatarLetter}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          {res.user?.displayName || res.user?.username || 'Độc giả'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          @{res.user?.username || 'username'}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <BookOpen size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          {res.book?.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Thể loại: {res.book?.category?.name || 'Chưa phân loại'}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      <div>Ngày nhận: <strong style={{ color: 'var(--primary-light)' }}>{res.borrowDate}</strong></div>
                      <div>Hạn trả: <strong>{res.dueDate}</strong></div>
                    </div>
                  </td>

                  <td>
                    {bookAvailable ? (
                      <span className="badge-status badge-status-success">
                        <span className="badge-dot"></span>
                        Còn {res.book?.quantity} cuốn
                      </span>
                    ) : (
                      <span className="badge-status badge-status-danger">
                        <span className="badge-dot"></span>
                        Hết sách (0)
                      </span>
                    )}
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="btn-primary-gradient" 
                      style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
                      onClick={() => openApproveModal(res)}
                      title="Phê duyệt đơn đặt trước này"
                    >
                      <CheckCircle2 size={15} />
                      <span>Phê Duyệt</span>
                    </button>
                  </td>
                </tr>
              );
            })}

            {filteredReservations.length === 0 && !loading && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <BookmarkPlus size={48} style={{ opacity: 0.3 }} />
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      Không có đơn đặt trước sách nào
                    </p>
                    <span style={{ fontSize: '0.875rem' }}>Mọi đơn đặt trước sách từ độc giả sẽ hiển thị tại đây.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Phê Duyệt */}
      {showApproveModal && selectedReservation && (
        <div className="modal-backdrop-custom" onClick={() => setShowApproveModal(false)}>
          <div className="modal-dialog-custom" onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom">
              <div className="modal-title-custom">
                <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
                <span>Phê Duyệt Đặt Trước Sách</span>
              </div>
              <button 
                onClick={() => setShowApproveModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleApproveSubmit}>
              <div className="modal-body-custom">
                <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Độc giả:</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {selectedReservation.user?.displayName || selectedReservation.user?.username} (@{selectedReservation.user?.username})
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tên sách:</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {selectedReservation.book?.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ngày nhận sách:</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-light)' }}>
                      {selectedReservation.borrowDate}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hạn trả:</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--success)' }}>
                      {selectedReservation.dueDate}
                    </span>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Khi phê duyệt, đơn đặt trước sẽ được kích hoạt thành <strong>Đang Mượn (usBook: 0)</strong> và trừ tồn kho.
                </p>
              </div>

              <div className="modal-footer-custom">
                <button 
                  type="button" 
                  className="btn-secondary-modern" 
                  onClick={() => setShowApproveModal(false)}
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="btn-primary-gradient"
                  disabled={approving}
                >
                  <span>{approving ? 'Đang phê duyệt...' : 'Xác Nhận Phê Duyệt'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;
