import React, {useState, useEffect} from 'react';
import axios from 'axios';
import '../App.css';

function FriendRequestList({user, requests, onAccept, onReject}) {
    const handleAccept = (requestId) => {
        onAccept(requestId);
    };

    const handleReject = (requestId) => {
        onReject(requestId);
    };

    return (
        <div className="friend-request-list">
            {requests.length === 0 ? (
                <p>No friend requests</p>
            ) : (
                <ul>
                    {requests.map(request => (
                        <li key={request.id}>
                            {request.from_user.username}
                            <button onClick={() => handleAccept(request.id)}>Accept</button>
                            <button onClick={() => handleReject(request.id)}>Reject</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default FriendRequestList;