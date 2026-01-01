
import React, { useState, useEffect } from 'react';
import { Transaction, CategoryType } from '../types';
import { Plus, Wand2, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { categorizeDescription } from '../services/geminiService';

interface Props {
  allCategories: string[];
  currentMonth: string;
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
}

const TransactionForm: React.FC<Props> = ({ allCategories, currentMonth, onAddTransaction }) => {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState<CategoryType>(allCategories[0] || 'Other');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [isCategorizing, setIsCategorizing] = useState(false);

  // Default date to current day if in current month, otherwise 1st of viewed month
  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    if (todayStr.startsWith(currentMonth)) {
      setDate(todayStr);
    } else {
      setDate(`${currentMonth}-01`);
    }
  }, [currentMonth]);

  const handleMagicCategorize = async () => {
    if (!desc || type === 'income') return;
    setIsCategorizing(true);
    const cat = await categorizeDescription(desc, allCategories);
    setCategory(cat);
    setIsCategorizing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount || !date) return;
    onAddTransaction({
      description: desc,
      amount: parseFloat(amount),
      category: type === 'income' ? 'Income' : category,
      date,
      type
    });
    setDesc('');
    setAmount('');
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
      <h3 className="text-lg font-semibold mb-4">Add Transaction</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
            <div className="relative">
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Rent, Groceries..."
                value={desc}
                onChange={e => setDesc(e.target.value)}
                onBlur={handleMagicCategorize}
              />
              <button 
                type="button" 
                onClick={handleMagicCategorize}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                title="AI Categorize"
              >
                {isCategorizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Date</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="date" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Amount</label>
            <input 
              type="number" 
              step="0.01"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Type & Category</label>
            <div className="flex gap-2">
              <select 
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={type}
                onChange={e => setType(e.target.value as any)}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              {type === 'expense' && (
                <select 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  value={category}
                  onChange={e => setCategory(e.target.value as CategoryType)}
                >
                  {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </div>
          </div>

          <button 
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Entry
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
