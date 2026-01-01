
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, LineChart, Line } from 'recharts';
import { Transaction, MonthlyBudget, CategoryType } from '../types';
import { getCategoryColor } from '../constants';

interface Props {
  transactions: Transaction[];
  monthlyBudgets: MonthlyBudget[];
  currentMonth: string;
  allCategories: string[];
}

const Charts: React.FC<Props> = ({ transactions, monthlyBudgets, currentMonth, allCategories }) => {
  const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth) && t.type === 'expense');
  const budget = monthlyBudgets.find(b => b.month === currentMonth);

  const budgetVsActualData = allCategories.map(cat => {
    const budgetItem = budget?.budgets.find(b => b.category === cat);
    const transactionTotal = monthTransactions
      .filter(t => t.category === cat)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const actual = budgetItem?.manualActual !== undefined ? budgetItem.manualActual : transactionTotal;
    const budgeted = budgetItem?.budgeted || 0;
    
    return { name: cat, actual, budgeted };
  }).filter(d => d.actual > 0 || d.budgeted > 0);

  const pieData = budgetVsActualData.filter(d => d.actual > 0).map(d => ({
    name: d.name,
    value: d.actual
  }));

  const historicalTrends = useMemo(() => {
    const months = Array.from(new Set([
      ...transactions.map(t => t.date.slice(0, 7)),
      ...monthlyBudgets.map(mb => mb.month)
    ])).sort();
    
    return months.map(m => {
      const mTrans = transactions.filter(t => t.date.startsWith(m));
      const income = mTrans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = mTrans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return { month: m, income, expense };
    }).slice(-12); // Show last 12 months
  }, [transactions, monthlyBudgets]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-6">Budget vs Actual</h3>
          <div className="h-96">
            {budgetVsActualData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={budgetVsActualData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 500 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Bar dataKey="budgeted" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Budget" />
                  <Bar dataKey="actual" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic">No data for this month</div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-6">Spending Distribution</h3>
          <div className="h-96">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic">Add expenses to see breakdown</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold mb-6">Yearly Performance</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalTrends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Income" />
              <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} name="Expense" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Charts;
