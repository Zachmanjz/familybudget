
import { CategoryType } from './types';

export const CORE_CATEGORIES: CategoryType[] = [
  'Housing & Utilities',
  'Insurance & Auto',
  'Groceries & Household',
  'Dining & Entertainment',
  'Family / Kids / Personal',
  'Medical / Charitable',
  'Retail / Shopping',
  'Travel / Events',
  'Debt Payments',
  'Savings / Emergency Fund',
  'Other'
];

export const DEFAULT_BUDGETS: Record<string, number> = {
  'Housing & Utilities': 3000,
  'Insurance & Auto': 500,
  'Groceries & Household': 1000,
  'Dining & Entertainment': 500,
  'Family / Kids / Personal': 1000,
  'Medical / Charitable': 200,
  'Retail / Shopping': 400,
  'Travel / Events': 0,
  'Debt Payments': 500,
  'Savings / Emergency Fund': 500,
  'Other': 0
};

export const CATEGORY_COLORS: Record<string, string> = {
  'Housing & Utilities': '#3b82f6',
  'Insurance & Auto': '#f59e0b',
  'Groceries & Household': '#10b981',
  'Dining & Entertainment': '#ec4899',
  'Family / Kids / Personal': '#8b5cf6',
  'Medical / Charitable': '#ef4444',
  'Retail / Shopping': '#6366f1',
  'Travel / Events': '#14b8a6',
  'Debt Payments': '#64748b',
  'Savings / Emergency Fund': '#f43f5e',
  'Income': '#10b981',
  'Other': '#94a3b8'
};

export const getCategoryColor = (category: string) => {
  return CATEGORY_COLORS[category] || '#94a3b8';
};
