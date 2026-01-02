
import { BudgetState, Transaction } from '../types';

const STORAGE_KEY = 'zenbudget_data';

const SEED_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2025-11-28', description: 'KROGER #415', category: 'Groceries & Household', amount: 25.08, type: 'expense' },
  { id: '2', date: '2025-11-29', description: 'KROGER #415', category: 'Groceries & Household', amount: 24.52, type: 'expense' },
  { id: '3', date: '2025-11-28', description: 'STARBUCKS STORE 08225', category: 'Dining & Entertainment', amount: 6.23, type: 'expense' },
  { id: '4', date: '2025-11-26', description: 'KROGER #415', category: 'Groceries & Household', amount: 39.63, type: 'expense' },
  { id: '5', date: '2025-11-25', description: 'Amazon.com*B240R0A10', category: 'Retail / Shopping', amount: 148.7, type: 'expense' },
  { id: '6', date: '2025-11-25', description: 'MENB508 MENCHIES SWEET', category: 'Dining & Entertainment', amount: 8.09, type: 'expense' },
  { id: '7', date: '2025-11-25', description: 'KROGER #415', category: 'Groceries & Household', amount: 63.61, type: 'expense' },
  { id: '8', date: '2025-11-25', description: 'DOLLARTREE', category: 'Retail / Shopping', amount: 7.83, type: 'expense' },
  { id: '9', date: '2025-11-24', description: 'AMAZON MKTPL*B23343JX1', category: 'Retail / Shopping', amount: 34.92, type: 'expense' },
  { id: '10', date: '2025-11-22', description: 'TARGET 00017616', category: 'Retail / Shopping', amount: 99.51, type: 'expense' },
  { id: '11', date: '2025-11-23', description: 'MICHAELS STORES 1070', category: 'Retail / Shopping', amount: 97.94, type: 'expense' },
  { id: '12', date: '2025-11-23', description: 'UNITED CONCORDIA GOVT', category: 'Medical / Charitable', amount: 86.47, type: 'expense' },
  { id: '13', date: '2025-11-22', description: 'TARGET 00017616', category: 'Retail / Shopping', amount: 21.86, type: 'expense' },
  { id: '14', date: '2025-11-24', description: 'AMAZON MKTPL*B261V53P2', category: 'Retail / Shopping', amount: 16.11, type: 'expense' },
  { id: '15', date: '2025-11-23', description: 'TARGET 00017616', category: 'Retail / Shopping', amount: 21.56, type: 'expense' },
  { id: '16', date: '2025-11-23', description: 'MICHAELS STORES 1070', category: 'Retail / Shopping', amount: 10, type: 'expense' },
  { id: '17', date: '2025-11-23', description: 'WHISTLEEXPRESSCARWASH', category: 'Insurance & Auto', amount: 16, type: 'expense' },
  { id: '18', date: '2025-11-22', description: 'Vera Bradley 4083', category: 'Retail / Shopping', amount: 23.84, type: 'expense' },
  { id: '19', date: '2025-11-22', description: 'AMAZON MKTPL*B04Z56W81', category: 'Retail / Shopping', amount: 29.61, type: 'expense' },
  { id: '20', date: '2025-11-21', description: 'KROGER #415', category: 'Groceries & Household', amount: 100.2, type: 'expense' },
  { id: '21', date: '2025-11-21', description: 'KROGER FUEL CTR #1431', category: 'Insurance & Auto', amount: 21.15, type: 'expense' },
  { id: '22', date: '2025-11-21', description: 'ALDI 76016 ROSWELL', category: 'Groceries & Household', amount: 84.78, type: 'expense' },
  { id: '23', date: '2025-11-21', description: 'USPS PO 1276030316', category: 'Retail / Shopping', amount: 7.2, type: 'expense' },
  { id: '24', date: '2025-11-21', description: 'DOLLARTREE', category: 'Retail / Shopping', amount: 9.56, type: 'expense' },
  { id: '25', date: '2025-11-19', description: "MCDONALD'S F31583", category: 'Dining & Entertainment', amount: 18.14, type: 'expense' },
  { id: '26', date: '2025-11-19', description: 'THE UPS STORE 2774', category: 'Retail / Shopping', amount: 4, type: 'expense' },
  { id: '27', date: '2025-11-19', description: 'AMAZON MKTPL*B00SZ61R1', category: 'Retail / Shopping', amount: 5.38, type: 'expense' },
  { id: '28', date: '2025-11-19', description: 'KROGER #415', category: 'Groceries & Household', amount: 31.31, type: 'expense' },
  { id: '29', date: '2025-11-18', description: 'AMAZON MKTPL*B03I83FH2', category: 'Retail / Shopping', amount: 29.04, type: 'expense' },
  { id: '30', date: '2025-11-18', description: 'TRAVEL RESERVATION', category: 'Travel / Events', amount: 250, type: 'expense' },
  { id: '31', date: '2025-11-17', description: 'AMAZON MKTPLACE PMTS', category: 'Retail / Shopping', amount: 7.53, type: 'expense' },
  { id: '32', date: '2025-11-16', description: 'CRACKER BARREL #611 ALPHA', category: 'Dining & Entertainment', amount: 204.71, type: 'expense' },
  { id: '33', date: '2025-11-17', description: 'AMAZON MKTPL*B81TW27M2', category: 'Retail / Shopping', amount: 6.45, type: 'expense' },
  { id: '34', date: '2025-11-15', description: 'ALDI 76016 ROSWELL', category: 'Groceries & Household', amount: 87.56, type: 'expense' },
  { id: '35', date: '2025-11-15', description: 'MARTA - D1A', category: 'Travel / Events', amount: 20, type: 'expense' },
  { id: '36', date: '2025-11-15', description: 'KROGER #415', category: 'Groceries & Household', amount: 98.89, type: 'expense' },
  { id: '37', date: '2025-11-14', description: 'ZONA COCINA MSP', category: 'Dining & Entertainment', amount: 22.6, type: 'expense' },
  { id: '38', date: '2025-11-14', description: 'GEICO *AUTO', category: 'Insurance & Auto', amount: 75.46, type: 'expense' },
  { id: '39', date: '2025-11-15', description: 'MARTA TVM', category: 'Travel / Events', amount: 5, type: 'expense' },
  { id: '40', date: '2025-11-14', description: 'PEI WEI TERM F ATL', category: 'Dining & Entertainment', amount: 16.62, type: 'expense' },
  { id: '41', date: '2025-11-15', description: 'AMAZON MKTPL*B88133192', category: 'Retail / Shopping', amount: 38.78, type: 'expense' },
  { id: '42', date: '2025-11-15', description: 'Five Star Breaktime So', category: 'Retail / Shopping', amount: 2.9, type: 'expense' },
  { id: '43', date: '2025-11-14', description: 'SPEEDWAY 46425', category: 'Insurance & Auto', amount: 3.88, type: 'expense' },
  { id: '44', date: '2025-11-13', description: 'SPEEDWAY 46425', category: 'Insurance & Auto', amount: 32.01, type: 'expense' },
  { id: '45', date: '2025-11-13', description: 'AMAZON MKTPL*B80TX0PM0', category: 'Retail / Shopping', amount: 31.17, type: 'expense' },
  { id: '46', date: '2025-11-11', description: 'KWIK SHOP', category: 'Insurance & Auto', amount: 15, type: 'expense' },
  { id: '47', date: '2025-11-13', description: 'AMAZON MKTPL*B87G07PX0', category: 'Retail / Shopping', amount: 88.08, type: 'expense' },
  { id: '48', date: '2025-11-08', description: 'CHICK-FIL-A #03700', category: 'Dining & Entertainment', amount: 36.44, type: 'expense' },
  { id: '49', date: '2025-11-07', description: 'PEACE LOVE AND PIZZA 6', category: 'Dining & Entertainment', amount: 129.25, type: 'expense' },
  { id: '50', date: '2025-11-07', description: 'SAMSCLUB #6646', category: 'Groceries & Household', amount: 68.01, type: 'expense' },
  { id: '51', date: '2025-11-07', description: 'TARGET 00024760', category: 'Retail / Shopping', amount: 13.94, type: 'expense' },
  { id: '52', date: '2025-11-08', description: 'SQ *SWEET NAILS SPA LLC 1', category: 'Family / Kids / Personal', amount: 120, type: 'expense' },
  { id: '53', date: '2025-11-08', description: 'SP PINKPALMPUFF', category: 'Retail / Shopping', amount: 106.67, type: 'expense' },
  { id: '54', date: '2025-11-07', description: 'SAMSCLUB #6646', category: 'Groceries & Household', amount: 83.97, type: 'expense' },
  { id: '55', date: '2025-11-07', description: 'TARGET 00024760', category: 'Retail / Shopping', amount: 42.67, type: 'expense' },
  { id: '56', date: '2025-11-07', description: 'KROGER #415', category: 'Groceries & Household', amount: 2.48, type: 'expense' },
  { id: '57', date: '2025-11-06', description: 'PUBLIX #1019', category: 'Groceries & Household', amount: 57.67, type: 'expense' },
  { id: '58', date: '2025-11-05', description: 'AMAZON MKTPL*BT8FC2Z10', category: 'Retail / Shopping', amount: 52.72, type: 'expense' },
  { id: '59', date: '2025-11-04', description: 'PY *TIN DRUM ASIA CAFE', category: 'Dining & Entertainment', amount: 14.1, type: 'expense' },
  { id: '60', date: '2025-11-05', description: 'KROGER FUEL CTR #1680', category: 'Insurance & Auto', amount: 21.15, type: 'expense' },
  { id: '61', date: '2025-11-04', description: 'OLDE CRABAPPLE BOTTLE SHO', category: 'Dining & Entertainment', amount: 31.61, type: 'expense' },
  { id: '62', date: '2025-11-04', description: 'GSU PANTHERCASH ONLINE', category: 'Travel / Events', amount: 25, type: 'expense' },
  { id: '63', date: '2025-11-04', description: 'KROGER #415', category: 'Groceries & Household', amount: 11.26, type: 'expense' },
  { id: '64', date: '2025-11-04', description: 'KROGER #415', category: 'Groceries & Household', amount: 40.53, type: 'expense' },
  { id: '65', date: '2025-11-03', description: 'HGB TRS TRR', category: 'Medical / Charitable', amount: 96.79, type: 'expense' },
  { id: '66', date: '2025-11-01', description: 'OLDE CRABAPPLE BOTTLE SHO', category: 'Dining & Entertainment', amount: 33.72, type: 'expense' },
  { id: '67', date: '2025-11-01', description: 'KROGER #415', category: 'Groceries & Household', amount: 87.75, type: 'expense' },
  { id: '68', date: '2025-11-26', description: 'LENDINGCLUB BANK EXT-XFER', category: 'Savings / Emergency Fund', amount: 400, type: 'expense' },
  { id: '69', date: '2025-11-24', description: 'CASH APP*JEREMY ZACH', category: 'Dining & Entertainment', amount: 45, type: 'expense' },
  { id: '70', date: '2025-11-19', description: 'EBAY - PAYPAL XFER', category: 'Retail / Shopping', amount: 118.07, type: 'expense' },
  { id: '71', date: '2025-11-18', description: 'T-MOBILE PCS SVC', category: 'Housing & Utilities', amount: 107.98, type: 'expense' },
  { id: '72', date: '2025-11-17', description: 'CASH APP - MEDICAL', category: 'Medical / Charitable', amount: 175, type: 'expense' },
  { id: '73', date: '2025-11-17', description: 'USAA FSB ICPAYMENT', category: 'Insurance & Auto', amount: 334.75, type: 'expense' },
  { id: '74', date: '2025-11-12', description: 'ATT PAYMENT', category: 'Housing & Utilities', amount: 151.46, type: 'expense' },
  { id: '75', date: '2025-11-10', description: 'CHECK 159 - KROGER', category: 'Groceries & Household', amount: 400, type: 'expense' },
  { id: '76', date: '2025-11-04', description: 'Zelle Haircut', category: 'Family / Kids / Personal', amount: 40, type: 'expense' },
  { id: '77', date: '2025-11-03', description: 'VENMO PAYMENT', category: 'Family / Kids / Personal', amount: 1244.43, type: 'expense' },
  { id: '78', date: '2025-11-03', description: 'Comenity Cap Bnk', category: 'Savings / Emergency Fund', amount: 325, type: 'expense' },
  { id: '79', date: '2025-11-26', description: 'IGS ENERGY SCANA', category: 'Housing & Utilities', amount: 60.1, type: 'expense' },
  { id: '80', date: '2025-11-20', description: 'KITTYPOOCLUB.COM', category: 'Groceries & Household', amount: 31.24, type: 'expense' },
  { id: '81', date: '2025-11-19', description: 'CANVA SUBSCRIPTION', category: 'Housing & Utilities', amount: 15, type: 'expense' },
  { id: '82', date: '2025-11-18', description: 'COBB EMC EBILL', category: 'Housing & Utilities', amount: 184.00, type: 'expense' },
  { id: '83', date: '2025-11-17', description: 'Zelle to Lilli', category: 'Family / Kids / Personal', amount: 250, type: 'expense' },
  { id: '84', date: '2025-11-13', description: 'Netflix.com', category: 'Housing & Utilities', amount: 24.99, type: 'expense' },
  { id: '85', date: '2025-11-12', description: 'US FITNESS GYM', category: 'Retail / Shopping', amount: 29.99, type: 'expense' },
  { id: '86', date: '2025-11-10', description: 'ATT BILL PAYMENT', category: 'Housing & Utilities', amount: 328.86, type: 'expense' },
  { id: '87', date: '2025-11-07', description: 'STATE FARM INSURANCE', category: 'Insurance & Auto', amount: 171.53, type: 'expense' },
  { id: '88', date: '2025-11-05', description: 'UNITED OF OMAHA INS', category: 'Medical / Charitable', amount: 19.38, type: 'expense' },
  { id: '89', date: '2025-11-05', description: 'WF HOME MTG AUTO PAY', category: 'Housing & Utilities', amount: 2564.65, type: 'expense' },
  { id: '90', date: '2025-11-03', description: 'GLENVIEW ARNO CREDIT', category: 'Housing & Utilities', amount: -353.5, type: 'expense' },
  { id: '91', date: '2025-11-01', description: 'THE FRESH MARKET', category: 'Groceries & Household', amount: 38.08, type: 'expense' },
  { id: '92', date: '2025-11-02', description: 'OPENAI CHATGPT', category: 'Housing & Utilities', amount: 20, type: 'expense' },
  { id: 'income-1', date: '2025-11-01', description: 'Monthly Salary - Zach', category: 'Income', amount: 9500, type: 'income' },
];

export const saveState = (state: BudgetState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadState = (): BudgetState => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return {
      transactions: SEED_TRANSACTIONS,
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
