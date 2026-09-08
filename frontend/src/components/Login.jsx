import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Library, User, Lock, UserCheck, ArrowRight, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

import api, { getErrorMessage } from '../services/api';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '937462706342-e422qsajvlgonm5oeeu43k2964kifi2d.apps.googleusercontent.com';

  const handleGoogleSuccess = async (response) => {
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await api.post('/auth/google', {
        idToken: response.credential
      });

      const { token, role, username: resUsername, id: userId } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('username', resUsername);
      if (userId) localStorage.setItem('userId', userId);

      if (role === 'MANAGER') {
        navigate('/manager/dashboard');
      } else {
        navigate('/borrower/my-books');
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Đăng nhập bằng tài khoản Google thất bại.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google?.accounts?.id && googleClientId) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleSuccess
          });

          const btnContainer = document.getElementById('google-signin-btn');
          if (btnContainer) {
            btnContainer.innerHTML = '';
            window.google.accounts.id.renderButton(btnContainer, {
              theme: 'filled_black',
              size: 'large',
              shape: 'pill',
              width: 320,
              text: isLogin ? 'signin_with' : 'signup_with',
              locale: 'vi'
            });
          }
        } catch (e) {
          console.error('Google Sign-In initialization failed:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogleSignIn();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          initializeGoogleSignIn();
          clearInterval(timer);
        }
      }, 300);
      return () => clearInterval(timer);
    }
  }, [isLogin, googleClientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    if (isLogin) {
      try {
        const response = await api.post('/auth/login', {
          username,
          password
        });

        const { token, role, username: resUsername, id: userId } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('username', resUsername);
        if (userId) localStorage.setItem('userId', userId);

        if (role === 'MANAGER') {
          navigate('/manager/dashboard');
        } else {
          navigate('/borrower/my-books');
        }
      } catch (err) {
        setError(getErrorMessage(err, 'Tên đăng nhập hoặc mật khẩu không chính xác.'));
      } finally {
        setLoading(false);
      }
    } else {
      // Register
      try {
        const response = await api.post('/auth/register', {
          username,
          password,
          displayName
        });
        
        const successText = response.data?.message || 'Tạo tài khoản thành công! Bạn có thể đăng nhập ngay.';
        setSuccessMsg(successText);
        setIsLogin(true);
        setPassword('');
      } catch (err) {
        setError(getErrorMessage(err, 'Đăng ký không thành công, vui lòng thử lại.'));
      } finally {
        setLoading(false);
      }
    }
  };

  const switchTab = (toLogin) => {
    setIsLogin(toLogin);
    setError('');
    setSuccessMsg('');
    setPassword('');
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-ambient-glow-1"></div>
      <div className="auth-ambient-glow-2"></div>

      <div className="auth-card-modern">
        <div className="text-center mb-4">
          <div className="auth-logo-badge">
            <Library size={28} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Thư Viện Số
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Hệ thống Quản lý Thư viện Deep Blue Pro
          </p>
        </div>

        <div className="auth-tabs">
          <button 
            type="button"
            className={`auth-tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => switchTab(true)}
          >
            Đăng Nhập
          </button>
          <button 
            type="button"
            className={`auth-tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => switchTab(false)}
          >
            Tạo Tài Khoản
          </button>
        </div>

        {error && (
          <div className="badge-status badge-status-danger w-100 mb-3" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="badge-status badge-status-success w-100 mb-3" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group-custom">
              <label className="form-label-custom">Họ và Tên</label>
              <div style={{ position: 'relative' }}>
                <UserCheck size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-control-custom"
                  style={{ paddingLeft: '2.75rem' }}
                  value={displayName} 
                  onChange={e => setDisplayName(e.target.value)} 
                  required={!isLogin} 
                  placeholder="Ví dụ: Nguyễn Văn A"
                />
              </div>
            </div>
          )}

          <div className="form-group-custom">
            <label className="form-label-custom">Tên Đăng Nhập / Email</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-control-custom"
                style={{ paddingLeft: '2.75rem' }}
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
                placeholder="Nhập tên đăng nhập hoặc email"
              />
            </div>
          </div>

          <div className="form-group-custom">
            <label className="form-label-custom">Mật Khẩu</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="form-control-custom"
                style={{ paddingLeft: '2.75rem' }}
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary-gradient w-100 mt-2" 
            style={{ padding: '0.85rem', fontSize: '1rem', borderRadius: 'var(--radius-md)' }}
            disabled={loading}
          >
            {loading ? (
              <span>Đang xử lý...</span>
            ) : (
              <>
                <span>{isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-divider" style={{
          display: 'flex',
          alignItems: 'center',
          textAlign: 'center',
          margin: '1.5rem 0 1.25rem 0',
          color: 'var(--text-muted)',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.08em'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }}></div>
          <span style={{ padding: '0 0.85rem' }}>HOẶC TIẾP TỤC VỚI</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }}></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '0.5rem' }}>
          <div id="google-signin-btn" style={{ minHeight: '44px', display: 'flex', justifyContent: 'center' }}></div>
        </div>

        <div className="text-center mt-3" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {isLogin ? (
            <p>
              Chưa có tài khoản độc giả?{' '}
              <button 
                type="button"
                onClick={() => switchTab(false)} 
                style={{ background: 'none', border: 'none', color: 'var(--primary-light)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              >
                Đăng ký ngay
              </button>
            </p>
          ) : (
            <p>
              Đã có tài khoản?{' '}
              <button 
                type="button"
                onClick={() => switchTab(true)} 
                style={{ background: 'none', border: 'none', color: 'var(--primary-light)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              >
                Đăng nhập
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

