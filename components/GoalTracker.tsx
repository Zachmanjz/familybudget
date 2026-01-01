
import React, { useState } from 'react';
import { Target, Plus, TrendingUp, PiggyBank } from 'lucide-react';
import { SavingsGoal } from '../types';

interface Props {
  goals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  onUpdateProgress: (id: string, amount: number) => void;
}

const GoalTracker: React.FC<Props> = ({ goals, onAddGoal, onUpdateProgress }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newTarget) return;
    onAddGoal({
      name: newName,
      target: parseFloat(newTarget),
      current: 0,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    });
    setNewName('');
    setNewTarget('');
    setIsAdding(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold">Savings Goals</h3>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="text-indigo-600 hover:text-indigo-700 font-bold text-sm flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          {isAdding ? 'Cancel' : 'New Goal'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="mb-6 p-4 bg-slate-50 rounded-xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <input 
            type="text" 
            placeholder="Goal Name (e.g. Hawaii Trip)"
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder="Target Amount"
              className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={newTarget}
              onChange={e => setNewTarget(e.target.value)}
            />
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Add</button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {goals.length === 0 ? (
          <div className="text-center py-6 text-slate-400">
            <PiggyBank className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Start saving for your dreams!</p>
          </div>
        ) : (
          goals.map(goal => {
            const percent = Math.min((goal.current / goal.target) * 100, 100);
            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-sm font-bold text-slate-800">{goal.name}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      ${goal.current.toLocaleString()} of ${goal.target.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xs font-black text-indigo-600">{Math.round(percent)}%</div>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${percent}%`, backgroundColor: goal.color }}
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onUpdateProgress(goal.id, 50)}
                    className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded hover:bg-emerald-100 transition-colors"
                  >
                    + $50
                  </button>
                  <button 
                    onClick={() => onUpdateProgress(goal.id, 500)}
                    className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded hover:bg-emerald-100 transition-colors"
                  >
                    + $500
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GoalTracker;
