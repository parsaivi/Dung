import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

function GroupList({groups, onGroupSelect, onCreateGroup, onJoinGroup}) {
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

export default GroupList;