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

  // const [groups, setGroups] = useState([]);
  // const [selectedGroup, setSelectedGroup] = useState(null);
  // const [expenses, setExpenses] = useState([]);

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

      const { token: newToken, user: userData } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Token ${newToken}`;

      return { success: true };
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

      const { token: newToken, user: newUser } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      axios.defaults.headers.common['Authorization'] = `Token ${newToken}`;

      return { success: true };
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

  const fetchExpenses = async (groupId) => {
    try {
      const response = await axios.get(`${API_BASE}/expenses/?group=${groupId}`);
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const createGroup = async (name, description) => {
    try {
      const response = await axios.post(`${API_BASE}/groups/`, {
        name,
        description
      });
      fetchGroups(); // Refresh the list
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  return (
    <div className="App">
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <AuthForm onLogin={handleLogin} onRegister={handleRegister} />
      )}
    </div>
  );

  // return (
  //   <div className="App">
  //     <header className="App-header">
  //       <h1>Dung - Split Expenses</h1>
  //     </header>
  //
  //     <div className="container">
  //       <div className="sidebar">
  //         <h2>Groups</h2>
  //         <GroupList
  //           groups={groups}
  //           onGroupSelect={(group) => {
  //             setSelectedGroup(group);
  //             fetchExpenses(group.id);
  //           }}
  //           onCreateGroup={createGroup}
  //         />
  //       </div>
  //
  //       <div className="main-content">
  //         {selectedGroup ? (
  //           <GroupDetail
  //             group={selectedGroup}
  //             expenses={expenses}
  //             onExpenseAdded={() => fetchExpenses(selectedGroup.id)}
  //           />
  //         ) : (
  //           <div>Select a group to view expenses</div>
  //         )}
  //       </div>
  //     </div>
  //   </div>
  // );
}

// Component to display list of groups
function GroupList({ groups, onGroupSelect, onCreateGroup }) {
  const [showForm, setShowForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateGroup(newGroupName, newGroupDesc);
    setNewGroupName('');
    setNewGroupDesc('');
    setShowForm(false);
  };

  return (
    <div>
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'New Group'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="group-form">
          <input
            type="text"
            placeholder="Group name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            value={newGroupDesc}
            onChange={(e) => setNewGroupDesc(e.target.value)}
          />
          <button type="submit">Create Group</button>
        </form>
      )}

      <div className="groups-list">
        {groups.map(group => (
          <div
            key={group.id}
            className="group-item"
            onClick={() => onGroupSelect(group)}
          >
            <h3>{group.name}</h3>
            <p>{group.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


// Form to add new expenses
function ExpenseForm({ groupId, onExpenseAdded, onCancel }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/expenses/`, {
        title,
        amount: parseFloat(amount),
        description,
        group: groupId
      });
      onExpenseAdded();
      onCancel();
    } catch (error) {
      console.error('Error creating expense:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <input
        type="text"
        placeholder="Expense title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="number"
        step="0.01"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="form-buttons">
        <button type="submit">Add Expense</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default App;