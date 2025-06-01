import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import './App.css';

// API base URL
const API_BASE = 'http://localhost:8000/api';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Fetch groups when component loads
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
      // Verify token is still valid
      verifyToken();
    } else {
      setLoading(false);
    }
    //fetchGroups();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await axios.get(`${API_BASE}/auth/profile/`);
      setUser(response.data.user);
    } catch (error) {
      // Token is invalid, remove it
      localStorage.removeItem('token');
      setToken(null);
      delete axios.defaults.headers.common['Authorization'];
    }
    setLoading(false);
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${API_BASE}/groups/`);
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/login/`, {
        username,
        password
      });

      const {token: newToken, user: userData} = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Token ${newToken}`;

      return {success: true};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const handleRegister = async (userData) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/register/`, userData);

      const {token: newToken, user: newUser} = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      axios.defaults.headers.common['Authorization'] = `Token ${newToken}`;

      return {success: true};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE}/auth/logout/`);
    } catch (error) {
      console.log('Logout error:', error);
    }

    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  if (loading) {
    return (
        <div className="App">
          <div className="loading">Loading...</div>
        </div>
    );
  }

  return (
      <div className="App">
        {user ? (
            <Dashboard user={user} onLogout={handleLogout}/>
        ) : (
            <AuthForm onLogin={handleLogin} onRegister={handleRegister}/>
        )}
      </div>
  );
}
export default App;