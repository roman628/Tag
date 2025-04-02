import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    // Fetch online users
    const fetchOnlineUsers = async () => {
      try {
        const response = await fetch('/api/users/online');
        const data = await response.json();
        setOnlineUsers(data);
      } catch (error) {
        console.error('Error fetching online users:', error);
      }
    };

    fetchOnlineUsers();
    
    // Poll for online users every 30 seconds
    const interval = setInterval(fetchOnlineUsers, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      <div className="header">
        <h1>Tag Game</h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>
      
      <div className="welcome">
        <h2>Welcome, {user.username}</h2>
      </div>
      
      <div className="online-users">
        <h3>Online Players</h3>
        {onlineUsers.length === 0 ? (
          <p>No other players online</p>
        ) : (
          <ul>
            {onlineUsers
              .filter(u => u._id !== user.userId)
              .map(u => (
                <li key={u._id}>{u.username}</li>
              ))}
          </ul>
        )}
      </div>
      
      <div className="game-actions">
        <h3>Game Actions</h3>
        <button className="camera-btn">
          Take Photo to Tag Someone
        </button>
      </div>
    </div>
  );
};

export default Dashboard;