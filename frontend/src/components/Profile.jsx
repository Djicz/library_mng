import React, { useState, useEffect } from 'react';
import api, { getErrorMessage } from '../services/api';
import { 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Key, 
  Calendar,
  Lock,
  Edit3,
  Check,
  X
} from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      const userData = response.data?.data || response.data;
      setProfile(userData);
      setEditDisplayName(userData?.displayName || '');
      if (userData?.id && !localStorage.getItem('userId')) {
        localStorage.setItem('userId', userData.id);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải thông tin hồ sơ người dùng.'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      const response = await api.put('/profile', {
        displayName: editDisplayName
      });
      const updatedUser = response.data?.data || response.data;
      setProfile(updatedUser);
      setIsEditing(false);
      setSuccessMsg(response.data?.message || 'Cập nhật thông tin thành công!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(getErrorMessage(err, 'Lỗi cập nhật thông tin cá nhân.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card-glass text-center p-5 animate-fade-in" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Đang tải thông tin tài khoản...</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="card-glass text-center p-5 animate-fade-in" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <AlertCircle size={40} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
        <p style={{ color: 'var(--danger)', fontWeight: 700 }}>{error}</p>
      </div>
    );
  }

  const isManager = profile?.role === 'MANAGER';

  return (
    <div className="animate-fade-in" style={{ maxWidth: '680px', margin: '0 auto' }}>
      {successMsg && (
        <div className="badge-status badge-status-success w-100 mb-3" style={{ padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="badge-status badge-status-danger w-100 mb-3" style={{ padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="card-glass" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Banner */}
        <div 
          style={{ 
            height: '140px', 
            background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 50%, var(--primary-light) 100%)',
            position: 'relative'
          }}
        >
          <div style={{ position: 'absolute', bottom: '-45px', left: '2rem' }}>
            <div 
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-light), var(--accent-cyan))',
                color: 'white',
                fontSize: '2.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                border: '4px solid white',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              {profile?.displayName ? profile.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </div>

        {/* Profile Info Content */}
        <div style={{ padding: '3.5rem 2rem 2rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {profile?.displayName || profile?.username}
              </h2>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                @{profile?.username}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className={`badge-status ${isManager ? 'badge-status-info' : 'badge-status-neutral'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                {isManager ? (
                  <><ShieldCheck size={16} /> Quản Trị Viên (Thủ Thư)</>
                ) : (
                  <><User size={16} /> Tài Khoản Độc Giả</>
                )}
              </span>

              {!isEditing && (
                <button 
                  className="btn-secondary-modern" 
                  onClick={() => setIsEditing(true)}
                  style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
                >
                  <Edit3 size={14} />
                  <span>Sửa tên</span>
                </button>
              )}
            </div>
          </div>

          <hr style={{ borderColor: 'var(--border-color)', margin: '1.5rem 0' }} />

          {/* Details List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {isEditing ? (
              <form onSubmit={handleUpdateProfile}>
                <div className="form-group-custom">
                  <label className="form-label-custom">Tên hiển thị mới</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      className="form-control-custom" 
                      value={editDisplayName}
                      onChange={e => setEditDisplayName(e.target.value)}
                      placeholder="Nhập tên hiển thị mới"
                      required
                    />
                    <button 
                      type="submit" 
                      className="btn-primary-gradient" 
                      disabled={saving}
                      style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}
                    >
                      <Check size={16} />
                      <span>{saving ? 'Lưu...' : 'Lưu'}</span>
                    </button>
                    <button 
                      type="button" 
                      className="btn-secondary-modern" 
                      onClick={() => { setIsEditing(false); setEditDisplayName(profile?.displayName || ''); }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                  <User size={18} style={{ color: 'var(--primary-light)' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Tên hiển thị:</span>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {profile?.displayName || 'Chưa cập nhật'}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                <Lock size={18} style={{ color: 'var(--primary-light)' }} />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Tên đăng nhập:</span>
              </div>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                {profile?.username}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Trạng thái tài khoản:</span>
              </div>
              <span className={`badge-status ${profile?.status === 'AVAILABLE' ? 'badge-status-success' : 'badge-status-danger'}`}>
                <span className="badge-dot"></span>
                {profile?.status === 'AVAILABLE' ? 'Đang hoạt động' : 'Bị khóa'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

