
import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { Trash2, Search, Filter, X, Calendar } from 'lucide-react';
import { getCategoryColor } from '../constants';

interface Props {
  transactions: Transaction[];
  allCategories: string[];
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<Props> = ({ transactions, allCategories, onDelete }) => {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterMonth, setFilterMonth] = useState<string>('All');

  const availableMonths = useMemo(() => {
    const months = new Set(transactions.map(t => t.date.slice(0, 7)));
    return Array.from(months).sort().reverse();
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions
      .filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
        const matchesMonth = filterMonth === 'All' || t.date.startsWith(filterMonth);
        return matchesSearch && matchesCategory && matchesMonth;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, search, filterCategory, filterMonth]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Transaction History</h3>
          <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
            {filtered.length} visible
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search..."
              className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-8 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {allCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="Income">Income</option>
            </select>
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-8 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            >
              <option value="All">All Months</option>
              {availableMonths.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td className="px-6 py-20 text-center text-slate-400 italic">
                  No matches found for your criteria.
                </td>
              </tr>
            ) : (
              filtered.map(t => (
                <tr key={t.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: getCategoryColor(t.category) }} 
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">{t.description}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t.date} • {t.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {t.type === 'income' ? '+' : ''}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right w-10">
                    <button 
                      onClick={() => onDelete(t.id)}
                      className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;
