
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
    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h3 className="text-xl font-black text-slate-900">Add Entry</h3>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto">
          <button 
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${type === 'expense' ? 'bg-white text-rose-600 shadow-sm scale-105' : 'text-slate-400'}`}
          >
            Expense
          </button>
          <button 
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm scale-105' : 'text-slate-400'}`}
          >
            Income
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">What was it for?</label>
            <div className="relative group">
              <input 
                type="text" 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 pr-12 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                placeholder="Amazon, Starbucks, Rent..."
                value={desc}
                onChange={e => setDesc(e.target.value)}
                onBlur={handleMagicCategorize}
              />
              <button 
                type="button" 
                onClick={handleMagicCategorize}
                className={`absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${isCategorizing ? 'bg-indigo-50 text-indigo-600' : 'text-slate-300 hover:text-indigo-600'}`}
              >
                {isCategorizing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">When?</label>
            <div className="relative">
              <CalendarIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                type="date" 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-5 py-4 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-black text-slate-800"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">How much?</label>
            <div className="relative">
              <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                type="number" 
                step="0.01"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-5 py-4 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-black text-slate-900 text-lg placeholder:text-slate-300"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
            <div className="relative">
              <Tag className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <select 
                className="w-full appearance-none bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-10 py-4 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-black text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                <Plus className="w-4 h-4 rotate-45" />
              </div>
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={!desc || !amount}
          className={`w-full group relative overflow-hidden ${type === 'income' ? 'bg-emerald-600' : 'bg-indigo-600'} disabled:bg-slate-200 disabled:shadow-none hover:opacity-90 active:scale-[0.98] text-white font-black py-5 rounded-[1.5rem] transition-all shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3 mt-4`}
        >
          <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <Plus className="w-6 h-6" />
          <span className="text-lg">Save {type === 'income' ? 'Income' : 'Expense'}</span>
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
