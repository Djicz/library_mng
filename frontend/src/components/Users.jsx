import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Users,
  UserCheck,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  Edit3,
  Trash2,
  Check,
  X,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const UsersComponent = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editUserId, setEditUserId] = useState(null);
  const [editUserData, setEditUserData] = useState({});
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const triggerSuccess = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/manager/user/get-all-users');
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  const handleLockUser = async (user) => {
    const isLocking = user.status === 'AVAILABLE';
    const actionText = isLocking ? 'khóa' : 'mở khóa';
    if (window.confirm(`Bạn có chắc muốn ${actionText} tài khoản "${user.username}"?`)) {
      try {
        await api.put(`/manager/user/lock/${user.id}`);
        triggerSuccess(`Đã ${actionText} tài khoản "${user.username}" thành công.`);
        fetchUsers();
      } catch (error) {
        alert('Lỗi khi thay đổi trạng thái tài khoản.');
      }
    }
  };

  const handleResetPassword = async (user) => {
    if (window.confirm(`Xác nhận đặt lại (reset) mật khẩu cho người dùng "${user.username}"?`)) {
      try {
        const response = await api.put(`/manager/user/reset-password/${user.id}`);
        triggerSuccess(typeof response.data === 'string' ? response.data : 'Reset mật khẩu thành công!');
      } catch (error) {
        alert('Lỗi reset mật khẩu.');
      }
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.username}" vĩnh viễn?`)) {
      try {
        await api.delete(`/manager/user/delete/${user.id}`);
        triggerSuccess(`Đã xóa người dùng "${user.username}" thành công.`);
        fetchUsers();
      } catch (error) {
        alert('Lỗi khi xóa người dùng.');
      }
    }
  };

  const startEditUser = (user) => {
    setEditUserId(user.id);
    setEditUserData({ ...user });
  };

  const cancelEditUser = () => {
    setEditUserId(null);
    setEditUserData({});
  };

  const submitEditUser = async (id) => {
    try {
      await api.put(`/manager/user/update/${id}`, editUserData);
      setEditUserId(null);
      triggerSuccess('Cập nhật thông tin người dùng thành công!');
      fetchUsers();
    } catch (error) {
      alert('Lỗi cập nhật người dùng.');
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = !search ||
      (user.username && user.username.toLowerCase().includes(search.toLowerCase())) ||
      (user.displayName && user.displayName.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Quản Lý Người Dùng
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
          Quản lý danh sách tài khoản, phân quyền, khóa truy cập và đặt lại mật khẩu
        </p>
      </div>

      {actionSuccess && (
        <div className="badge-status badge-status-success w-100 mb-3" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
          <CheckCircle2 size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="card-glass mb-4" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="search-input-group">
            <Search size={18} className="search-icon-inside" />
            <input
              type="text"
              className="search-input-field"
              placeholder="Tìm kiếm tài khoản, tên..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              className="form-select-custom"
              style={{ width: 'auto', minWidth: '150px', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="">Tất cả vai trò</option>
              <option value="MANAGER">Quản lý (Thủ thư)</option>
              <option value="BORROWER">Độc giả</option>
            </select>

            <select
              className="form-select-custom"
              style={{ width: 'auto', minWidth: '150px', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="AVAILABLE">Đang hoạt động</option>
              <option value="UNAVAILABLE">Đã bị khóa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-modern-wrapper">
        <table className="table-modern">
          <thead>
            <tr>
              <th style={{ width: '100px' }}>ID</th>
              <th>Người Dùng</th>
              <th>Tài Khoản</th>
              <th>Vai Trò</th>
              <th>Trạng Thái</th>
              <th style={{ textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    #{user.id ? user.id.substring(0, 6) : 'N/A'}
                  </span>
                </td>

                {editUserId === user.id ? (
                  <>
                    <td>
                      <input
                        type="text"
                        className="form-control-custom"
                        style={{ padding: '0.45rem 0.75rem', fontSize: '0.9rem' }}
                        value={editUserData.displayName || ''}
                        onChange={e => setEditUserData({ ...editUserData, displayName: e.target.value })}
                        placeholder="Nhập tên hiển thị"
                        autoFocus
                      />
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-muted)' }}>
                        @{user.username}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-status ${user.role === 'MANAGER' ? 'badge-status-info' : 'badge-status-neutral'}`}>
                        {user.role === 'MANAGER' ? 'Quản lý' : 'Độc giả'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-status ${user.status === 'AVAILABLE' ? 'badge-status-success' : 'badge-status-danger'}`}>
                        <span className="badge-dot"></span>
                        {user.status === 'AVAILABLE' ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button
                          className="btn-primary-gradient"
                          style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
                          onClick={() => submitEditUser(user.id)}
                        >
                          <Check size={14} />
                          <span>Lưu</span>
                        </button>
                        <button
                          className="btn-secondary-modern"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
                          onClick={cancelEditUser}
                        >
                          <X size={14} />
                          <span>Hủy</span>
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
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
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {user.displayName || 'Chưa đặt tên'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        @{user.username}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-status ${user.role === 'MANAGER' ? 'badge-status-info' : 'badge-status-neutral'}`}>
                        {user.role === 'MANAGER' ? (
                          <><ShieldCheck size={12} /> Quản lý</>
                        ) : (
                          <><UserCheck size={12} /> Độc giả</>
                        )}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-status ${user.status === 'AVAILABLE' ? 'badge-status-success' : 'badge-status-danger'}`}>
                        <span className="badge-dot"></span>
                        {user.status === 'AVAILABLE' ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button
                          className="btn-action-icon btn-action-edit"
                          title="Sửa tên hiển thị"
                          onClick={() => startEditUser(user)}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          className="btn-action-icon"
                          style={{ background: 'var(--info-bg)', color: 'var(--info)' }}
                          title="Đặt lại mật khẩu mặc định"
                          onClick={() => handleResetPassword(user)}
                        >
                          <KeyRound size={15} />
                        </button>
                        <button
                          className="btn-action-icon"
                          style={{
                            background: user.status === 'AVAILABLE' ? 'var(--warning-bg)' : 'var(--success-bg)',
                            color: user.status === 'AVAILABLE' ? 'var(--warning)' : 'var(--success)'
                          }}
                          title={user.status === 'AVAILABLE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                          onClick={() => handleLockUser(user)}
                        >
                          {user.status === 'AVAILABLE' ? <Lock size={15} /> : <Unlock size={15} />}
                        </button>
                        <button
                          className="btn-action-icon btn-action-delete"
                          title="Xóa người dùng"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <Users size={42} style={{ opacity: 0.3 }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>Không tìm thấy người dùng phù hợp.</p>
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

export default UsersComponent;
