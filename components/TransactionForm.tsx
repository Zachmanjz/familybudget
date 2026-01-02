
import React, { useState, useEffect } from 'react';
import { Transaction, CategoryType } from '../types';
import { Plus, Wand2, Loader2, Calendar as CalendarIcon, DollarSign, Tag } from 'lucide-react';
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
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-0">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">Add Transaction</h3>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            type="button"
            onClick={() => setType('expense')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}
          >
            Expense
          </button>
          <button 
            type="button"
            onClick={() => setType('income')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
          >
            Income
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
            <div className="relative group">
              <input 
                type="text" 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 pr-10 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all font-medium text-sm"
                placeholder="Where was this spent?"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                onBlur={handleMagicCategorize}
              />
              <button 
                type="button" 
                onClick={handleMagicCategorize}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors"
                title="AI Categorize"
              >
                {isCategorizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="date" 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-11 pr-4 py-3 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all font-medium text-sm"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="number" 
                step="0.01"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-11 pr-4 py-3 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all font-bold text-sm"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select 
                className="w-full appearance-none bg-slate-50 border-2 border-slate-100 rounded-xl pl-11 pr-4 py-3 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all font-bold text-sm disabled:opacity-50"
                value={type === 'income' ? 'Income' : category}
                disabled={type === 'income'}
                onChange={e => setCategory(e.target.value as CategoryType)}
              >
                {type === 'income' ? (
                  <option value="Income">Income</option>
                ) : (
                  allCategories.map(c => <option key={c} value={c}>{c}</option>)
                )}
              </select>
            </div>
          </div>
        </div>

        <button 
          type="submit"
          className={`w-full ${type === 'income' ? 'bg-emerald-600 shadow-emerald-100' : 'bg-indigo-600 shadow-indigo-100'} hover:opacity-90 active:scale-[0.98] text-white font-bold py-3.5 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 mt-4`}
        >
          <Plus className="w-5 h-5" />
          <span>Add {type === 'income' ? 'Income' : 'Expense'} Entry</span>
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
