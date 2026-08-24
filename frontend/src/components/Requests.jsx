import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
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
  BookmarkPlus, 
  PackageCheck,
  ArrowRight
} from 'lucide-react';

const Requests = () => {
  const [borrowRequests, setBorrowRequests] = useState([]);     // usBook == 1
  const [bookReservations, setBookReservations] = useState([]);   // usBook == 2
  const [readyReservations, setReadyReservations] = useState([]); // usBook == 4
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // 3 Options Tab:
  // 'BORROW_REQUEST' (1) | 'RESERVATION' (2) | 'READY_PICKUP' (4)
  const [activeTab, setActiveTab] = useState('BORROW_REQUEST');

  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Modal approve state
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalActionType, setModalActionType] = useState('APPROVE'); // 'APPROVE' (/approve/{id}) | 'DELIVER' (/don/{id})
  const [submitting, setSubmitting] = useState(false);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setActionError('');

      // Gọi trực tiếp các API trong RequestController:
      // 1. GET /api/manager/request (usBook == 1)
      // 2. GET /api/manager/request/book (usBook == 2)
      // 3. GET /api/manager/request/end (usBook == 4)
      const [reqRes, bookRes, endRes] = await Promise.all([
        api.get('/manager/request'),
        api.get('/manager/request/book'),
        api.get('/manager/request/end')
      ]);

      setBorrowRequests(Array.isArray(reqRes.data) ? reqRes.data : []);
      setBookReservations(Array.isArray(bookRes.data) ? bookRes.data : []);
      setReadyReservations(Array.isArray(endRes.data) ? endRes.data : []);
    } catch (error) {
      console.error("Error fetching request data from RequestController", error);
      setActionError("Lỗi khi tải danh sách từ RequestController.");
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

  const openApproveModal = (item, actionType = 'APPROVE') => {
    setSelectedItem(item);
    setModalActionType(actionType);
    setShowModal(true);
  };

  const handleModalSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedItem) return;

    setSubmitting(true);
    try {
      if (modalActionType === 'APPROVE') {
        // Duyệt Yêu cầu mượn (usBook 1 -> 0) hoặc Duyệt Đặt trước (usBook 2 -> 4)
        await api.put(`/manager/borrows/approve/${selectedItem.id}`);
        setShowModal(false);

        if (selectedItem.usBook === 1) {
          triggerSuccess(`Đã phê duyệt cho mượn sách "${selectedItem.book?.name}" cho độc giả ${selectedItem.user?.displayName || selectedItem.user?.username}!`);
        } else {
          triggerSuccess(`Đã duyệt đơn đặt trước sách "${selectedItem.book?.name}" (chuyển sang Chờ lấy sách)!`);
        }
      } else {
        // Xác nhận độc giả đã đến lấy sách (usBook 4 -> 0)
        await api.put(`/manager/borrows/don/${selectedItem.id}`);
        setShowModal(false);
        triggerSuccess(`Đã xác nhận giao sách "${selectedItem.book?.name}" cho độc giả ${selectedItem.user?.displayName || selectedItem.user?.username}! Trạng thái chuyển sang Đang Mượn.`);
      }

      fetchAllData();
    } catch (error) {
      console.error("Error processing request", error);
      triggerError(error.response?.data?.message || error.response?.data || "Lỗi khi xử lý yêu cầu.");
    } finally {
      setSubmitting(false);
    }
  };

  // Lọc theo search và tab đang chọn
  const currentList = useMemo(() => {
    let baseList = [];
    if (activeTab === 'BORROW_REQUEST') baseList = borrowRequests;
    else if (activeTab === 'RESERVATION') baseList = bookReservations;
    else if (activeTab === 'READY_PICKUP') baseList = readyReservations;

    const term = search.trim().toLowerCase();
    if (!term) return baseList;

    return baseList.filter(r => {
      const uName = (r.user?.username || '').toLowerCase();
      const dName = (r.user?.displayName || '').toLowerCase();
      const bName = (r.book?.name || '').toLowerCase();
      return uName.includes(term) || dName.includes(term) || bName.includes(term);
    });
  }, [activeTab, borrowRequests, bookReservations, readyReservations, search]);

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
            <ShieldCheck size={14} /> Quản Trị Yêu Cầu & Đặt Trước
          </div>
          <h1 className="banner-title" style={{ fontSize: '1.75rem' }}>Quản Lý Yêu Cầu Mượn & Đặt Trước</h1>
          <p className="banner-subtitle" style={{ maxWidth: '650px' }}>
            Phê duyệt <strong>Yêu cầu mượn ngay</strong>, <strong>Duyệt đặt trước</strong> và <strong>Xác nhận giao sách đặt trước</strong> cho độc giả.
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

      {/* Mini Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div 
          className="card-glass" 
          style={{ 
            padding: '1.25rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            cursor: 'pointer',
            border: activeTab === 'BORROW_REQUEST' ? '1.5px solid var(--warning)' : undefined 
          }}
          onClick={() => setActiveTab('BORROW_REQUEST')}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--warning-bg)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>1. Mượn Ngay</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--warning)' }}>{borrowRequests.length}</div>
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
            border: activeTab === 'RESERVATION' ? '1.5px solid var(--primary-light)' : undefined 
          }}
          onClick={() => setActiveTab('RESERVATION')}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookmarkPlus size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>2. Đặt Trước</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-light)' }}>{bookReservations.length}</div>
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
            border: activeTab === 'READY_PICKUP' ? '1.5px solid var(--success)' : undefined 
          }}
          onClick={() => setActiveTab('READY_PICKUP')}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PackageCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>3. Chờ Lấy Sách</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success)' }}>{readyReservations.length}</div>
          </div>
        </div>
      </div>

      {/* 3 Options Tab Switcher & Search Bar */}
      <div className="card-glass mb-4" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Options Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-md)', flexWrap: 'wrap' }}>
            <button 
              className={`btn-secondary-modern ${activeTab === 'BORROW_REQUEST' ? 'btn-primary-gradient' : ''}`}
              style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem', border: 'none' }}
              onClick={() => setActiveTab('BORROW_REQUEST')}
            >
              <Send size={15} />
              <span>Yêu Cầu Mượn ({borrowRequests.length})</span>
            </button>

            <button 
              className={`btn-secondary-modern ${activeTab === 'RESERVATION' ? 'btn-primary-gradient' : ''}`}
              style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem', border: 'none' }}
              onClick={() => setActiveTab('RESERVATION')}
            >
              <BookmarkPlus size={15} />
              <span>Duyệt Đặt Trước ({bookReservations.length})</span>
            </button>

            <button 
              className={`btn-secondary-modern ${activeTab === 'READY_PICKUP' ? 'btn-primary-gradient' : ''}`}
              style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem', border: 'none' }}
              onClick={() => setActiveTab('READY_PICKUP')}
            >
              <PackageCheck size={15} />
              <span>Chờ Lấy Sách ({readyReservations.length})</span>
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
              <th style={{ width: '25%' }}>Đầu Sách</th>
              <th style={{ width: '20%' }}>
                {activeTab === 'BORROW_REQUEST' 
                  ? 'Thời Gian Mượn' 
                  : activeTab === 'RESERVATION' 
                    ? 'Ngày Đặt Trước' 
                    : 'Ngày Hẹn Nhận'}
              </th>
              <th style={{ width: '15%' }}>Tồn Kho</th>
              <th style={{ width: '15%', textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {currentList.map((item, idx) => {
              const bookAvailable = (item.book?.quantity || 0) > 0;
              const avatarLetter = (item.user?.displayName || item.user?.username || 'U').charAt(0).toUpperCase();

              return (
                <tr key={item.id || idx}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div 
                        style={{ 
                          width: '38px', 
                          height: '38px', 
                          borderRadius: '50%', 
                          background: getAvatarGradient(item.user?.displayName || item.user?.username),
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
                          {item.user?.displayName || item.user?.username || 'Độc giả'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          @{item.user?.username || 'username'}
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
                          {item.book?.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Thể loại: {item.book?.category?.name || 'Chưa phân loại'}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      <div>
                        {activeTab === 'BORROW_REQUEST' ? 'Bắt đầu: ' : 'Ngày nhận: '}
                        <strong style={{ color: activeTab === 'READY_PICKUP' ? 'var(--success)' : 'var(--text-primary)' }}>
                          {item.borrowDate || 'Hôm nay'}
                        </strong>
                      </div>
                      <div>Hạn trả: <strong>{item.dueDate || '14 ngày'}</strong></div>
                    </div>
                  </td>

                  <td>
                    {bookAvailable ? (
                      <span className="badge-status badge-status-success">
                        <span className="badge-dot"></span>
                        Còn {item.book?.quantity} cuốn
                      </span>
                    ) : (
                      <span className="badge-status badge-status-danger">
                        <span className="badge-dot"></span>
                        Hết sách (0)
                      </span>
                    )}
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    {activeTab === 'BORROW_REQUEST' && (
                      <button 
                        className="btn-primary-gradient" 
                        style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
                        onClick={() => openApproveModal(item, 'APPROVE')}
                        title="Phê duyệt cho mượn sách ngay"
                      >
                        <CheckCircle2 size={15} />
                        <span>Duyệt Mượn</span>
                      </button>
                    )}

                    {activeTab === 'RESERVATION' && (
                      <button 
                        className="btn-primary-gradient" 
                        style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                        onClick={() => openApproveModal(item, 'APPROVE')}
                        title="Duyệt đơn đặt trước"
                      >
                        <BookmarkPlus size={15} />
                        <span>Duyệt Đặt</span>
                      </button>
                    )}

                    {activeTab === 'READY_PICKUP' && (
                      <button 
                        className="btn-primary-gradient" 
                        style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', background: 'linear-gradient(135deg, #10b981, #059669)' }}
                        onClick={() => openApproveModal(item, 'DELIVER')}
                        title="Xác nhận độc giả đã đến lấy sách"
                      >
                        <PackageCheck size={15} />
                        <span>Giao Sách</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}

            {currentList.length === 0 && !loading && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    {activeTab === 'BORROW_REQUEST' ? (
                      <>
                        <Send size={48} style={{ opacity: 0.3 }} />
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                          Không có yêu cầu mượn sách nào cần xử lý
                        </p>
                      </>
                    ) : activeTab === 'RESERVATION' ? (
                      <>
                        <BookmarkPlus size={48} style={{ opacity: 0.3 }} />
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                          Không có đơn đặt trước sách nào cần duyệt
                        </p>
                      </>
                    ) : (
                      <>
                        <PackageCheck size={48} style={{ opacity: 0.3 }} />
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                          Không có độc giả nào đang chờ lấy sách đặt trước
                        </p>
                      </>
                    )}
                    <span style={{ fontSize: '0.875rem' }}>Dữ liệu sẽ tự động xuất hiện tại đây khi có yêu cầu mới.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Xử Lý / Phê Duyệt */}
      {showModal && selectedItem && (
        <div className="modal-backdrop-custom" onClick={() => setShowModal(false)}>
          <div className="modal-dialog-custom" onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom">
              <div className="modal-title-custom">
                <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
                <span>
                  {modalActionType === 'DELIVER' 
                    ? 'Xác Nhận Giao Sách Đặt Trước' 
                    : selectedItem.usBook === 1 
                      ? 'Phê Duyệt Yêu Cầu Mượn' 
                      : 'Phê Duyệt Đơn Đặt Trước'}
                </span>
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
                      {selectedItem.user?.displayName || selectedItem.user?.username} (@{selectedItem.user?.username})
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tên sách:</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {selectedItem.book?.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ngày nhận sách:</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {selectedItem.borrowDate || 'Hôm nay'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hạn trả:</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--success)' }}>
                      {selectedItem.dueDate || '14 ngày'}
                    </span>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {modalActionType === 'DELIVER' ? (
                    <span>Xác nhận độc giả đã đến thư viện nhận sách. Phiếu mượn sẽ chuyển sang <strong>Đang Mượn (usBook: 0)</strong> và trừ 1 cuốn tồn kho.</span>
                  ) : selectedItem.usBook === 1 ? (
                    <span>Phê duyệt yêu cầu mượn ngay. Phiếu mượn sẽ chuyển sang <strong>Đang Mượn (usBook: 0)</strong> và trừ 1 cuốn tồn kho.</span>
                  ) : (
                    <span>Phê duyệt đơn đặt trước. Đơn sẽ chuyển sang trạng thái <strong>Chờ Lấy Sách (usBook: 4)</strong>.</span>
                  )}
                </p>
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
                    background: modalActionType === 'DELIVER' ? 'linear-gradient(135deg, #10b981, #059669)' : undefined
                  }}
                >
                  <span>
                    {submitting 
                      ? 'Đang xử lý...' 
                      : modalActionType === 'DELIVER' 
                        ? 'Xác Nhận Đã Giao Sách' 
                        : selectedItem.usBook === 1 
                          ? 'Xác Nhận Cho Mượn' 
                          : 'Xác Nhận Duyệt Đặt Trước'}
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
