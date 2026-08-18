import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (isLogin) {
      try {
        const response = await axios.post('http://localhost:8080/api/auth/login', {
          username,
          password
        });

        const { token, role, username: resUsername } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('username', resUsername);

        if (role === 'MANAGER') {
          navigate('/manager/dashboard');
        } else {
          navigate('/borrower/my-books');
        }
      } catch (err) {
        const backendMessage = err.response?.data?.message || err.response?.data;
        if (typeof backendMessage === 'string' && backendMessage.trim() !== '') {
          setError(backendMessage);
        } else {
          setError('Invalid username or password');
        }
      }
    } else {
      // Register
      try {
        await axios.post('http://localhost:8080/api/auth/register', {
          username,
          password,
          displayName
        });
        
        setSuccessMsg('Đăng ký thành công! Vui lòng đăng nhập.');
        setIsLogin(true);
        setPassword('');
        // Keep username so they don't have to re-type it
      } catch (err) {
        const backendMessage = err.response?.data?.message || err.response?.data;
        if (typeof backendMessage === 'string' && backendMessage.trim() !== '') {
          setError(backendMessage);
        } else {
          setError('Đăng ký thất bại, vui lòng thử lại.');
        }
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMsg('');
    setPassword('');
    // Optionally clear other fields
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isLogin ? 'Đăng Nhập' : 'Đăng Ký'}</h2>
          <p>Thư Viện Số Deep Blue Edition</p>
        </div>
        
        {error && <div className="alert alert-danger" style={{borderRadius: '10px'}}>{error}</div>}
        {successMsg && <div className="alert alert-success" style={{borderRadius: '10px'}}>{successMsg}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="auth-input-group">
              <label>Tên hiển thị</label>
              <input 
                type="text" 
                value={displayName} 
                onChange={e => setDisplayName(e.target.value)} 
                required={!isLogin} 
                placeholder="Ví dụ: Nguyễn Văn A"
              />
            </div>
          )}
          
          <div className="auth-input-group">
            <label>Tài khoản</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
              placeholder="Nhập tên đăng nhập"
            />
          </div>
          
          <div className="auth-input-group">
            <label>Mật khẩu</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" className="auth-btn">
            {isLogin ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản'}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? (
            <p>Chưa có tài khoản? <span onClick={toggleMode}>Đăng ký ngay</span></p>
          ) : (
            <p>Đã có tài khoản? <span onClick={toggleMode}>Đăng nhập</span></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
