
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: TransactionType;
  date: string; // ISO string format: "YYYY-MM-DD"
  description?: string;
}

export type FilterType = 'all' | TransactionType.INCOME | TransactionType.EXPENSE;
