
import React, { useState } from 'react';
import { CategoryType, MonthlyBudget, Transaction } from '../types';
import { Plus, Tag, AlertTriangle, CheckCircle, Info, ArrowRight } from 'lucide-react';
import { getCategoryColor } from '../constants';

interface Props {
  currentMonth: string;
  monthlyBudgets: MonthlyBudget[];
  transactions: Transaction[];
  allCategories: string[];
  onUpdateBudget: (category: CategoryType, budgeted: number, actual?: number) => void;
  onAddCategory: (name: string) => void;
}

const BudgetTable: React.FC<Props> = ({ 
  currentMonth, 
  monthlyBudgets, 
  transactions, 
  allCategories, 
  onUpdateBudget, 
  onAddCategory 
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const currentBudget = monthlyBudgets.find(b => b.month === currentMonth);
  const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth) && t.type === 'expense');

  const totalBudgeted = allCategories.reduce((sum, cat) => sum + (currentBudget?.budgets.find(b => b.category === cat)?.budgeted || 0), 0);
  
  const totalActual = allCategories.reduce((sum, cat) => {
    const budgetItem = currentBudget?.budgets.find(b => b.category === cat);
    const transTotal = monthTransactions.filter(t => t.category === cat).reduce((s, t) => s + t.amount, 0);
    return sum + (budgetItem?.manualActual !== undefined ? budgetItem.manualActual : transTotal);
  }, 0);

  const handleAddNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg min-w-0">
          <div className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1 truncate">Total Planned</div>
          <div className="text-2xl sm:text-3xl font-black truncate">${totalBudgeted.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm min-w-0">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 truncate">Total Actual</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 truncate">${totalActual.toLocaleString()}</div>
        </div>
        <div className={`rounded-2xl p-6 border shadow-sm min-w-0 ${totalBudgeted - totalActual < 0 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
          <div className={`${totalBudgeted - totalActual < 0 ? 'text-rose-600' : 'text-emerald-600'} text-xs font-bold uppercase tracking-widest mb-1 truncate`}>
            Remaining
          </div>
          <div className={`text-2xl sm:text-3xl font-black truncate ${totalBudgeted - totalActual < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
            ${(totalBudgeted - totalActual).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Budget Spreadsheet</h3>
            <p className="text-slate-500 text-sm">Review all categories and plan your monthly spending.</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-500">
              {allCategories.length} Categories Active
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-200">
                <th className="px-6 py-4">Category Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Planned Budget ($)</th>
                <th className="px-6 py-4">Actual Spend ($)</th>
                <th className="px-6 py-4 text-right">Remaining ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allCategories.map(cat => {
                const budgetItem = currentBudget?.budgets.find(b => b.category === cat);
                const budgetedVal = budgetItem?.budgeted || 0;
                const transTotal = monthTransactions.filter(t => t.category === cat).reduce((s, t) => s + t.amount, 0);
                const actualVal = budgetItem?.manualActual !== undefined ? budgetItem.manualActual : transTotal;
                const variance = budgetedVal - actualVal;
                const percentUsed = budgetedVal > 0 ? (actualVal / budgetedVal) * 100 : 0;

                return (
                  <tr key={cat} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getCategoryColor(cat) }} />
                        <span className="font-bold text-slate-700">{cat}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {percentUsed >= 100 ? (
                        <div className="flex items-center gap-1.5 text-rose-600 text-xs font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" /> Over
                        </div>
                      ) : percentUsed > 85 ? (
                        <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold">
                          <Info className="w-3.5 h-3.5" /> Near Limit
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                          <CheckCircle className="w-3.5 h-3.5" /> On Track
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
                        <input 
                          type="number"
                          className="w-32 bg-slate-50 border border-slate-200 rounded-lg pl-6 pr-3 py-1.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={budgetedVal || ''}
                          placeholder="0.00"
                          onChange={(e) => onUpdateBudget(cat, parseFloat(e.target.value) || 0, budgetItem?.manualActual)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
                        <input 
                          type="number"
                          className="w-32 bg-white border border-slate-200 rounded-lg pl-6 pr-3 py-1.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={budgetItem?.manualActual !== undefined ? budgetItem.manualActual : (transTotal || '')}
                          placeholder={transTotal > 0 ? transTotal.toString() : "0.00"}
                          onChange={(e) => onUpdateBudget(cat, budgetedVal, e.target.value === '' ? undefined : parseFloat(e.target.value))}
                        />
                        {budgetItem?.manualActual === undefined && transTotal > 0 && (
                          <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[8px] px-1 rounded animate-pulse">Auto</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`font-black ${variance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {variance < 0 ? '-' : ''}${Math.abs(variance).toLocaleString()}
                      </div>
                      <div className="w-full bg-slate-100 h-1 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${percentUsed > 100 ? 'bg-rose-500' : percentUsed > 85 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(percentUsed, 100)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-900 text-white font-bold border-t-4 border-white">
              <tr>
                <td className="px-6 py-5 uppercase text-xs tracking-widest font-black">Monthly Totals</td>
                <td className="px-6 py-5"></td>
                <td className="px-6 py-5 text-lg">${totalBudgeted.toLocaleString()}</td>
                <td className="px-6 py-5 text-lg text-slate-300">${totalActual.toLocaleString()}</td>
                <td className="px-6 py-5 text-right text-lg">
                  <span className={totalBudgeted - totalActual < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                    ${(totalBudgeted - totalActual).toLocaleString()}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-200">
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Add Custom Category</label>
              <div className="relative group max-w-md">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="text"
                  placeholder="e.g. Vacation Fund, Guitar Lessons..."
                  className="w-full bg-white border-2 border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 transition-all"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNewCategory(e)}
                />
              </div>
            </div>
            <button 
              onClick={handleAddNewCategory}
              className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black py-3.5 px-8 rounded-2xl transition-all shadow-xl shadow-indigo-200 flex items-center gap-2 group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              Save New Category
            </button>
          </div>
        </div>
      </div>

      {/* Quick Help Card */}
      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl flex items-start gap-4">
        <div className="p-2 bg-white rounded-xl shadow-sm"><Info className="w-6 h-6 text-indigo-600" /></div>
        <div className="text-sm">
          <h4 className="font-bold text-indigo-900 mb-1">Pro Tip: Automatic Tracking</h4>
          <p className="text-indigo-700 leading-relaxed">
            The <b>Actual Amount</b> column automatically pulls data from your transactions. 
            If you want to manually override a value (e.g. for cash spending not in your statements), 
            simply type it into the field. To revert to automatic tracking, clear the field.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetTable;
