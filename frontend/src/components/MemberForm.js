import React, {useState, useEffect} from 'react';
import axios from 'axios';
import '../App.css';

function MemberForm({onMemberAdded, onCancel, group_id}) {
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

export default MemberForm;