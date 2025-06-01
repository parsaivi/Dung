import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

// API base URL
const API_BASE = 'http://localhost:8000/api';

function App({onLogout}) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);

  // Fetch groups when component loads
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
      // Verify token is still valid
      verifyToken();
      // Fetch groups after token verification
      fetchGroups();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${API_BASE}/groups/`);
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };
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

  function fetchGroup(id) {
    axios.get(`${API_BASE}/groups/${id}/details/`)
      .then(response => {
        setSelectedGroup(response.data);
      })
      .catch(error => {
        console.error('Error fetching group:', error);
      });
  }


  const joinGroup2 = async (id) => {
    try {
      const response = await axios.post(`${API_BASE}/groups/${id}/join/`);
      fetchGroups(); // Refresh the list
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const joinGroup = (id) => {
    if (!id) return;
    axios.post(`${API_BASE}/groups/join/`, { group_id: id })
      .then(() => {
        fetchGroups()
      })
      .catch(error => {
        console.error('Error joining group:', error);
      });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Dung - Split Expenses</h1>
        <button onClick={onLogout} className="logout-button"> Logout</button>
      </header>

      <div className="container">
        <div className="sidebar">
          <h2>Groups</h2>
          <GroupList
            groups={groups}
            onGroupSelect={(group) => {
              setSelectedGroup(group);
              fetchExpenses(group.id);
            }}
            onCreateGroup={createGroup}
            onJoinGroup={(link) => {
              joinGroup(link);
            }}
          />
        </div>

        <div className="main-content">
          {selectedGroup ? (
            <GroupDetail
                user={user}
              group={selectedGroup}
              expenses={expenses}
              onExpenseAdded={() => fetchExpenses(selectedGroup.id)}
              onMemberAdded={() => fetchGroup(selectedGroup.id)}
            />
          ) : (
            <div>Select a group to view expenses</div>
          )}
        </div>

      </div>
    </div>
  );
}

// Component to display list of groups
function GroupList({ groups, onGroupSelect, onCreateGroup, onJoinGroup }) {
  const [showType, setShowType] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [groupLink, setGroupLink] = useState('');


  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateGroup(newGroupName, newGroupDesc);
    setNewGroupName('');
    setNewGroupDesc('');
    setGroupLink('');
    setShowForm(false);
    setShowType(false);
  };

  const handleSubmitJoin = (e) => {
    e.preventDefault();
    onJoinGroup(groupLink);
    setNewGroupName('');
    setNewGroupDesc('');
    setGroupLink('');
    setShowForm(false);
    setShowType(false);
  };

  return (
    <div>
      <div className="group-buttons">
        <button onClick={() => {
          setShowForm(!showForm);
          setShowType(false);
        }}>
          {showForm ? 'Cancel' : 'New Group'}
        </button>
        {!showForm && <button onClick={() => {
          setShowForm(!showForm);
          setShowType(true);
        }}>
          {'Join Group'}
        </button>}

      </div>

        {showForm && !showType && (
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

        {showForm && showType && (
            <form onSubmit={handleSubmitJoin} className="group-form">
              <input
                  type="text"
                  placeholder="Group link"
                  value={groupLink}
                  onChange={(e) => setGroupLink(e.target.value)}
                  required
              />
              <button type="submit">Join Group</button>
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

// Component to show group details and expenses
function GroupDetail({ user, group, expenses, onExpenseAdded, onMemberAdded }) {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const is_creater = group.created_by.username === user.username;

  return (
    <div>
      <h2>{group.name}</h2>
      <p>{group.description}</p>
      <p>Group ID: {group.id}</p>
      <p>Created By: {group.created_by.username}</p>
      <div className="expenses-section">
        <div className="expense-subsection">
          <div className="expenses-header">
            <h3>Expenses</h3>
            <button onClick={() => setShowExpenseForm(!showExpenseForm)}>
              {showExpenseForm ? 'Cancel' : 'Add Expense'}
            </button>
          </div>


          {showExpenseForm && (
              <ExpenseForm
                  groupId={group.id}
                  onExpenseAdded={onExpenseAdded}
                  onCancel={() => setShowExpenseForm(false)}
              />
          )}

          <div className="expenses-list">
            {expenses.map(expense => (
                <div key={expense.id} className="expense-item">
                  <h4>{expense.title}</h4>
                  <p>${expense.amount}</p>
                  <p>Paid by: {expense.paid_by.username}</p>
                  <p>{new Date(expense.date).toLocaleDateString()}</p>
                </div>
            ))}
          </div>
        </div>
        <div className="group-members">
          <h3>Group Members</h3>
          {is_creater && <button onClick={() => setShowMemberForm(!showMemberForm)}>
            {showMemberForm ? 'Cancel' : 'Add Member'}
          </button>}
            {showMemberForm && (
                <MemberForm
                    onMemberAdded={onMemberAdded}
                    onCancel={() => setShowMemberForm(false)}
                    group_id={group.id}
                />
            )}

          <ul>
            {group.members && group.members.map(member => (
                <li key={member.id}>{member.username}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Form to add new expenses
function ExpenseForm({groupId, onExpenseAdded, onCancel}) {
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

function MemberForm({ onMemberAdded, onCancel, group_id }) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username) return;
    axios.post(`${API_BASE}/groups/${group_id}/add_member/`, {
      username: username.trim()
    })
      .then(() => {
        onMemberAdded();
        setUsername('');
      })
      .catch(error => {
        console.error('Error adding member:', error);
      });
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="member-form">
      <input
        type="text"
        placeholder="Member username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <button type="submit">Add Member</button>
    </form>
  );
}

export default App;