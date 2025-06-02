import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
import ExpenseForm from './ExpenseForm';
import MemberForm from './MemberForm';

function GroupDetail({user, group, expenses, onExpenseAdded, onMemberAdded}) {
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
                        groups={[group]}
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
                  <li key={member.id}>
                      {member.username}
                  </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
  );
}

export default GroupDetail;