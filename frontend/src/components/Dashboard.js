import React, {useState, useEffect} from 'react';
import axios from 'axios';
import GroupList from './GroupList';
import GroupDetail from './GroupDetails';
import FriendList from './FriendList';
import FriendRequestList from './FriendRequestList';
import '../App.css';

// API base URL
const API_BASE = 'http://localhost:8000/api';

function App({onLogout}) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
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
      fetchFriends();
      fetchFriendRequests();
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

  const fetchFriends = async () => {
      try {
          const response = await axios.get(`${API_BASE}/friends/`);
          setFriends(response.data);
      } catch (error){
          console.error('Error fetching friends:', error);
      }
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await axios.get(`${API_BASE}/friendrequests/`);
      setFriendRequests(response.data);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
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

  const joinGroup = (id) => {
    if (!id) return;
    axios.post(`${API_BASE}/groups/join/`, {group_id: id})
        .then(() => {
          fetchGroups()
        })
        .catch(error => {
          console.error('Error joining group:', error);
        });
  };

  const addFriend = (username) =>{
    if (!username) return;
    axios.post(`${API_BASE}/friends/add_friend/`, {username: username})
        .then(() =>{
            fetchFriends()
        })
        .catch(error => {
           console.error('Error adding friend:', error);
        });
  };

    return (
      <div className="App">
        <header className="App-header">
          <h1>Dung - Split Expenses</h1>
            {user && <p>Username: {user.username}-{user.id}</p>}
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
            <h2>Requests</h2>
                <FriendRequestList
                    user={user}
                    requests={friendRequests}
                    onAccept={(requestId) => {
                      axios.post(`${API_BASE}/friendrequests/accept/`, {id: requestId})
                          .then(() => {
                              fetchFriendRequests();
                              fetchFriends();
                          })
                          .catch(error => console.error('Error accepting request:', error));
                    }}
                    onReject={(requestId) => {
                      axios.post(`${API_BASE}/friendrequests/reject/`, {id: requestId})
                          .then(() => fetchFriendRequests())
                          .catch(error => console.error('Error rejecting request:', error));
                    }}
                />
            <h2>Friends</h2>
                <FriendList
                    user={user}
                    friends={friends}
                    onFriendSelected={(friend) => {
                      setSelectedGroup(friend);
                    }}
                    onAddFriend={(username) =>{
                        addFriend(username);
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

export default App;