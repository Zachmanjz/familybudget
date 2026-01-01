
import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { getBudgetInsights } from '../services/geminiService';
import { Transaction, MonthlyBudget } from '../types';

interface Props {
  transactions: Transaction[];
  monthlyBudgets: MonthlyBudget[];
  currentMonth: string;
}

const AiInsights: React.FC<Props> = ({ transactions, monthlyBudgets, currentMonth }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    const text = await getBudgetInsights(transactions, monthlyBudgets, currentMonth);
    setInsight(text);
    setLoading(false);
  };

  useEffect(() => {
    if (transactions.length > 0) {
      fetchInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, transactions.length]);

  return (
    <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Sparkles className="w-24 h-24" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Zen AI Advisor</h3>
        </div>
        
        {loading ? (
          <div className="flex items-center gap-2 text-indigo-100">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Analyzing your spending patterns...</span>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-indigo-50 leading-relaxed whitespace-pre-wrap">
              {insight || "Add some transactions to get personalized financial advice!"}
            </p>
            <button 
              onClick={fetchInsights}
              className="mt-4 text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-lg border border-white/20"
            >
              Refresh Insights
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiInsights;
