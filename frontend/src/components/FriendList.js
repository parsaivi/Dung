import React, {useState, useEffect} from 'react';
import axios from 'axios';
import '../App.css';

function FriendList({user, friends, onFriendSelect, onAddFriend}) {
    const [showAddFriendForm, setShowAddFriendForm] = useState(false);
    const [newFriendUsername, setNewFriendUsername] = useState('');

    const handleAddFriend = (e) => {
        e.preventDefault();
        if (!newFriendUsername.trim()) return;

        onAddFriend(newFriendUsername.trim());
        setNewFriendUsername('');
        setShowAddFriendForm(false);
    };

    return (
        <div className="friend-list">
        <button onClick={() => setShowAddFriendForm(!showAddFriendForm)}>
            {showAddFriendForm ? 'Cancel' : 'Add Friend'}
        </button>

        {showAddFriendForm && (
            <form onSubmit={handleAddFriend} className="add-friend-form">
            <input
                type="text"
                placeholder="Enter username"
                value={newFriendUsername}
                onChange={(e) => setNewFriendUsername(e.target.value)}
                required
            />
            <button type="submit">Add</button>
            </form>
        )}

        <ul className="friend-list-items">
            {friends.map(friend => (
            <li key={friend.id} onClick={() => onFriendSelect(friend)}>
                {friend.username}
            </li>
            ))}
        </ul>
        </div>
    );
}

export default FriendList;