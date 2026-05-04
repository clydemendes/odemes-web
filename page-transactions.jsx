// /transactions
const { Icons: TxI } = window;
const {
  TRANSACTIONS: TX_ALL,
  CATEGORIES_EXP: TX_CE,
  CATEGORIES_INC: TX_CI,
  fmtDate: tfd,
  relDate: trd,
  today: txToday,
} = window.OdemesData;

function PageTransactions({ txQuickAdd = { seq: 0, kind: 'expense' } }) {
  const { t } = window.I18n.useT();
  const [period, setPeriod] = React.useState('month');
  const [filter, setFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [editing, setEditing] = React.useState(null);
  const [adding, setAdding] = React.useState(false);
  const [addType, setAddType] = React.useState('expense');
  const [addAmount, setAddAmount] = React.useState('');
  const [addCategory, setAddCategory] = React.useState('Groceries');
  const [addNote, setAddNote] = React.useState('');
  const [addDate, setAddDate] = React.useState(() => txToday.toISOString().slice(0, 10));

  React.useEffect(() => {
    if (txQuickAdd.seq <= 0) return;
    setEditing(null);
    setAdding(true);
    setAddType(txQuickAdd.kind);
    setAddAmount('');
    setAddNote('');
    setAddDate(txToday.toISOString().slice(0, 10));
    const list = txQuickAdd.kind === 'expense' ? TX_CE : TX_CI;
    setAddCategory(list[0] || '');
  }, [txQuickAdd.seq]);

  function openAddDefaults(kind) {
    setEditing(null);
    setAdding(true);
    setAddType(kind);
    setAddAmount('');
    setAddNote('');
    setAddDate(txToday.toISOString().slice(0, 10));
    const list = kind === 'expense' ? TX_CE : TX_CI;
    setAddCategory(list[0] || '');
  }

  const rows = TX_ALL.filter(row => {
    if (filter !== 'all' && row.type !== filter) return false;
    if (search && !(row.category + ' ' + (row.note || '')).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const income   = rows.filter(row => row.type === 'income').reduce((s, row) => s + row.amount, 0);
  const expenses = rows.filter(row => row.type === 'expense').reduce((s, row) => s + row.amount, 0);
  const net = income - expenses;

  const groups = {};
  rows.forEach(row => { (groups[row.date] = groups[row.date] || []).push(row); });
  const dates = Object.keys(groups).sort((a,b) => b.localeCompare(a));

  const periods = [
    { id: 'day',     label: t('transactions.day') },
    { id: 'week',    label: t('transactions.week') },
    { id: 'month',   label: t('transactions.month') },
    { id: 'year',    label: t('transactions.year') },
    { id: 'overall', label: t('transactions.overall') },
  ];

  const filters = [
    { id: 'all',     label: t('transactions.all') },
    { id: 'income',  label: t('transactions.income2') },
    { id: 'expense', label: t('transactions.expense') },
  ];

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>{t('transactions.title')}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary"><TxI.download size={14} /> {t('transactions.exportCsv')}</button>
          <button type="button" className="btn btn-primary" onClick={() => openAddDefaults('expense')}>
            <TxI.plus size={14} /> {t('transactions.add')}
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="card" style={{ marginBottom: 16, padding: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div style={{ padding: 20, borderRight: '1px solid var(--border-soft)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('transactions.income')}</div>
            <div className="mono" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 6, color: 'var(--income)' }}>+${income.toFixed(2)}</div>
          </div>
          <div style={{ padding: 20, borderRight: '1px solid var(--border-soft)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('transactions.expenses')}</div>
            <div className="mono" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 6, color: 'var(--expense)' }}>−${expenses.toFixed(2)}</div>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('transactions.net')}</div>
            <div className="mono" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 6, color: net >= 0 ? 'var(--income)' : 'var(--expense)' }}>
              {net >= 0 ? '+' : '−'}${Math.abs(net).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="card" style={{ marginBottom: 16, padding: 14, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="seg">
          {periods.map(p => (
            <button key={p.id} onClick={() => setPeriod(p.id)} className={period === p.id ? 'active' : ''}>{p.label}</button>
          ))}
        </div>
        <button className="btn btn-ghost" style={{ padding: '6px 8px', color: 'var(--text-2)' }}><TxI.arrow_left size={14} /></button>
        <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>April 2026</span>
        <button className="btn btn-ghost" style={{ padding: '6px 8px', color: 'var(--text-2)' }}><TxI.arrow_right size={14} /></button>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', gap: 6 }}>
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={{
                padding: '6px 12px', borderRadius: 9999,
                background: filter === f.id ? 'var(--accent-tint)' : 'var(--bg-warm)',
                color: filter === f.id ? 'var(--accent-text)' : 'var(--text-2)',
                border: '1px solid ' + (filter === f.id ? 'transparent' : 'var(--border-soft)'),
                fontSize: 12, fontWeight: 600,
              }}>{f.label}</button>
          ))}
        </div>

        <div style={{ position: 'relative' }}>
          <TxI.search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input className="input" placeholder={t('transactions.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32, width: 240 }} />
        </div>
      </div>

      {/* List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {dates.map(d => {
          const list = groups[d];
          const dayTotal = list.reduce((s, row) => s + (row.type === 'income' ? row.amount : -row.amount), 0);
          return (
            <div key={d}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 20px', background: 'var(--bg-warm)',
                borderTop: '1px solid var(--border-soft)', borderBottom: '1px solid var(--border-soft)',
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {trd(d)} <span style={{ color: 'var(--text-3)', marginLeft: 6 }}>{tfd(d)}</span>
                </div>
                <div className="mono" style={{ fontSize: 12, fontWeight: 600, color: dayTotal >= 0 ? 'var(--income)' : 'var(--expense)' }}>
                  {dayTotal >= 0 ? '+' : '−'}${Math.abs(dayTotal).toFixed(2)}
                </div>
              </div>
              {list.map(row => (
                <div
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => { setAdding(false); setEditing(row); }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setAdding(false);
                      setEditing(row);
                    }
                  }}
                  style={{
                    display: 'grid', gridTemplateColumns: '32px 1fr 100px auto auto', gap: 14, alignItems: 'center',
                    width: '100%', padding: '12px 20px',
                    borderBottom: '1px solid var(--border-soft)',
                    background: 'transparent', textAlign: 'left', cursor: 'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-warm)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, display: 'grid', placeItems: 'center', background: row.type === 'income' ? 'var(--income-tint)' : 'var(--expense-tint)', color: row.type === 'income' ? 'var(--income)' : 'var(--expense)' }}>
                    {row.type === 'income' ? <TxI.arrow_down size={14} /> : <TxI.arrow_up size={14} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{row.category}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{row.note || '—'}</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'capitalize' }}>
                    {row.type === 'income' ? t('transactions.typeIncome') : t('transactions.typeExpense')}
                  </div>
                  <div className="mono" style={{ fontSize: 14, fontWeight: 600, color: row.type === 'income' ? 'var(--income)' : 'var(--expense)' }}>
                    {row.type === 'income' ? '+' : '−'}${row.amount.toFixed(2)}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                    <button type="button" className="icon-btn" onClick={() => { setAdding(false); setEditing(row); }}><TxI.edit size={14} /></button>
                    <button type="button" className="icon-btn"><TxI.more size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {adding && (
        <div
          role="presentation"
          onClick={() => setAdding(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'grid', placeItems: 'center', zIndex: 200, padding: 16,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="txn-add-title"
            onClick={e => e.stopPropagation()}
            className="card"
            style={{ width: 'min(400px, 100%)', maxHeight: 'min(90vh, 640px)', overflow: 'auto', boxShadow: 'var(--shadow-deep)', padding: 18 }}
          >
            <div className="card-head" style={{ marginBottom: 10 }}>
              <div id="txn-add-title" className="card-title" style={{ fontSize: 16 }}>{t('home.newTransaction')}</div>
              <button type="button" className="icon-btn" onClick={() => setAdding(false)}><TxI.x size={14} /></button>
            </div>
            <div className="seg" style={{ width: '100%', marginBottom: 12 }}>
              <button
                type="button"
                onClick={() => { setAddType('expense'); setAddCategory(TX_CE[0]); }}
                className={addType === 'expense' ? 'active' : ''}
                style={{ flex: 1, color: addType === 'expense' ? 'var(--expense)' : undefined }}
              >{t('home.expense')}</button>
              <button
                type="button"
                onClick={() => { setAddType('income'); setAddCategory(TX_CI[0]); }}
                className={addType === 'income' ? 'active' : ''}
                style={{ flex: 1, color: addType === 'income' ? 'var(--income)' : undefined }}
              >{t('home.income')}</button>
            </div>
            <div style={{
              border: `1.5px solid ${addType === 'income' ? 'var(--income)' : 'var(--expense)'}`,
              borderRadius: 10, padding: '12px 14px',
              display: 'flex', alignItems: 'baseline', gap: 4,
              background: 'var(--bg)', marginBottom: 12,
            }}>
              <span className="mono" style={{ fontSize: 16, color: 'var(--text-3)', fontWeight: 500 }}>$</span>
              <input
                value={addAmount}
                onChange={e => setAddAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="0.00"
                className="mono"
                style={{
                  flex: 1, border: 0, outline: 'none', background: 'transparent',
                  fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em',
                  color: 'var(--text)', padding: 0,
                }}
              />
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>USD</span>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="label">{t('home.category')}</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(addType === 'expense' ? TX_CE : TX_CI).slice(0, 8).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAddCategory(c)}
                    style={{
                      padding: '5px 10px', borderRadius: 9999,
                      background: addCategory === c ? 'var(--accent-tint)' : 'var(--bg-warm)',
                      color: addCategory === c ? 'var(--accent-text)' : 'var(--text-2)',
                      border: '1px solid ' + (addCategory === c ? 'transparent' : 'var(--border-soft)'),
                      fontSize: 11, fontWeight: 600,
                    }}
                  >{c}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label className="label">{t('home.note')}</label>
                <input className="input" placeholder={t('home.optional')} value={addNote} onChange={e => setAddNote(e.target.value)} style={{ fontSize: 13 }} />
              </div>
              <div>
                <label className="label">{t('home.date')}</label>
                <input className="input mono" value={addDate} onChange={e => setAddDate(e.target.value)} style={{ fontSize: 13 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setAdding(false)}>{t('transactions.cancel')}</button>
              <button type="button" className="btn btn-primary" onClick={() => setAdding(false)}><TxI.check size={14} /> {t('home.save')}</button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div onClick={() => setEditing(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'grid', placeItems: 'center', zIndex: 200,
        }}>
          <div onClick={e => e.stopPropagation()} className="card" style={{ width: 420, boxShadow: 'var(--shadow-deep)' }}>
            <div className="card-head">
              <div className="card-title">{t('transactions.editTitle')}</div>
              <button type="button" className="icon-btn" onClick={() => setEditing(null)}><TxI.x size={14} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label className="label">{t('transactions.amount')}</label><input className="input mono" defaultValue={editing.amount.toFixed(2)} /></div>
              <div><label className="label">{t('transactions.category')}</label><input className="input" defaultValue={editing.category} /></div>
              <div><label className="label">{t('transactions.note')}</label><input className="input" defaultValue={editing.note} /></div>
              <div><label className="label">{t('transactions.date')}</label><input className="input mono" defaultValue={editing.date} /></div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button type="button" className="btn btn-danger"><TxI.trash size={14} /> {t('transactions.delete')}</button>
                <div style={{ flex: 1 }} />
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>{t('transactions.cancel')}</button>
                <button type="button" className="btn btn-primary" onClick={() => setEditing(null)}>{t('transactions.save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.PageTransactions = PageTransactions;
