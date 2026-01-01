
export type CategoryType = string;

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: CategoryType;
  description: string;
  type: 'expense' | 'income';
}

export interface CategoryBudget {
  category: CategoryType;
  budgeted: number;
  manualActual?: number;
}

export interface MonthlyBudget {
  month: string; // YYYY-MM
  budgets: CategoryBudget[];
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  color: string;
}

export interface BudgetState {
  transactions: Transaction[];
  monthlyBudgets: MonthlyBudget[];
  customCategories: string[];
  goals: SavingsGoal[];
}
