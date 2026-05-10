// Mock data for the Odemes prototype.
const today = new Date(2026, 3, 26); // April 26, 2026
const dayKey = (offset) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};
const fmtDate = (s) => {
  const d = new Date(s);
  const lang = window._i18nLang || 'en';
  const locale = lang === 'pt' ? 'pt-PT' : lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : 'en-US';
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
};
const relDate = (s) => {
  const d = new Date(s);
  const diff = Math.round((d - today) / 86400000);
  const lang = window._i18nLang || 'en';
  const dates = (window.I18n?.TRANSLATIONS?.[lang]?.dates) || (window.I18n?.TRANSLATIONS?.en?.dates) || {};
  if (diff === 0) return dates.today || 'Today';
  if (diff === -1) return dates.yesterday || 'Yesterday';
  if (diff === 1) return dates.tomorrow || 'Tomorrow';
  if (diff > 1 && diff <= 7) return `In ${diff}d`;
  if (diff < -1 && diff >= -7) return `${-diff}d ago`;
  return fmtDate(s);
};

const TRANSACTIONS = [
  { id: 't1',  date: dayKey(0),   type: 'expense', category: 'Coffee',       note: 'Blue Bottle', amount: 6.50 },
  { id: 't2',  date: dayKey(0),   type: 'expense', category: 'Groceries',    note: 'Whole Foods', amount: 84.20 },
  { id: 't3',  date: dayKey(0),   type: 'income',  category: 'Freelance',    note: 'Client Aug',  amount: 1200 },
  { id: 't4',  date: dayKey(-1),  type: 'expense', category: 'Transport',    note: 'Uber',        amount: 14.80 },
  { id: 't5',  date: dayKey(-1),  type: 'expense', category: 'Dining',       note: 'Fawn',        amount: 62.40 },
  { id: 't6',  date: dayKey(-2),  type: 'expense', category: 'Subscriptions',note: 'Spotify',     amount: 11.99 },
  { id: 't7',  date: dayKey(-2),  type: 'income',  category: 'Salary',       note: 'April pay',   amount: 4250 },
  { id: 't8',  date: dayKey(-3),  type: 'expense', category: 'Groceries',    note: 'Trader Joes', amount: 47.10 },
  { id: 't9',  date: dayKey(-4),  type: 'expense', category: 'Health',       note: 'Pharmacy',    amount: 22.30 },
  { id: 't10', date: dayKey(-5),  type: 'expense', category: 'Dining',       note: 'Lunch',       amount: 18.90 },
  { id: 't11', date: dayKey(-6),  type: 'expense', category: 'Coffee',       note: 'Verve',       amount: 5.75 },
  { id: 't12', date: dayKey(-7),  type: 'expense', category: 'Entertainment',note: 'Cinema',      amount: 28.00 },
  { id: 't13', date: dayKey(-8),  type: 'expense', category: 'Rent',         note: 'April rent',  amount: 1850 },
  { id: 't14', date: dayKey(-9),  type: 'expense', category: 'Utilities',    note: 'Electric',    amount: 78.40 },
  { id: 't15', date: dayKey(-10), type: 'income',  category: 'Dividend',     note: 'VTSAX',       amount: 142.50 },
  { id: 't16', date: dayKey(-11), type: 'expense', category: 'Groceries',    note: 'Costco',      amount: 168.30 },
  { id: 't17', date: dayKey(-12), type: 'expense', category: 'Transport',    note: 'Gas',         amount: 52.10 },
  { id: 't18', date: dayKey(-14), type: 'expense', category: 'Coffee',       note: '',            amount: 4.25 },
  { id: 't19', date: dayKey(-16), type: 'expense', category: 'Dining',       note: 'Brunch',      amount: 38.60 },
  { id: 't20', date: dayKey(-18), type: 'expense', category: 'Subscriptions',note: 'Netflix',     amount: 15.49 },
];

const RECURRING = [
  { id: 'r1', category: 'Rent',         note: 'Monthly rent',   amount: 1850, type: 'expense', is_recurring: true, recurring_pattern: 'monthly', date: dayKey(0)  },
  { id: 'r2', category: 'Salary',       note: 'Direct deposit', amount: 4250, type: 'income',  is_recurring: true, recurring_pattern: 'monthly', date: dayKey(4)  },
  { id: 'r3', category: 'Spotify',      note: 'Family plan',    amount: 16.99,type: 'expense', is_recurring: true, recurring_pattern: 'monthly', date: dayKey(6)  },
  { id: 'r4', category: 'Netflix',      note: 'Standard',       amount: 15.49,type: 'expense', is_recurring: true, recurring_pattern: 'monthly', date: dayKey(12) },
  { id: 'r5', category: 'Gym',          note: 'Equinox',        amount: 240,  type: 'expense', is_recurring: true, recurring_pattern: 'monthly', date: dayKey(18) },
  { id: 'r6', category: 'Insurance',    note: 'Renters annual', amount: 320,  type: 'expense', is_recurring: true, recurring_pattern: 'yearly',  date: dayKey(45) },
];

const CATEGORIES_EXP = ['Groceries','Dining','Coffee','Transport','Rent','Utilities','Subscriptions','Entertainment','Health','Shopping','Travel'];
const CATEGORIES_INC = ['Salary','Freelance','Dividend','Refund','Gift'];

// 6-month spending series for report chart
const SPEND_SERIES = [
  { month: 'Nov', income: 4392, expenses: 3120 },
  { month: 'Dec', income: 4250, expenses: 3680 },
  { month: 'Jan', income: 4250, expenses: 2940 },
  { month: 'Feb', income: 4480, expenses: 2810 },
  { month: 'Mar', income: 4250, expenses: 3240 },
  { month: 'Apr', income: 5450, expenses: 2650 },
];

window.OdemesData = { TRANSACTIONS, RECURRING, CATEGORIES_EXP, CATEGORIES_INC, SPEND_SERIES, today, dayKey, fmtDate, relDate };
