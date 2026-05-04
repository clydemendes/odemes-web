# Odemes Web — Project Specification

**Purpose:** Full web port of the Odemes iOS personal finance app  
**Backend:** Supabase (PostgreSQL + Auth + Realtime)  
**Auth:** Google OAuth + Email/Password  
**Date:** 2026-04-26

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Project Structure](#2-project-structure)
3. [Supabase Setup](#3-supabase-setup)
4. [Database Schema (SQL)](#4-database-schema-sql)
5. [Row Level Security Policies](#5-row-level-security-policies)
6. [Authentication](#6-authentication)
7. [Routes & Pages](#7-routes--pages)
8. [Core Features — Implementation Notes](#8-core-features--implementation-notes)
9. [Component Library](#9-component-library)
10. [Design System (CSS Tokens)](#10-design-system-css-tokens)
11. [Environment Variables](#11-environment-variables)
12. [Launch Checklist](#12-launch-checklist)

---

## 1. Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | **Next.js 15 (App Router)** | File-based routing, server components, API routes |
| Styling | **Tailwind CSS v4** | Utility-first, easy to match iOS design tokens |
| UI Components | **shadcn/ui** | Accessible, unstyled-first, matches Odemes aesthetic |
| Backend / DB | **Supabase** | Postgres, auth, realtime, storage — all-in-one |
| Auth | **Supabase Auth** | Google OAuth + Email/Password built-in |
| Charts | **Recharts** | Declarative, responsive, works well with React |
| Forms | **React Hook Form + Zod** | Validation parity with iOS input guards |
| Date handling | **date-fns** | Lightweight, matches iOS DateExtensions logic |
| State | **Zustand** | Lightweight global state (currency, theme, user prefs) |
| Language (i18n) | **next-intl** | Matches iOS multi-language support |
| Deployment | **Vercel** | Zero-config Next.js hosting |

---

## 2. Project Structure

```
odemes-web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          ← Sign in (Google + Email)
│   │   └── signup/
│   │       └── page.tsx          ← Sign up (Email)
│   ├── (app)/                    ← Protected routes (require auth)
│   │   ├── layout.tsx            ← Shell: sidebar/topbar + bottom nav
│   │   ├── home/
│   │   │   └── page.tsx          ← Transaction entry
│   │   ├── transactions/
│   │   │   └── page.tsx          ← History, search, filter
│   │   ├── recurring/
│   │   │   └── page.tsx          ← Recurring transactions
│   │   ├── report/
│   │   │   └── page.tsx          ← Financial report + grade
│   │   └── settings/
│   │       └── page.tsx          ← User preferences
│   ├── setup/
│   │   └── page.tsx              ← Onboarding (currency + language)
│   ├── layout.tsx                ← Root layout (theme provider, fonts)
│   └── page.tsx                  ← Landing page (redirects if authed)
│
├── components/
│   ├── ui/                       ← shadcn/ui base components
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── GoogleButton.tsx
│   ├── transactions/
│   │   ├── TransactionForm.tsx   ← Entry form (replaces numpad)
│   │   ├── TransactionRow.tsx
│   │   ├── TransactionList.tsx
│   │   ├── TransactionEditModal.tsx
│   │   └── PeriodPicker.tsx
│   ├── recurring/
│   │   ├── RecurringRow.tsx
│   │   ├── RecurringForm.tsx
│   │   └── RecurringSummaryCard.tsx
│   ├── report/
│   │   ├── GradeCard.tsx
│   │   ├── SpendingChart.tsx
│   │   ├── InsightCard.tsx
│   │   └── CategoryBreakdown.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx           ← Desktop nav
│   │   ├── BottomNav.tsx         ← Mobile nav
│   │   ├── TopBar.tsx
│   │   └── ThemeToggle.tsx
│   └── shared/
│       ├── AmountInput.tsx       ← Formatted currency input
│       ├── CategoryPicker.tsx
│       ├── CurrencySelector.tsx
│       ├── LanguageSelector.tsx
│       └── SummaryCard.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             ← Browser Supabase client
│   │   ├── server.ts             ← Server-side Supabase client
│   │   └── middleware.ts         ← Auth session refresh
│   ├── hooks/
│   │   ├── useTransactions.ts
│   │   ├── useRecurring.ts
│   │   ├── useFinancialReport.ts
│   │   └── useUser.ts
│   ├── store/
│   │   └── useAppStore.ts        ← Zustand: theme, currency, language
│   ├── utils/
│   │   ├── currency.ts           ← Format amounts with symbol
│   │   ├── dates.ts              ← Period helpers (startOfMonth etc.)
│   │   ├── financialGrade.ts     ← Grade A–F calculation logic
│   │   └── categories.ts        ← Expense/income category map
│   └── types.ts                  ← Shared TypeScript types
│
├── middleware.ts                  ← Protect (app) routes, redirect to login
├── .env.local                     ← Supabase keys (never commit)
└── tailwind.config.ts
```

---

## 3. Supabase Setup

### Step 1 — Create project
1. Go to [supabase.com](https://supabase.com) → New project
2. Choose a region close to your users
3. Save the **Project URL** and **anon key**

### Step 2 — Enable Auth providers

In Supabase Dashboard → **Authentication → Providers**:

**Email:**
- Enable Email provider
- Enable "Confirm email" (recommended)
- Optional: enable "Email OTP" for magic link

**Google:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
4. Copy **Client ID** and **Client Secret** into Supabase → Auth → Providers → Google

### Step 3 — Run the schema SQL
Copy all SQL from Section 4 into Supabase → **SQL Editor → New query** → Run.

### Step 4 — Enable Realtime (optional)
Supabase Dashboard → **Database → Replication** → enable `transactions` and `recurring_transactions` tables for live updates across tabs.

---

## 4. Database Schema (SQL)

Run this in Supabase SQL Editor:

```sql
-- ─────────────────────────────────────────
-- USER PROFILES
-- Extends Supabase auth.users with app prefs
-- ─────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  currency    text not null default 'USD',
  language    text not null default 'en',
  dark_mode   boolean not null default false,
  haptics     boolean not null default true,
  notifications_enabled boolean not null default false,
  income_reminders      boolean not null default false,
  reminder_time         time default '09:00:00',
  daily_reminder_count  integer default 2,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create profile row when user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ─────────────────────────────────────────
-- TRANSACTIONS
-- ─────────────────────────────────────────
create table public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  amount      numeric(12, 2) not null check (amount > 0),
  type        text not null check (type in ('income', 'expense')),
  category    text not null,
  note        text,
  date        date not null default current_date,
  currency    text not null default 'USD',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index on public.transactions (user_id, date desc);
create index on public.transactions (user_id, type);


-- ─────────────────────────────────────────
-- RECURRING TRANSACTIONS
-- ─────────────────────────────────────────
create table public.recurring_transactions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  amount              numeric(12, 2) not null check (amount > 0),
  type                text not null check (type in ('income', 'expense')),
  category            text not null,
  note                text,
  frequency           text not null check (frequency in ('monthly', 'yearly')),
  next_due_date       date not null,
  is_active           boolean not null default true,
  last_processed_date date,
  currency            text not null default 'USD',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index on public.recurring_transactions (user_id, next_due_date);


-- ─────────────────────────────────────────
-- Auto-update updated_at on all tables
-- ─────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger set_updated_at_transactions
  before update on public.transactions
  for each row execute procedure public.set_updated_at();

create trigger set_updated_at_recurring
  before update on public.recurring_transactions
  for each row execute procedure public.set_updated_at();
```

---

## 5. Row Level Security Policies

Users must only access their own data. Run this in SQL Editor:

```sql
-- PROFILES
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);


-- TRANSACTIONS
alter table public.transactions enable row level security;

create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);


-- RECURRING TRANSACTIONS
alter table public.recurring_transactions enable row level security;

create policy "Users can view own recurring"
  on public.recurring_transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own recurring"
  on public.recurring_transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own recurring"
  on public.recurring_transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own recurring"
  on public.recurring_transactions for delete
  using (auth.uid() = user_id);
```

---

## 6. Authentication

### Flow

```
/login
  ├── [Sign in with Google]  → Supabase OAuth → callback → /home
  ├── [Email + Password]     → Supabase signInWithPassword → /home
  └── [No account? Sign up] → /signup

/signup
  ├── [Email + Password]     → Supabase signUp → confirm email → /setup
  └── [Sign in with Google]  → same as login flow → /setup (if new user)

/setup  (runs once, sets currency + language in profiles table)
  └── → /home

middleware.ts
  └── All /(app)/* routes: if no session → redirect /login
      /login and /signup: if session exists → redirect /home
```

### Supabase client setup

```ts
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

```ts
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

```ts
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: (c) => c.forEach(({ name, value, options }) => response.cookies.set(name, value, options)) } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const protectedPaths = ['/home', '/transactions', '/recurring', '/report', '/settings']
  const isProtected = protectedPaths.some(p => pathname.startsWith(p))

  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (user && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

### Login page key code

```tsx
// app/(auth)/login/page.tsx  — key snippets

// Google Sign In
const handleGoogle = async () => {
  const supabase = createClient()
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${origin}/auth/callback` },
  })
}

// Email Sign In
const handleEmail = async (email: string, password: string) => {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) setError(error.message)
  else router.push('/home')
}
```

```tsx
// app/(auth)/signup/page.tsx — key snippets
const handleSignup = async (email: string, password: string) => {
  const supabase = createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  })
  if (error) setError(error.message)
  else router.push('/setup')  // new users go to onboarding
}
```

```ts
// app/auth/callback/route.ts  — OAuth redirect handler
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
    // Redirect new Google users to setup, existing to home
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('profiles')
      .select('currency')
      .eq('id', user!.id)
      .single()
    const isNew = !profile?.currency || profile.currency === 'USD' // first time
    return NextResponse.redirect(new URL(isNew ? '/setup' : '/home', origin))
  }
  return NextResponse.redirect(new URL('/login', origin))
}
```

---

## 7. Routes & Pages

| Route | Page | Auth Required | Notes |
|-------|------|--------------|-------|
| `/` | Landing | No | Redirect to `/home` if already authed |
| `/login` | Sign In | No | Google + Email/Password |
| `/signup` | Sign Up | No | Email/Password + Google |
| `/setup` | Onboarding | Yes (new users) | Currency + language selection |
| `/home` | Transaction Entry | Yes | Main entry screen |
| `/transactions` | History | Yes | List, search, filter, edit |
| `/recurring` | Recurring | Yes | CRUD recurring transactions |
| `/report` | Financial Report | Yes | Grade, charts, insights |
| `/settings` | Settings | Yes | Preferences + data management |
| `/auth/callback` | — | — | Supabase OAuth redirect handler |

---

## 8. Core Features — Implementation Notes

### 8.1 Transaction Entry (`/home`)

**What it does:** Add income or expense transactions quickly.

**Web adaptation (no numpad):**
- Use a styled `<input type="number">` or a text input with currency formatting
- Format the value with the user's currency symbol as they type
- `AmountInput` component: accepts numeric string, displays formatted, strips symbols on submit

**Form fields:**
- Amount — required, number > 0
- Type — radio/toggle: Income / Expense (color switches: green / red)
- Category — text input with autocomplete dropdown (queries distinct categories from user's past transactions in Supabase)
- Note — optional text input
- Date — date picker, defaults to today

**Supabase call:**
```ts
const { error } = await supabase
  .from('transactions')
  .insert({
    user_id: user.id,
    amount,
    type,        // 'income' | 'expense'
    category,
    note,
    date,
    currency: userProfile.currency,
  })
```

**Balance display:**
- Query sum of all transactions for today's date
- `SELECT sum(CASE WHEN type='income' THEN amount ELSE -amount END) FROM transactions WHERE user_id = ? AND date = today`
- Or use a Supabase RPC function for this

---

### 8.2 Transactions History (`/transactions`)

**Filters:**
- Period: Day / Week / Month / Year / Overall (segmented control)
- Type: All / Income / Expense (pills)
- Search: free-text filter on `category` column (client-side after fetch, or use `.ilike()`)
- Date navigation: prev/next arrows, updates the date range

**Supabase query pattern:**
```ts
let query = supabase
  .from('transactions')
  .select('*')
  .eq('user_id', user.id)
  .gte('date', periodStart)
  .lte('date', periodEnd)
  .order('date', { ascending: false })

if (typeFilter !== 'all') query = query.eq('type', typeFilter)
if (searchTerm) query = query.ilike('category', `%${searchTerm}%`)
```

**Summary card values:** computed client-side from fetched rows:
```ts
const income   = rows.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
const expenses = rows.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
const net      = income - expenses
```

**Edit transaction:** clicking a row opens `TransactionEditModal` (shadcn Dialog).  
On save: `supabase.from('transactions').update({...}).eq('id', id).eq('user_id', user.id)`  
On delete: `supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id)`

---

### 8.3 Recurring Transactions (`/recurring`)

**Logic mirrors iOS RecurringTransaction:**

- `next_due_date` advances on "Confirm Payment"
- "Confirm Payment" button: creates a real transaction from the recurring template, then advances `next_due_date`

```ts
// Confirm payment handler
const confirmPayment = async (recurring: RecurringTransaction) => {
  // 1. Insert actual transaction
  await supabase.from('transactions').insert({
    user_id: user.id,
    amount: recurring.amount,
    type: recurring.type,
    category: recurring.category,
    note: recurring.note,
    date: new Date().toISOString().split('T')[0],
    currency: recurring.currency,
  })

  // 2. Advance next_due_date
  const nextDate = recurring.frequency === 'monthly'
    ? addMonths(new Date(recurring.next_due_date), 1)
    : addYears(new Date(recurring.next_due_date), 1)

  await supabase
    .from('recurring_transactions')
    .update({
      next_due_date: nextDate.toISOString().split('T')[0],
      last_processed_date: new Date().toISOString().split('T')[0],
    })
    .eq('id', recurring.id)
}
```

**Due badge logic:**
```ts
const getDueBadge = (nextDueDate: string) => {
  const days = differenceInCalendarDays(new Date(nextDueDate), new Date())
  if (days <= 0) return { label: 'Due Today', color: 'red' }
  if (days <= 7)  return { label: `In ${days}d`, color: 'orange' }
  return null
}
```

---

### 8.4 Financial Report (`/report`)

**Grade calculation (port from iOS `FinancialAnalysisService`):**

```ts
// lib/utils/financialGrade.ts
export function calculateGrade(income: number, expenses: number): {
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  score: number
} {
  if (income === 0) return { grade: 'F', score: 0 }
  const savingsRate = (income - expenses) / income  // 0..1
  const score = Math.round(savingsRate * 100)
  if (savingsRate >= 0.5) return { grade: 'A', score }
  if (savingsRate >= 0.35) return { grade: 'B', score }
  if (savingsRate >= 0.2)  return { grade: 'C', score }
  if (savingsRate >= 0.05) return { grade: 'D', score }
  return { grade: 'F', score: Math.max(0, score) }
}
```

**Category breakdown query:**
```ts
// Supabase RPC or client-side aggregation
const categoryBreakdown = transactions
  .filter(t => t.type === 'expense')
  .reduce((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + t.amount
    return acc
  }, {} as Record<string, number>)
```

**Charts:** Use Recharts `PieChart` (donut) for category breakdown, `BarChart` for monthly trend.

**Insights examples:**
- If a category is >20% above the previous period average → "⚠️ {category} spending is {X}% above your average"
- If savings rate improved → "🎉 Savings rate improved by {X}% vs last month"
- If no income recorded → "💡 Add income transactions to see your financial grade"

---

### 8.5 Settings (`/settings`)

All preferences live in the `profiles` table. Save on change (or on a "Save" button).

```ts
const updateProfile = async (updates: Partial<Profile>) => {
  await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
}
```

**Currency change:** updates `profiles.currency`; all amount displays re-format client-side using the new symbol (no conversion — same as iOS app).

**Dark mode:** stored in `profiles.dark_mode` + local Zustand store; apply via `data-theme` attribute on `<html>`.

**Export transactions:** generate a CSV from all user transactions and trigger a browser download:
```ts
const exportCSV = (rows: Transaction[]) => {
  const header = 'date,type,category,amount,note,currency'
  const lines = rows.map(r =>
    `${r.date},${r.type},${r.category},${r.amount},"${r.note ?? ''}",${r.currency}`
  )
  const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `odemes-export-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
}
```

**Import transactions:** accept a CSV file upload, parse rows, bulk insert:
```ts
await supabase.from('transactions').insert(parsedRows.map(r => ({ ...r, user_id: user.id })))
```

**Delete all data:**
```ts
await supabase.from('transactions').delete().eq('user_id', user.id)
await supabase.from('recurring_transactions').delete().eq('user_id', user.id)
```
Always show a confirmation dialog before this action.

**Sign out:**
```ts
await supabase.auth.signOut()
router.push('/login')
```

---

### 8.6 Category Autocomplete

Replaces the iOS tag autocomplete system. Query distinct categories from the user's own transaction history:

```ts
// Fetch all unique categories used by this user (for autocomplete)
const { data } = await supabase
  .from('transactions')
  .select('category')
  .eq('user_id', user.id)

const uniqueCategories = [...new Set(data?.map(r => r.category) ?? [])]
```

Filter client-side as the user types. No predefined category list is required — the system learns from the user's own entries, exactly like iOS.

---

### 8.7 Multi-Currency

- The user's selected currency is stored in `profiles.currency`
- All transactions store their currency at the time of creation in `transactions.currency`
- No conversion logic needed — amounts are stored as-entered
- `formatAmount(amount, currency)` utility formats display strings using `Intl.NumberFormat`

```ts
// lib/utils/currency.ts
export function formatAmount(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(amount)
}
```

---

## 9. Component Library

### `AmountInput`
```
Props: value, onChange, currency, type ('income'|'expense')
- Displays formatted amount with currency symbol as prefix/suffix
- Border color switches: green (income) / red (expense)
- On change: strips non-numeric chars before calling onChange
```

### `TransactionForm`
```
Props: onSubmit, defaultValues?, mode ('add'|'edit')
Fields: amount, type toggle, category (autocomplete), note, date picker
- No numpad — standard keyboard input
- Submit disabled until amount > 0 and category filled
```

### `PeriodPicker`
```
Props: period, onChange
Values: 'day' | 'week' | 'month' | 'year' | 'overall'
- Segmented tabs on desktop, horizontal scroll on mobile
```

### `DateNavigator`
```
Props: period, currentDate, onChange
- Shows label: "Today", "This Week", "April 2025" etc.
- Prev / Next arrows advance by the current period unit
```

### `SummaryCard`
```
Props: income, expenses, net, currency
- Three columns with dividers
- Income = green, Expenses = red, Net = color by sign
```

### `GradeCard`
```
Props: grade, score
- Large letter grade (A/B/C/D/F) with color:
  A=green, B=teal, C=yellow, D=orange, F=red
- Score shown below grade
```

### `RecurringRow`
```
Props: recurring, onEdit, onDelete, onConfirmPayment
- Shows: category, frequency badge, amount, next due date
- Due badge: red "Due Today" | orange "In Xd" | nothing
- Confirm Payment button (edit mode only)
```

### `CategoryPicker`
```
Props: value, onChange, userId
- Combobox (shadcn) with search
- Options: user's historical categories + free-text entry
```

---

## 10. Design System (CSS Tokens)

Add to `app/globals.css`:

```css
:root {
  --color-bg:             #FAF9F6;
  --color-bg-secondary:   #F0EDE8;
  --color-text:           #1A1A1A;
  --color-text-secondary: #5C5C5C;
  --color-text-tertiary:  #9E9E9E;
  --color-income:         #2E7D32;
  --color-expense:        #C62828;
  --color-accent:         #F4622A;
  --color-accent-teal:    #00ACC1;
  --color-border:         rgba(0,0,0,0.08);
  --color-glass:          rgba(255,255,255,0.2);

  --font-mono:   'Google Sans Code', ui-monospace, monospace;

  --space-xs:    4px;
  --space-s:     8px;
  --space-m:     16px;
  --space-l:     24px;
  --space-xl:    32px;
  --space-xxl:   48px;

  --radius-s:    8px;
  --radius-m:    12px;
  --radius-l:    16px;
  --radius-xl:   20px;
  --radius-xxl:  25px;
}

[data-theme='dark'] {
  --color-bg:             #1A1A1A;
  --color-bg-secondary:   #2C2C2C;
  --color-text:           #F5F5F5;
  --color-text-secondary: #BDBDBD;
  --color-text-tertiary:  #757575;
  --color-income:         #4CAF50;
  --color-expense:        #EF5350;
  --color-accent:         #FF7043;
  --color-accent-teal:    #4DD0E1;
  --color-border:         rgba(255,255,255,0.08);
}
```

---

## 11. Environment Variables

Create `.env.local` in the project root (never commit this file):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Only needed for server-side admin operations (optional)
# SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Add both `NEXT_PUBLIC_*` variables to **Vercel → Project → Settings → Environment Variables** when deploying.

---

## 12. Launch Checklist

### Setup
- [ ] Create Supabase project and note URL + anon key
- [ ] Enable Google OAuth in Supabase Auth (set up Google Cloud credentials)
- [ ] Enable Email provider in Supabase Auth
- [ ] Run full SQL schema (Section 4) in Supabase SQL Editor
- [ ] Run RLS policies (Section 5)
- [ ] Create Next.js project: `npx create-next-app@latest odemes-web --typescript --tailwind --app`
- [ ] Install deps: `npm install @supabase/ssr @supabase/supabase-js zustand react-hook-form zod date-fns recharts next-intl`
- [ ] Install shadcn: `npx shadcn@latest init`
- [ ] Add shadcn components: `button input label dialog select tabs badge`
- [ ] Set up `.env.local` with Supabase keys

### Auth
- [ ] `/login` page with Google button + email/password form
- [ ] `/signup` page with email/password form + Google button
- [ ] `/auth/callback` route handler
- [ ] `middleware.ts` protecting all `/(app)/*` routes
- [ ] Supabase `handle_new_user` trigger creates profile row on signup

### Core pages
- [ ] `/setup` — currency + language onboarding (runs once)
- [ ] `/home` — transaction entry form (amount, type, category, note, date)
- [ ] `/transactions` — list with period picker, date nav, summary card, edit modal
- [ ] `/recurring` — list with due badges, add/edit form, confirm payment button
- [ ] `/report` — grade card, spending chart, insights, category breakdown
- [ ] `/settings` — all toggles, currency picker, export/import, delete data, sign out

### Layout
- [ ] Sidebar nav (desktop ≥ 768px)
- [ ] Bottom nav bar (mobile < 768px)
- [ ] Dark mode toggle wired to `profiles.dark_mode` + `data-theme` on `<html>`
- [ ] Currency symbol shown everywhere (from `profiles.currency`)

### Data
- [ ] All Supabase queries include `.eq('user_id', user.id)` (RLS is a safety net, not the only guard)
- [ ] Export as CSV working
- [ ] Import from CSV working with duplicate skipping
- [ ] Delete all data with confirmation dialog

### Quality
- [ ] All forms validated with Zod schemas
- [ ] Error states shown on failed Supabase calls
- [ ] Loading skeletons on all data-fetching views
- [ ] Empty states on transactions list and recurring list
- [ ] Responsive layout tested at 375px (mobile), 768px (tablet), 1280px (desktop)

### Deploy
- [ ] Push to GitHub
- [ ] Connect repo to Vercel
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel env vars
- [ ] Add Vercel deployment URL to Supabase → Auth → URL Configuration → Site URL
- [ ] Add `https://your-vercel-domain.vercel.app/auth/callback` to Supabase → Auth → Redirect URLs
- [ ] Add same callback URL to Google OAuth → Authorized redirect URIs
