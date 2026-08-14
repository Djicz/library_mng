import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/borrower/notifications');
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching notifications", error);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div>
      <h2>My Notifications</h2>
      <div className="list-group mt-4">
        {notifications.length === 0 ? (
          <p>No notifications.</p>
        ) : (
          notifications.map(notif => (
            <div key={notif.id} className={`list-group-item list-group-item-action ${!notif.read ? 'active' : ''}`}>
              <div className="d-flex w-100 justify-content-between">
                <h5 className="mb-1">{notif.message}</h5>
                <small>{new Date(notif.createdAt).toLocaleString()}</small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
