
import React from 'react';
import { Transaction, MonthlyBudget, CategoryBudget } from '../types';
import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  monthlyBudgets: MonthlyBudget[];
  currentMonth: string;
  allCategories: string[];
}

const SummaryCards: React.FC<Props> = ({ transactions, monthlyBudgets, currentMonth, allCategories }) => {
  const monthTransactions = transactions.filter((t: Transaction) => t.date.startsWith(currentMonth));
  const income = monthTransactions
    .filter((t: Transaction) => t.type === 'income')
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
  
  const currentBudget = monthlyBudgets.find((b: MonthlyBudget) => b.month === currentMonth);
  const totalBudgeted = currentBudget?.budgets.reduce((sum: number, b: CategoryBudget) => sum + (b.budgeted || 0), 0) || 0;
  
  const expenses = allCategories.reduce((total: number, cat: string) => {
    const budgetItem = currentBudget?.budgets.find((b: CategoryBudget) => b.category === cat);
    const transactionTotal = monthTransactions
      .filter((t: Transaction) => t.category === cat && t.type === 'expense')
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
    
    return total + (budgetItem?.manualActual !== undefined ? budgetItem.manualActual : transactionTotal);
  }, 0);
  
  const balance = income - expenses;
  const budgetUtilization = totalBudgeted > 0 ? (expenses / totalBudgeted) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-500 text-sm font-medium">Monthly Income</span>
          <div className="p-2 bg-emerald-50 rounded-lg"><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
        </div>
        <div className="text-2xl font-bold text-slate-900">${income.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-500 text-sm font-medium">Total Expenses</span>
          <div className="p-2 bg-rose-50 rounded-lg"><TrendingDown className="w-5 h-5 text-rose-600" /></div>
        </div>
        <div className="text-2xl font-bold text-slate-900">${expenses.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-500 text-sm font-medium">Monthly Cash Flow</span>
          <div className="p-2 bg-blue-50 rounded-lg"><Wallet className="w-5 h-5 text-blue-600" /></div>
        </div>
        <div className="text-2xl font-bold text-slate-900">${balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-500 text-sm font-medium">Spending Progress</span>
          <div className="p-2 bg-amber-50 rounded-lg"><Target className="w-5 h-5 text-amber-600" /></div>
        </div>
        <div className="text-2xl font-bold text-slate-900">{budgetUtilization.toFixed(1)}%</div>
      </div>
    </div>
  );
};

export default SummaryCards;
