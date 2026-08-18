import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [editUserId, setEditUserId] = useState(null);
  const [editUserData, setEditUserData] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/manager/user/get-all-users');
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  const handleLockUser = async (id) => {
    if(window.confirm('Bạn có chắc muốn thay đổi trạng thái khóa/mở khóa người dùng này?')) {
      try {
        await api.put(`/manager/user/lock/${id}`);
        fetchUsers();
      } catch(error) {
        alert('Lỗi khóa tài khoản');
      }
    }
  };

  const handleResetPassword = async (id) => {
    if(window.confirm('Bạn có chắc muốn reset mật khẩu người dùng này?')) {
      try {
        const response = await api.put(`/manager/user/reset-password/${id}`);
        alert(response.data || 'Reset thành công');
      } catch(error) {
        alert('Lỗi reset mật khẩu');
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if(window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await api.delete(`/manager/user/delete/${id}`);
        fetchUsers();
      } catch(error) {
        alert('Lỗi xóa người dùng');
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
      fetchUsers();
    } catch(error) {
      alert('Lỗi cập nhật. Chú ý Backend có thể yêu cầu @RequestBody trong UserController');
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Quản lý Người Dùng</h1>
      </div>

      <div className="card-modern" style={{marginBottom: '2rem'}}>
        <h3 style={{marginBottom: '1rem', color: 'var(--primary)'}}>👥 Danh Sách Người Dùng</h3>
        <div className="table-responsive">
          <table className="table table-hover align-middle" style={{marginBottom: 0, width: '100%', borderCollapse: 'collapse'}}>
            <thead style={{backgroundColor: 'rgba(0,0,0,0.02)', textAlign: 'left'}}>
              <tr>
                <th style={{padding: '1rem', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)'}}>ID</th>
                <th style={{padding: '1rem', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)'}}>Tài Khoản</th>
                <th style={{padding: '1rem', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)'}}>Tên Hiển Thị</th>
                <th style={{padding: '1rem', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)'}}>Vai Trò</th>
                <th style={{padding: '1rem', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)'}}>Trạng Thái</th>
                <th style={{padding: '1rem', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)'}}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{borderBottom: '1px solid var(--border-color)'}}>
                  <td style={{padding: '1rem', color: 'var(--text-muted)'}}>#{user.id.substring(0,6)}...</td>
                  
                  {editUserId === user.id ? (
                    <>
                      <td style={{padding: '1rem', fontWeight: '600'}}>{user.username}</td>
                      <td style={{padding: '1rem'}}>
                        <input type="text" className="form-control" value={editUserData.displayName || ''} onChange={e => setEditUserData({...editUserData, displayName: e.target.value})} placeholder="Nhập tên hiển thị" />
                      </td>
                      <td style={{padding: '1rem'}}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          backgroundColor: user.role === 'MANAGER' ? 'rgba(30, 58, 138, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                          color: user.role === 'MANAGER' ? 'var(--primary)' : 'var(--text-muted)'
                        }}>
                          {user.role === 'MANAGER' ? 'Quản lý' : 'Độc giả'}
                        </span>
                      </td>
                      <td style={{padding: '1rem'}}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          backgroundColor: user.status === 'UNAVAILABLE' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          color: user.status === 'UNAVAILABLE' ? '#dc2626' : '#10b981'
                        }}>
                          {user.status === 'UNAVAILABLE' ? 'Bị khóa' : 'Hoạt động'}
                        </span>
                      </td>
                      <td style={{padding: '1rem'}}>
                        <button className="btn btn-success btn-sm me-2" onClick={() => submitEditUser(user.id)}>Lưu</button>
                        <button className="btn btn-secondary btn-sm" onClick={cancelEditUser}>Hủy</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{padding: '1rem', fontWeight: '600'}}>{user.username}</td>
                      <td style={{padding: '1rem'}}>{user.displayName || 'N/A'}</td>
                      <td style={{padding: '1rem'}}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          backgroundColor: user.role === 'MANAGER' ? 'rgba(30, 58, 138, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                          color: user.role === 'MANAGER' ? 'var(--primary)' : 'var(--text-muted)'
                        }}>
                          {user.role === 'MANAGER' ? 'Quản lý' : 'Độc giả'}
                        </span>
                      </td>
                      <td style={{padding: '1rem'}}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          backgroundColor: user.status === 'UNAVAILABLE' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          color: user.status === 'UNAVAILABLE' ? '#dc2626' : '#10b981'
                        }}>
                          {user.status === 'UNAVAILABLE' ? 'Bị khóa' : 'Hoạt động'}
                        </span>
                      </td>
                      <td style={{padding: '1rem'}}>
                        <button className="btn btn-warning btn-sm me-2 mb-1" onClick={() => startEditUser(user)}>Sửa</button>
                        <button className="btn btn-info btn-sm me-2 mb-1 text-white" onClick={() => handleResetPassword(user.id)}>Reset MK</button>
                        <button className={`btn btn-sm me-2 mb-1 ${user.status === 'UNAVAILABLE' ? 'btn-success' : 'btn-secondary'}`} onClick={() => handleLockUser(user.id)}>
                          {user.status === 'UNAVAILABLE' ? 'Mở Khóa' : 'Khóa'}
                        </button>
                        <button className="btn btn-danger btn-sm mb-1" onClick={() => handleDeleteUser(user.id)}>Xóa</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>Không có dữ liệu người dùng.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
