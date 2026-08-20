import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Bell, 
  BellRing, 
  Clock, 
  Inbox, 
  Sparkles, 
  AlertCircle,
  CheckCircle2 
} from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/borrower/notifications');
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching notifications", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '840px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Thông Báo Hệ Thống
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
            Cảnh báo hạn trả sách và các tin tức quan trọng từ thư viện
          </p>
        </div>

        {unreadCount > 0 && (
          <span className="badge-status badge-status-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <BellRing size={15} />
            {unreadCount} thông báo mới
          </span>
        )}
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notifications.map(notif => {
          const isUnread = !notif.read;

          return (
            <div 
              key={notif.id} 
              className="card-glass"
              style={{
                padding: '1.25rem 1.5rem',
                borderLeft: isUnread ? '4px solid var(--primary-light)' : '1px solid var(--border-color)',
                backgroundColor: isUnread ? 'rgba(99, 102, 241, 0.03)' : 'var(--bg-card)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1.25rem',
                transition: 'all 0.2s ease'
              }}
            >
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: 'var(--radius-md)', 
                  background: isUnread ? 'var(--primary-subtle)' : '#f1f5f9', 
                  color: isUnread ? 'var(--primary)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {isUnread ? <BellRing size={20} /> : <Bell size={20} />}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.35rem' }}>
                  <h3 style={{ fontSize: '0.975rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {notif.message}
                  </h3>
                  {isUnread && (
                    <span className="badge-dot" style={{ backgroundColor: 'var(--primary-light)', width: '8px', height: '8px', flexShrink: 0, marginTop: '6px' }}></span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                  <Clock size={12} />
                  <span>{new Date(notif.createdAt).toLocaleString('vi-VN')}</span>
                </div>
              </div>
            </div>
          );
        })}

        {notifications.length === 0 && (
          <div className="card-glass" style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <Inbox size={48} style={{ opacity: 0.3 }} />
              <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                Hộp thông báo trống
              </p>
              <span style={{ fontSize: '0.875rem' }}>Bạn không có thông báo hoặc cảnh báo nào tại thời điểm này.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
