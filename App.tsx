
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LayoutDashboard, ReceiptText, Calendar, Wallet, History, BarChart3, Settings, PlusCircle } from 'lucide-react';
import { Transaction, MonthlyBudget, BudgetState, CategoryType, CategoryBudget } from './types';
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

const App = () => {
  const [state, setState] = useState<BudgetState>(loadState());
  const [currentMonth, setCurrentMonth] = useState('2025-11');
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'transactions' | 'yearly'>('overview');

  const allCategories = useMemo(() => {
    const combined = [...CORE_CATEGORIES, ...state.customCategories];
    return Array.from(new Set(combined));
  }, [state.customCategories]);

  useEffect(() => {
    setState((prev: BudgetState) => {
      const budgetIdx = prev.monthlyBudgets.findIndex((b: MonthlyBudget) => b.month === currentMonth);
      const newMonthlyBudgets = [...prev.monthlyBudgets];

      if (budgetIdx === -1) {
        const initialBudgets: CategoryBudget[] = allCategories.map(cat => ({
          category: cat,
          budgeted: DEFAULT_BUDGETS[cat] || 0
        }));
        newMonthlyBudgets.push({ month: currentMonth, budgets: initialBudgets });
      } else {
        const mb = newMonthlyBudgets[budgetIdx];
        const existingCats = new Set(mb.budgets.map((b: CategoryBudget) => b.category));
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
    setState((prev: BudgetState) => {
      const newState = { ...prev, transactions: [...prev.transactions, newTransaction] };
      if (!allCategories.includes(t.category) && t.category !== 'Income' && t.category !== 'Other') {
        newState.customCategories = [...prev.customCategories, t.category];
      }
      return newState;
    });
  };

  const handleImportTransactions = (transactions: Omit<Transaction, 'id'>[]) => {
    setState((prev: BudgetState) => {
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
      setState((prev: BudgetState) => ({
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== id)
      }));
    }
  };

  const handleUpdateBudget = useCallback((category: CategoryType, budgeted: number, manualActual?: number) => {
    setState((prev: BudgetState) => {
      const budgetIdx = prev.monthlyBudgets.findIndex((b: MonthlyBudget) => b.month === currentMonth);
      if (budgetIdx === -1) return prev;
      
      const newMonthlyBudgets = [...prev.monthlyBudgets];
      const mb = { ...newMonthlyBudgets[budgetIdx] };
      const catIdx = mb.budgets.findIndex((b: CategoryBudget) => b.category === category);
      
      const updatedCat: CategoryBudget = { 
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
    setState((prev: BudgetState) => ({
      ...prev,
      customCategories: [...prev.customCategories, name]
    }));
  };

  const handleUpdateGoal = (id: string, amount: number) => {
    setState((prev: BudgetState) => ({
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
    { id: 'overview', label: 'Home', icon: LayoutDashboard },
    { id: 'budget', label: 'Budget', icon: Calendar },
    { id: 'transactions', label: 'Activity', icon: ReceiptText },
    { id: 'yearly', label: 'Trends', icon: BarChart3 },
  ];

  const displayMonth = useMemo(() => {
    const [year, month] = currentMonth.split('-').map(Number);
    return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentMonth]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900">
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 p-8 flex-col sticky top-0 h-screen shadow-sm">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">ZachBudget</h1>
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest text-nowrap">YOUR FINANCIAL FREEDOM</span>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          {navItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-400'}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Viewing Period</label>
            <input 
              type="month" 
              className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              value={currentMonth}
              onChange={e => setCurrentMonth(e.target.value)}
            />
          </div>
          <button onClick={resetData} className="w-full flex items-center gap-2 px-5 py-3 text-slate-300 hover:text-rose-500 text-xs font-bold transition-colors">
            <Settings className="w-4 h-4" />
            System Settings
          </button>
        </div>
      </aside>

      <header className="md:hidden bg-white border-b border-slate-100 p-4 sticky top-0 z-40 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-50">
            <Wallet className="w-6 h-6" />
          </div>
          <span className="font-black text-xl text-slate-900">ZachBudget</span>
        </div>
        <div className="flex items-center gap-2">
           <input 
            type="month" 
            className="bg-slate-100 border-none rounded-xl px-3 py-2 text-xs font-black text-indigo-600 outline-none cursor-pointer"
            value={currentMonth}
            onChange={e => setCurrentMonth(e.target.value)}
          />
        </div>
      </header>

      <main className="flex-1 p-4 md:p-12 pb-24 md:pb-12 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <header className="hidden md:flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-indigo-600 text-xs font-black uppercase tracking-[0.2em] mb-2 block">Monthly Summary</span>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight capitalize">
                {activeTab === 'budget' ? 'Budget Planner' : `${activeTab} View`}
              </h2>
            </div>
            <div className="bg-white border-2 border-slate-100 px-6 py-4 rounded-3xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
               <Calendar className="w-5 h-5 text-indigo-600" />
               <span className="font-black text-slate-800 text-lg">{displayMonth}</span>
            </div>
          </header>

          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SummaryCards 
                transactions={state.transactions} 
                monthlyBudgets={state.monthlyBudgets} 
                currentMonth={currentMonth} 
                allCategories={allCategories}
              />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                  <AiInsights transactions={state.transactions} monthlyBudgets={state.monthlyBudgets} currentMonth={currentMonth} />
                  <Charts transactions={state.transactions} monthlyBudgets={state.monthlyBudgets} currentMonth={currentMonth} allCategories={allCategories} />
                </div>
                <div className="lg:col-span-4 space-y-8">
                  <CategoryHealth currentMonth={currentMonth} monthlyBudgets={state.monthlyBudgets} transactions={state.transactions} allCategories={allCategories} />
                  <GoalTracker goals={state.goals} onAddGoal={(g) => setState(p => ({...p, goals: [...p.goals, {...g, id: crypto.randomUUID()}]}))} onUpdateProgress={handleUpdateGoal} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <TransactionForm allCategories={allCategories} currentMonth={currentMonth} onAddTransaction={handleAddTransaction} />
                <CsvUploader allCategories={allCategories} onImport={handleImportTransactions} />
              </div>
              <TransactionList transactions={state.transactions} allCategories={allCategories} onDelete={handleDeleteTransaction} />
            </div>
          )}

          {activeTab === 'yearly' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <Charts transactions={state.transactions} monthlyBudgets={state.monthlyBudgets} currentMonth={currentMonth} allCategories={allCategories} />
               <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                  <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                    <History className="w-7 h-7 text-indigo-600" /> 
                    Financial History
                  </h3>
                  <div className="overflow-x-auto -mx-8">
                     <table className="w-full text-left min-w-[600px]">
                        <thead>
                          <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                            <th className="py-6 px-8">Period</th>
                            <th className="py-6 px-8">Total Income</th>
                            <th className="py-6 px-8">Total Expenses</th>
                            <th className="py-6 px-8">Net Savings</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {[...state.monthlyBudgets].sort((a,b) => b.month.localeCompare(a.month)).map(mb => {
                             const mTrans = state.transactions.filter(t => t.date.startsWith(mb.month));
                             const inc = mTrans.filter(t => t.type === 'income').reduce((s,t) => s+t.amount, 0);
                             const exp = mTrans.filter(t => t.type === 'expense').reduce((s,t) => s+t.amount, 0);
                             const sav = inc - exp;
                             return (
                               <tr key={mb.month} className="hover:bg-slate-50 group transition-colors">
                                  <td className="py-6 px-8 font-black text-slate-900">{mb.month}</td>
                                  <td className="py-6 px-8 text-emerald-600 font-black">${inc.toLocaleString()}</td>
                                  <td className="py-6 px-8 text-rose-600 font-black">${exp.toLocaleString()}</td>
                                  <td className={`py-6 px-8 font-black ${sav >= 0 ? 'text-indigo-600' : 'text-rose-700'}`}>
                                    ${sav.toLocaleString()}
                                  </td>
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

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-4 flex justify-between items-center z-50 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        {navItems.map(item => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex flex-col items-center gap-1.5 transition-all relative ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            {activeTab === item.id && (
              <span className="absolute -top-4 w-12 h-1.5 bg-indigo-600 rounded-full animate-in slide-in-from-top-2" />
            )}
            <item.icon className={`w-6 h-6 ${activeTab === item.id ? 'scale-110' : ''} transition-transform`} />
            <span className="text-[9px] font-black uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
        <button 
          onClick={() => setActiveTab('transactions')}
          className="absolute -top-8 left-1/2 -translate-x-1/2 w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 border-4 border-white active:scale-90 transition-transform"
        >
          <PlusCircle className="w-8 h-8" />
        </button>
      </nav>
    </div>
  );
};

export default App;
