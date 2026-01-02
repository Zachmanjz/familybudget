
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LayoutDashboard, ReceiptText, Calendar, Wallet, History, BarChart3, Settings } from 'lucide-react';
import { Transaction, MonthlyBudget, BudgetState, CategoryType, SavingsGoal } from './types';
import { loadState, saveState } from './utils/storage';
import { CORE_CATEGORIES, DEFAULT_BUDGETS } from './constants';
import SummaryCards from './components/SummaryCards';
import Charts from './components/Charts';
import AiInsights from './components/AiInsights';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import BudgetTable from './components/BudgetTable';
import CsvUploader from './components/CsvUploader';
import GoalTracker from './components/GoalTracker';
import CategoryHealth from './components/CategoryHealth';

const App: React.FC = () => {
  const [state, setState] = useState<BudgetState>(loadState());
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'transactions' | 'yearly'>('overview');

  const allCategories = useMemo(() => {
    const combined = [...CORE_CATEGORIES, ...state.customCategories];
    return Array.from(new Set(combined));
  }, [state.customCategories]);

  useEffect(() => {
    setState(prev => {
      const budgetIdx = prev.monthlyBudgets.findIndex(b => b.month === currentMonth);
      const newMonthlyBudgets = [...prev.monthlyBudgets];

      if (budgetIdx === -1) {
        const initialBudgets = allCategories.map(cat => ({
          category: cat,
          budgeted: DEFAULT_BUDGETS[cat] || 0
        }));
        newMonthlyBudgets.push({ month: currentMonth, budgets: initialBudgets });
      } else {
        const mb = newMonthlyBudgets[budgetIdx];
        const existingCats = new Set(mb.budgets.map(b => b.category));
        const missing = allCategories.filter(cat => !existingCats.has(cat));
        
        if (missing.length > 0) {
          newMonthlyBudgets[budgetIdx] = {
            ...mb,
            budgets: [
              ...mb.budgets,
              ...missing.map(cat => ({ category: cat, budgeted: DEFAULT_BUDGETS[cat] || 0 }))
            ]
          };
        } else {
          return prev;
        }
      }

      return { ...prev, monthlyBudgets: newMonthlyBudgets };
    });
  }, [currentMonth, allCategories.length]);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const handleAddTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = { ...t, id: crypto.randomUUID() };
    setState(prev => {
      const newState = { ...prev, transactions: [...prev.transactions, newTransaction] };
      if (!allCategories.includes(t.category) && t.category !== 'Income' && t.category !== 'Other') {
        newState.customCategories = [...prev.customCategories, t.category];
      }
      return newState;
    });
  };

  const handleImportTransactions = (transactions: Omit<Transaction, 'id'>[]) => {
    setState(prev => {
      const uniqueIncoming = transactions.filter(incoming => {
        return !prev.transactions.some(existing => 
          existing.date === incoming.date && 
          existing.amount === incoming.amount && 
          existing.description.toLowerCase() === incoming.description.toLowerCase()
        );
      });

      const newWithIds = uniqueIncoming.map(t => ({ ...t, id: crypto.randomUUID() }));
      const currentCats = new Set([...CORE_CATEGORIES, ...prev.customCategories]);
      const newCats = Array.from(new Set(newWithIds.map(t => t.category)))
        .filter(cat => cat !== 'Income' && cat !== 'Other' && !currentCats.has(cat));

      return {
        ...prev,
        transactions: [...prev.transactions, ...newWithIds],
        customCategories: [...prev.customCategories, ...newCats]
      };
    });
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm("Delete this transaction?")) {
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== id)
      }));
    }
  };

  const handleUpdateBudget = useCallback((category: CategoryType, budgeted: number, manualActual?: number) => {
    setState(prev => {
      const budgetIdx = prev.monthlyBudgets.findIndex(b => b.month === currentMonth);
      if (budgetIdx === -1) return prev;
      
      const newMonthlyBudgets = [...prev.monthlyBudgets];
      const mb = { ...newMonthlyBudgets[budgetIdx] };
      const catIdx = mb.budgets.findIndex(b => b.category === category);
      
      const updatedCat = { 
        category, 
        budgeted, 
        manualActual: manualActual === undefined ? undefined : manualActual 
      };

      if (catIdx === -1) {
        mb.budgets = [...mb.budgets, updatedCat];
      } else {
        mb.budgets = mb.budgets.map((b, i) => i === catIdx ? updatedCat : b);
      }

      newMonthlyBudgets[budgetIdx] = mb;
      return { ...prev, monthlyBudgets: newMonthlyBudgets };
    });
  }, [currentMonth]);

  const handleAddCategory = (name: string) => {
    if (allCategories.includes(name)) return;
    setState(prev => ({
      ...prev,
      customCategories: [...prev.customCategories, name]
    }));
  };

  const handleUpdateGoal = (id: string, amount: number) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, current: g.current + amount } : g)
    }));
  };

  const resetData = () => {
    if (confirm("CRITICAL: Delete all transactions and budget settings? This cannot be undone.")) {
      const resetState: BudgetState = { transactions: [], monthlyBudgets: [], customCategories: [], goals: [] };
      setState(resetState);
      saveState(resetState);
      localStorage.removeItem('zenbudget_data');
      window.location.reload();
    }
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'budget', label: 'Budget', icon: Calendar },
    { id: 'transactions', label: 'Activity', icon: ReceiptText },
    { id: 'yearly', label: 'History', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 p-6 flex-col sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Wallet className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">ZachBudget</span>
        </div>

        <nav className="space-y-1 flex-1">
          {navItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === item.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Viewing Period</label>
            <input 
              type="month" 
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              value={currentMonth}
              onChange={e => setCurrentMonth(e.target.value)}
            />
          </div>
          <button onClick={resetData} className="w-full flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-rose-500 text-xs font-bold transition-colors">
            <Settings className="w-4 h-4" />
            Reset Data
          </button>
        </div>
      </aside>

      {/* Header for Mobile */}
      <header className="md:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-900">ZachBudget</span>
        </div>
        <input 
          type="month" 
          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold outline-none"
          value={currentMonth}
          onChange={e => setCurrentMonth(e.target.value)}
        />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 pb-24 md:pb-10 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <header className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 capitalize">
                {activeTab === 'budget' ? 'Budget Planner' : `${activeTab} Overview`}
              </h1>
              <p className="text-slate-500">
                {activeTab === 'budget' ? 'Plan your family spending' : 'Your complete financial picture'}
              </p>
            </div>
            <div className="flex items-center gap-3">
               <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold text-slate-700">{new Date(currentMonth + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
               </div>
            </div>
          </header>

          {activeTab === 'overview' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <SummaryCards 
                transactions={state.transactions} 
                monthlyBudgets={state.monthlyBudgets} 
                currentMonth={currentMonth} 
                allCategories={allCategories}
              />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 space-y-6">
                  <AiInsights transactions={state.transactions} monthlyBudgets={state.monthlyBudgets} currentMonth={currentMonth} />
                  <Charts transactions={state.transactions} monthlyBudgets={state.monthlyBudgets} currentMonth={currentMonth} allCategories={allCategories} />
                </div>
                <div className="lg:col-span-1 space-y-6">
                  <CategoryHealth currentMonth={currentMonth} monthlyBudgets={state.monthlyBudgets} transactions={state.transactions} allCategories={allCategories} />
                  <GoalTracker goals={state.goals} onAddGoal={(g) => setState(p => ({...p, goals: [...p.goals, {...g, id: crypto.randomUUID()}]}))} onUpdateProgress={handleUpdateGoal} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <BudgetTable 
                currentMonth={currentMonth} 
                monthlyBudgets={state.monthlyBudgets} 
                transactions={state.transactions}
                allCategories={allCategories}
                onUpdateBudget={handleUpdateBudget} 
                onAddCategory={handleAddCategory}
              />
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TransactionForm allCategories={allCategories} currentMonth={currentMonth} onAddTransaction={handleAddTransaction} />
                <CsvUploader allCategories={allCategories} onImport={handleImportTransactions} />
              </div>
              <TransactionList transactions={state.transactions} allCategories={allCategories} onDelete={handleDeleteTransaction} />
            </div>
          )}

          {activeTab === 'yearly' && (
            <div className="space-y-8 animate-in fade-in duration-300">
               <Charts transactions={state.transactions} monthlyBudgets={state.monthlyBudgets} currentMonth={currentMonth} allCategories={allCategories} />
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <History className="w-6 h-6 text-indigo-600" /> 
                    Monthly History
                  </h3>
                  <div className="overflow-x-auto -mx-6">
                     <table className="w-full text-left min-w-[500px]">
                        <thead>
                          <tr className="text-xs font-bold text-slate-400 uppercase border-b border-slate-50">
                            <th className="py-4 px-6">Month</th>
                            <th className="py-4 px-6">Income</th>
                            <th className="py-4 px-6">Expenses</th>
                            <th className="py-4 px-6">Savings</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {[...state.monthlyBudgets].sort((a,b) => b.month.localeCompare(a.month)).map(mb => {
                             const mTrans = state.transactions.filter(t => t.date.startsWith(mb.month));
                             const inc = mTrans.filter(t => t.type === 'income').reduce((s,t) => s+t.amount, 0);
                             const exp = mTrans.filter(t => t.type === 'expense').reduce((s,t) => s+t.amount, 0);
                             return (
                               <tr key={mb.month} className="hover:bg-slate-50">
                                  <td className="py-4 px-6 font-bold">{mb.month}</td>
                                  <td className="py-4 px-6 text-emerald-600 font-bold">${inc.toLocaleString()}</td>
                                  <td className="py-4 px-6 text-rose-600 font-bold">${exp.toLocaleString()}</td>
                                  <td className="py-4 px-6 font-black text-indigo-600">${(inc-exp).toLocaleString()}</td>
                               </tr>
                             )
                          })}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 pb-safe">
        {navItems.map(item => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
