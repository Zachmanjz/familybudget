
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, LineChart, Line } from 'recharts';
import { Transaction, MonthlyBudget, CategoryType, CategoryBudget } from '../types';
import { getCategoryColor } from '../constants';

interface Props {
  transactions: Transaction[];
  monthlyBudgets: MonthlyBudget[];
  currentMonth: string;
  allCategories: string[];
}

const Charts: React.FC<Props> = ({ transactions, monthlyBudgets, currentMonth, allCategories }) => {
  const monthTransactions = transactions.filter((t: Transaction) => t.date.startsWith(currentMonth) && t.type === 'expense');
  const budget = monthlyBudgets.find((b: MonthlyBudget) => b.month === currentMonth);

  const budgetVsActualData = useMemo(() => {
    return allCategories.map((cat: string) => {
      const budgetItem = budget?.budgets.find((b: CategoryBudget) => b.category === cat);
      const transactionTotal = monthTransactions
        .filter((t: Transaction) => t.category === cat)
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      
      const actual = budgetItem?.manualActual !== undefined ? budgetItem.manualActual : transactionTotal;
      const budgeted = budgetItem?.budgeted || 0;
      
      return { name: cat, actual, budgeted };
    }).filter(d => d.actual > 0 || d.budgeted > 0);
  }, [allCategories, budget, monthTransactions]);

  const pieData = useMemo(() => {
    return budgetVsActualData.filter(d => d.actual > 0).map(d => ({
      name: d.name,
      value: d.actual
    }));
  }, [budgetVsActualData]);

  const historicalTrends = useMemo(() => {
    const months = Array.from(new Set([
      ...transactions.map((t: Transaction) => t.date.slice(0, 7)),
      ...monthlyBudgets.map((mb: MonthlyBudget) => mb.month)
    ])).sort();
    
    return months.map(m => {
      const mTrans = transactions.filter((t: Transaction) => t.date.startsWith(m));
      const income = mTrans.filter((t: Transaction) => t.type === 'income').reduce((s: number, t: Transaction) => s + t.amount, 0);
      const expense = mTrans.filter((t: Transaction) => t.type === 'expense').reduce((s: number, t: Transaction) => s + t.amount, 0);
      return { month: m, income, expense };
    }).slice(-12);
  }, [transactions, monthlyBudgets]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <h3 className="text-xl font-black mb-8 text-slate-900 tracking-tight">Budget Performance</h3>
          <div className="h-96 w-full">
            {budgetVsActualData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={budgetVsActualData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 800 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#cbd5e1', fontWeight: 700 }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '15px' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontWeight: 'bold', fontSize: '12px' }} />
                  <Bar dataKey="budgeted" fill="#e2e8f0" radius={[6, 6, 0, 0]} name="Budgeted" barSize={20} />
                  <Bar dataKey="actual" fill="#6366f1" radius={[6, 6, 0, 0]} name="Actual" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic font-bold">No data for this period</div>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <h3 className="text-xl font-black mb-8 text-slate-900 tracking-tight">Spending Mix</h3>
          <div className="h-96 w-full relative">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <Pie
                    data={pieData}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    cx="50%"
                    cy="45%"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '15px' }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center" 
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic font-bold">Add expenses to see mix</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <h3 className="text-xl font-black mb-8 text-slate-900 tracking-tight">Efficiency Trend</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalTrends} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#cbd5e1', fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#cbd5e1', fontWeight: 700 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '15px' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} iconType="circle" />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={5} dot={{ r: 6, fill: '#10b981', strokeWidth: 3, stroke: '#fff' }} name="Total Income" />
              <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={5} dot={{ r: 6, fill: '#f43f5e', strokeWidth: 3, stroke: '#fff' }} name="Total Expense" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Charts;
