import React, {useState, useEffect} from 'react';
import axios from 'axios';
import '../App.css';
import { X, Receipt } from 'lucide-react';

function ExpenseForm({groupId, groups, onExpenseAdded, onCancel}) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('0.00');
  const [description, setDescription] = useState('');
  const [paidBy, setPaidBy] = useState('you');
  const [splitMethod, setSplitMethod] = useState('equally');
  const [showPaidByDropdown, setShowPaidByDropdown] = useState(false);
  const [showSplitDropdown, setShowSplitDropdown] = useState(false);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [showPayerModal, setShowPayerModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('تست');
  const [date, setDate] = useState('June 2, 2025');
  const [splitOption, setSplitOption] = useState('split_expense');
  const [individualAmounts, setIndividualAmounts] = useState({});

  const paidByOptions = [
    { value: 'you', label: 'you', color: 'text-green-600' },
    { value: 'ali', label: 'Ali', color: 'text-blue-600' },
    { value: 'sara', label: 'Sara', color: 'text-purple-600' },
    { value: 'multiple', label: 'Multiple people', color: 'text-gray-600' }
  ];

  const splitOptions = [
    { value: 'equally', label: 'equally' },
    { value: 'unequally', label: 'unequally' },
    { value: 'by_percentage', label: 'by percentage' },
    { value: 'by_shares', label: 'by shares' },
    { value: 'by_adjustment', label: 'by adjustment' }
  ];

  const groupOptions = [
    { value: 'تست', label: 'تست', members: [
      { name: 'Ali Moghadasi', avatar: '👤' },
      { name: 'Parsa Malekian', avatar: '👤' }
    ]},
    { value: 'خانواده', label: 'خانواده', members: [
      { name: 'Mom', avatar: '👩' },
      { name: 'Dad', avatar: '👨' },
      { name: 'Sister', avatar: '👧' }
    ]},
    { value: 'دوستان', label: 'دوستان', members: [
      { name: 'Ahmad', avatar: '👤' },
      { name: 'Maryam', avatar: '👤' },
      { name: 'Reza', avatar: '👤' }
    ]},
    { value: 'همکاران', label: 'همکاران', members: [
      { name: 'Boss', avatar: '👤' },
      { name: 'Colleague1', avatar: '👤' },
      { name: 'Colleague2', avatar: '👤' }
    ]}
  ];

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
  };

  const calculatePerPerson = () => {
    const totalAmount = parseFloat(amount) || 0;
    const numPeople = 2; // Assuming 2 people for now
    return (totalAmount / numPeople).toFixed(2);
  };

  const handleSave = () => {
    console.log('Saving expense:', {
      amount,
      description,
      paidBy,
      splitMethod,
      date
    });
  };

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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="bg-green-500 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h2 className="text-lg font-semibold">Add an expense</h2>
            <button className="text-white hover:text-gray-200" onClick={onCancel}>
              <X size={20}/>
            </button>
          </div>

          <div className="p-6">
            {/* Group Info */}
            <div className="mb-6">
              <span className="text-gray-700">With you and: </span>
              <div className="relative inline-block">
                <button
                    onClick={() => setShowGroupDropdown(!showGroupDropdown)}
                    className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm hover:bg-gray-200 transition-colors"
                >
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-2 flex items-center justify-center">
                    <span className="text-white text-xs">$</span>
                  </div>
                  All of {selectedGroup}
                  <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle remove group action
                      }}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14}/>
                  </button>
                </button>

                {showGroupDropdown && (
                    <div
                        className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-64">
                      <div className="p-2">
                        <div className="text-sm text-gray-500 px-3 py-2 border-b">انتخاب گروه:</div>
                        {groupOptions.map((group) => (
                            <button
                                key={group.value}
                                onClick={() => {
                                  setSelectedGroup(group.value);
                                  setShowGroupDropdown(false);
                                }}
                                className={`w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md transition-colors ${
                                    selectedGroup === group.value ? 'bg-green-50 text-green-700' : 'text-gray-700'
                                }`}
                            >
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                <div>
                                  <div className="font-medium">{group.label}</div>
                                  <div className="text-xs text-gray-500">
                                    {group.members.length} عضو: {group.members.slice(0, 3).map(m => m.name).join(', ')}
                                    {group.members.length > 3 && '...'}
                                  </div>
                                </div>
                              </div>
                            </button>
                        ))}

                        <div className="border-t mt-2 pt-2">
                          <button
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md text-green-600 font-medium">
                            + ایجاد گروه جدید
                          </button>
                        </div>
                      </div>
                    </div>
                )}
              </div>
            </div>

            {/* Receipt Icon and Amount */}
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                <Receipt size={24} className="text-gray-600"/>
              </div>
              <div className="flex-1">
                <input
                    type="text"
                    placeholder="Enter a description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-gray-400 text-sm mb-2 border-none outline-none"
                />
                <div className="flex items-center">
                  <span className="text-2xl text-gray-800 mr-1">$</span>
                  <input
                      type="text"
                      value={amount}
                      onChange={handleAmountChange}
                      className="text-2xl text-gray-300 font-light border-none outline-none bg-transparent w-20"
                  />
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="mb-6 text-center">
              <span className="text-gray-600">Paid by </span>
              <div className="relative inline-block">
                <button
                    onClick={() => setShowPaidByDropdown(!showPaidByDropdown)}
                    className={`${paidByOptions.find(opt => opt.value === paidBy)?.color || 'text-green-600'} hover:underline focus:outline-none`}
                >
                  {paidByOptions.find(opt => opt.value === paidBy)?.label || 'you'}
                </button>

                {showPaidByDropdown && (
                    <div
                        className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-40">
                      {paidByOptions.map((option) => (
                          <button
                              key={option.value}
                              onClick={() => {
                                if (option.value === 'multiple') {
                                  setShowPayerModal(true);
                                } else {
                                  setPaidBy(option.value);
                                }
                                setShowPaidByDropdown(false);
                              }}
                              className={`block w-full text-left px-3 py-2 hover:bg-gray-50 ${option.color}`}
                          >
                            {option.label}
                          </button>
                      ))}
                    </div>
                )}
              </div>

              <span className="text-gray-600"> and split </span>

              <div className="relative inline-block">
                <button
                    onClick={() => setShowSplitDropdown(!showSplitDropdown)}
                    className="text-green-600 hover:underline focus:outline-none"
                >
                  {splitOptions.find(opt => opt.value === splitMethod)?.label || 'equally'}
                </button>

                {showSplitDropdown && (
                    <div
                        className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-32">
                      {splitOptions.map((option) => (
                          <button
                              key={option.value}
                              onClick={() => {
                                if (option.value === 'equally') {
                                  setShowSplitModal(true);
                                } else {
                                  setSplitMethod(option.value);
                                }
                                setShowSplitDropdown(false);
                              }}
                              className="block w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-700"
                          >
                            {option.label}
                          </button>
                      ))}
                    </div>
                )}
              </div>

              <span className="text-gray-600">.</span>
              <div className="text-sm text-gray-500 mt-1">
                (${calculatePerPerson()}/person)
              </div>
            </div>

            {/* Date and Notes */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button className="px-4 py-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200">
                {date}
              </button>
              <button className="px-4 py-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200">
                Add image/notes
              </button>
            </div>

            {/* Category */}
            <div className="mb-6 text-center">
              <button className="px-6 py-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200">
                تست
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                Cancel
              </button>
              <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Save
              </button>
            </div>
          </div>

          {/* Choose Payer Modal */}
          {showPayerModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                  <div className="bg-green-500 text-white p-4 rounded-t-lg flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Choose payer</h2>
                    <button
                        onClick={() => setShowPayerModal(false)}
                        className="text-white hover:text-gray-200"
                    >
                      <X size={20}/>
                    </button>
                  </div>

                  <div className="p-6">
                    {/* Individual Members */}
                    {groupOptions.find(g => g.value === selectedGroup)?.members.map((member, index) => (
                        <div key={index}
                             className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer mb-2">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm">{member.avatar}</span>
                          </div>
                          <span className="text-gray-800 font-medium">{member.name}</span>
                        </div>
                    ))}

                    {/* Multiple People Section */}
                    <div className="mt-6 pt-4 border-t">
                      <h3 className="text-gray-600 font-medium mb-4">Multiple people</h3>

                      <label className="flex items-center mb-4">
                        <input type="checkbox" className="mr-3"/>
                        <span className="text-gray-600">Each person paid for their own share</span>
                      </label>

                      {groupOptions.find(g => g.value === selectedGroup)?.members.map((member, index) => (
                          <div key={index} className="mb-4">
                            <div className="text-gray-700 font-medium mb-2">{member.name}</div>
                            <div className="flex items-center border rounded-lg">
                              <span className="px-3 py-2 text-gray-500">$</span>
                              <input
                                  type="text"
                                  className="flex-1 p-2 border-none outline-none"
                                  placeholder="0.00"
                              />
                            </div>
                          </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
          )}

          {/* Choose Split Options Modal */}
          {showSplitModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                  <div className="bg-green-500 text-white p-4 rounded-t-lg flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Choose split options</h2>
                    <button
                        onClick={() => setShowSplitModal(false)}
                        className="text-white hover:text-gray-200"
                    >
                      <X size={20}/>
                    </button>
                  </div>

                  <div className="p-6">
                    {/* Split Options */}
                    <div className="space-y-3 mb-6">
                      <button
                          onClick={() => setSplitOption('split_expense')}
                          className={`w-full p-3 rounded-full text-center ${
                              splitOption === 'split_expense'
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        Split the expense
                      </button>

                      <button
                          onClick={() => setSplitOption('you_owe')}
                          className={`w-full p-3 rounded-full text-center ${
                              splitOption === 'you_owe'
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        You owe the full amount
                      </button>

                      <button
                          onClick={() => setSplitOption('they_owe')}
                          className={`w-full p-3 rounded-full text-center ${
                              splitOption === 'they_owe'
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        They owe the full amount
                      </button>
                    </div>

                    {/* Split Method Icons */}
                    <div className="flex items-center justify-center space-x-4 mb-6 p-2 bg-gray-100 rounded-lg">
                      <button className="p-2 bg-gray-200 rounded">
                        <span className="text-sm">=</span>
                      </button>
                      <span className="text-lg font-mono">1.23</span>
                      <button className="p-2 bg-gray-200 rounded">
                        <span className="text-sm">%</span>
                      </button>
                      <button className="p-2 bg-gray-200 rounded">
                        <span className="text-sm">≡</span>
                      </button>
                      <button className="p-2 bg-gray-200 rounded">
                        <span className="text-sm">+/-</span>
                      </button>
                      <button className="p-2 bg-gray-200 rounded">
                        <span className="text-sm">💰</span>
                      </button>
                      <button className="p-2 bg-gray-200 rounded">
                        <span className="text-sm">≡</span>
                      </button>
                    </div>

                    {/* Split Equally Section */}
                    <div>
                      <h3 className="text-gray-800 font-medium mb-4">Split equally</h3>

                      {groupOptions.find(g => g.value === selectedGroup)?.members.map((member, index) => (
                          <div key={index} className="flex items-center justify-between p-2 mb-2">
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-blue-500 rounded mr-3 flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                                <span className="text-xs">{member.avatar}</span>
                              </div>
                              <span className="text-gray-800">{member.name}</span>
                            </div>
                            <span className="text-gray-600">$0.00</span>
                          </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
          )}
        </div>
      </div>
  );
}

export default ExpenseForm;