// Fix: Import Transaction and TransactionType to properly type the mock data.
import { Transaction, TransactionType } from './types';

export const CATEGORIES = [
  'Food',
  'Salary',
  'Transport',
  'Shopping',
  'Utilities',
  'Entertainment',
  'Health',
  'Freelance',
  'Investment',
  'Other',
];

// Fix: Explicitly type MOCK_TRANSACTIONS as Transaction[] and use TransactionType enum.
export const MOCK_TRANSACTIONS: Transaction[] = [
    { id: '1', title: 'Monthly Salary', amount: 5000, category: 'Salary', type: TransactionType.INCOME, date: '2023-10-01', description: 'October salary' },
    { id: '2', title: 'Grocery Shopping', amount: 150, category: 'Food', type: TransactionType.EXPENSE, date: '2023-10-05', description: 'Weekly groceries' },
    { id: '3', title: 'Train Ticket', amount: 45, category: 'Transport', type: TransactionType.EXPENSE, date: '2023-10-06' },
    { id: '4', title: 'Freelance Project', amount: 750, category: 'Freelance', type: TransactionType.INCOME, date: '2023-10-10' },
    { id: '5', title: 'Electricity Bill', amount: 80, category: 'Utilities', type: TransactionType.EXPENSE, date: '2023-10-12' },
    { id: '6', title: 'Movie Night', amount: 35, category: 'Entertainment', type: TransactionType.EXPENSE, date: '2023-10-15' },
    { id: '7', title: 'New Shoes', amount: 120, category: 'Shopping', type: TransactionType.EXPENSE, date: '2023-10-20' },
    { id: '8', title: 'Stock Dividend', amount: 200, category: 'Investment', type: TransactionType.INCOME, date: '2023-10-22' },
    { id: '9', title: 'Pharmacy', amount: 25, category: 'Health', type: TransactionType.EXPENSE, date: '2023-10-25' },
];