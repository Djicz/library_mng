import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Key, 
  Calendar,
  Lock
} from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile');
        setProfile(response.data);
      } catch (err) {
        setError('Không thể tải thông tin hồ sơ người dùng.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="card-glass text-center p-5 animate-fade-in" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Đang tải thông tin tài khoản...</p>
      </div>
    );
  }

  if (error) {
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

            <span className={`badge-status ${isManager ? 'badge-status-info' : 'badge-status-neutral'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              {isManager ? (
                <><ShieldCheck size={16} /> Quản Trị Viên (Thủ Thư)</>
              ) : (
                <><User size={16} /> Tài Khoản Độc Giả</>
              )}
            </span>
          </div>

          <hr style={{ borderColor: 'var(--border-color)', margin: '1.5rem 0' }} />

          {/* Details List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                <User size={18} style={{ color: 'var(--primary-light)' }} />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Tên hiển thị:</span>
              </div>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {profile?.displayName || 'Chưa cập nhật'}
              </span>
            </div>

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
