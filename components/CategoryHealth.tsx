
import React from 'react';
import { MonthlyBudget, Transaction } from '../types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  currentMonth: string;
  monthlyBudgets: MonthlyBudget[];
  transactions: Transaction[];
  allCategories: string[];
}

const CategoryHealth: React.FC<Props> = ({ currentMonth, monthlyBudgets, transactions, allCategories }) => {
  const currentBudget = monthlyBudgets.find(b => b.month === currentMonth);
  const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth) && t.type === 'expense');

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-semibold mb-6">Budget Health</h3>
      <div className="space-y-4">
        {allCategories.map(cat => {
          const budgetItem = currentBudget?.budgets.find(b => b.category === cat);
          const budgeted = budgetItem?.budgeted || 0;
          const transTotal = monthTransactions.filter(t => t.category === cat).reduce((s, t) => s + t.amount, 0);
          const actual = budgetItem?.manualActual !== undefined ? budgetItem.manualActual : transTotal;
          
          if (budgeted === 0 && actual === 0) return null;

          const percent = budgeted > 0 ? (actual / budgeted) * 100 : 0;
          const isOver = actual > budgeted;

          return (
            <div key={cat} className="group">
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">{cat}</span>
                  {isOver ? (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                  ) : percent > 85 ? (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
                <div className="text-[10px] font-black text-slate-400">
                  ${actual.toLocaleString()} / ${budgeted.toLocaleString()}
                </div>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    isOver ? 'bg-rose-500' : percent > 85 ? 'bg-amber-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryHealth;
