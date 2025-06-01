import React, {useState, useEffect} from 'react';
import axios from 'axios';
import '../App.css';

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

export default ExpenseForm;