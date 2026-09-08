import React, { useState, useEffect, useMemo } from 'react';
import api, { getErrorMessage } from '../services/api';
import { 
  Inbox, 
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
  Send, 
  XCircle,
  RefreshCw
} from 'lucide-react';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [usersMap, setUsersMap] = useState(new Map());
  const [booksMap, setBooksMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Modal approve/reject state
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalActionType, setModalActionType] = useState('APPROVE'); // 'APPROVE' | 'REJECT'
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setActionError('');

      const [reqRes, usersRes, booksRes] = await Promise.all([
        api.get('/requests').catch(() => ({ data: [] })),
        api.get('/users').catch(() => ({ data: [] })),
        api.get('/books').catch(() => ({ data: [] }))
      ]);

      const reqList = Array.isArray(reqRes.data) ? reqRes.data : (reqRes.data?.data || []);
      const userList = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.data || []);
      const bookList = Array.isArray(booksRes.data) ? booksRes.data : (booksRes.data?.data || []);

      setRequests(reqList);

      const uMap = new Map();
      userList.forEach(u => uMap.set(u.id, u));
      setUsersMap(uMap);

      const bMap = new Map();
      bookList.forEach(b => bMap.set(b.id, b));
      setBooksMap(bMap);
    } catch (error) {
      console.error("Error fetching request data", error);
      setActionError("Lỗi khi tải danh sách yêu cầu chờ duyệt.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
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

  const openModal = (item, actionType = 'APPROVE') => {
    setSelectedItem(item);
    setModalActionType(actionType);
    setRejectReason('');
    setShowModal(true);
  };

  const handleModalSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedItem) return;

    setSubmitting(true);
    try {
      if (modalActionType === 'APPROVE') {
        const response = await api.post(`/manager/borrow/approve/${selectedItem.id}`);
        setShowModal(false);
        const book = booksMap.get(selectedItem.bookId);
        triggerSuccess(response.data?.message || `Đã phê duyệt cho mượn sách "${book?.title || book?.name || ''}"!`);
      } else {
        const response = await api.post(`/manager/borrow/reject/${selectedItem.id}`, {
          reason: rejectReason || 'Bị từ chối bởi thủ thư'
        });
        setShowModal(false);
        triggerSuccess(response.data?.message || `Đã từ chối yêu cầu mượn sách thành công.`);
      }

      fetchAllData();
    } catch (error) {
      console.error("Error processing request", error);
      triggerError(getErrorMessage(error, "Lỗi khi xử lý yêu cầu."));
    } finally {
      setSubmitting(false);
    }
  };

  // Filter requests by search
  const filteredRequests = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return requests;

    return requests.filter(r => {
      const user = usersMap.get(r.userId) || {};
      const book = booksMap.get(r.bookId) || {};
      const uName = (user.username || '').toLowerCase();
      const dName = (user.displayName || '').toLowerCase();
      const bTitle = (book.title || book.name || '').toLowerCase();
      return uName.includes(term) || dName.includes(term) || bTitle.includes(term);
    });
  }, [requests, search, usersMap, booksMap]);

  return (
    <div className="animate-fade-in">
      {/* Header Banner */}
      <div className="banner-mesh mb-4" style={{ padding: '1.75rem 2rem' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.18)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem', backdropFilter: 'blur(4px)' }}>
            <ShieldCheck size={14} /> Quản Trị Yêu Cầu Chờ Duyệt
          </div>
          <h1 className="banner-title" style={{ fontSize: '1.75rem' }}>Quản Lý Yêu Cầu Mượn Sách</h1>
          <p className="banner-subtitle" style={{ maxWidth: '650px' }}>
            Xem xét và phê duyệt hoặc từ chối các yêu cầu mượn sách đang chờ xử lý trong hệ thống.
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="badge-status badge-status-warning" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', fontWeight: 700 }}>
              <Inbox size={16} />
              <span>Chờ duyệt: {requests.length} yêu cầu</span>
            </span>
            <button className="btn-secondary-modern" onClick={fetchAllData} title="Làm mới danh sách">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              <span>Tải lại</span>
            </button>
          </div>

          <div className="search-input-group" style={{ flex: '1 1 250px', maxWidth: '380px' }}>
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

      {/* Table Content */}
      <div className="table-modern-wrapper">
        <table className="table-modern">
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Độc Giả</th>
              <th style={{ width: '30%' }}>Đầu Sách</th>
              <th style={{ width: '15%' }}>Ngày Tạo</th>
              <th style={{ width: '15%' }}>Hạn Trả</th>
              <th style={{ width: '15%', textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((item) => {
              const user = usersMap.get(item.userId) || {};
              const book = booksMap.get(item.bookId) || {};
              const avatarLetter = (user.displayName || user.username || 'U').charAt(0).toUpperCase();

              return (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div 
                        style={{ 
                          width: '38px', 
                          height: '38px', 
                          borderRadius: '50%', 
                          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
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
                          {user.displayName || user.username || 'Độc giả'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          @{user.username || 'username'}
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
                          {book.title || book.name || `Sách #${item.bookId ? item.bookId.substring(0, 8) : 'N/A'}`}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Tác giả: {book.author || 'Chưa cập nhật'}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {item.borrowDate || 'Hôm nay'}
                    </span>
                  </td>

                  <td>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.dueDate || '14 ngày'}
                    </span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button 
                        className="btn-primary-gradient" 
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                        onClick={() => openModal(item, 'APPROVE')}
                        title="Phê duyệt cho mượn sách"
                      >
                        <CheckCircle2 size={15} />
                        <span>Duyệt</span>
                      </button>
                      <button 
                        className="btn-secondary-modern" 
                        style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                        onClick={() => openModal(item, 'REJECT')}
                        title="Từ chối yêu cầu"
                      >
                        <XCircle size={15} />
                        <span>Từ chối</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredRequests.length === 0 && !loading && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <Send size={48} style={{ opacity: 0.3 }} />
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      Không có yêu cầu mượn sách nào cần xử lý
                    </p>
                    <span style={{ fontSize: '0.875rem' }}>Khi độc giả gửi yêu cầu mượn, thông tin sẽ xuất hiện tại đây.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Xử Lý / Phê Duyệt / Từ Chối */}
      {showModal && selectedItem && (
        <div className="modal-backdrop-custom" onClick={() => setShowModal(false)}>
          <div className="modal-dialog-custom" onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom">
              <div className="modal-title-custom">
                {modalActionType === 'APPROVE' ? (
                  <>
                    <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
                    <span>Phê Duyệt Yêu Cầu Mượn Sách</span>
                  </>
                ) : (
                  <>
                    <XCircle size={20} style={{ color: 'var(--danger)' }} />
                    <span>Từ Chối Yêu Cầu Mượn Sách</span>
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
                <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Độc giả:</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {usersMap.get(selectedItem.userId)?.displayName || usersMap.get(selectedItem.userId)?.username || 'Độc giả'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tên sách:</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {booksMap.get(selectedItem.bookId)?.title || booksMap.get(selectedItem.bookId)?.name || 'Sách'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hạn trả:</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--success)' }}>
                      {selectedItem.dueDate || '14 ngày'}
                    </span>
                  </div>
                </div>

                {modalActionType === 'REJECT' ? (
                  <div className="form-group-custom">
                    <label className="form-label-custom">Lý do từ chối</label>
                    <input 
                      type="text" 
                      className="form-control-custom"
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      placeholder="Ví dụ: Sách đang bảo trì, tài khoản có vi phạm..."
                      required
                    />
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Xác nhận phê duyệt cho độc giả mượn sách. Trạng thái phiếu sẽ chuyển thành <strong>APPROVED (Đang mượn)</strong>.
                  </p>
                )}
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
                  style={{
                    background: modalActionType === 'REJECT' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : undefined
                  }}
                >
                  <span>
                    {submitting 
                      ? 'Đang xử lý...' 
                      : modalActionType === 'APPROVE' 
                        ? 'Xác Nhận Phê Duyệt' 
                        : 'Xác Nhận Từ Chối'}
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

export default Requests;
