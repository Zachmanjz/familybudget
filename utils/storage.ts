
import { BudgetState } from '../types';

const STORAGE_KEY = 'zenbudget_data';

export const saveState = (state: BudgetState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadState = (): BudgetState => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return {
      transactions: [],
      monthlyBudgets: [],
      customCategories: [],
      goals: []
    };
  }
  const parsed = JSON.parse(data);
  return {
    ...parsed,
    customCategories: parsed.customCategories || [],
    goals: parsed.goals || []
  };
};
