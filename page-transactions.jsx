// /transactions
const { Icons: TxI } = window;
const { TRANSACTIONS: TX_ALL, fmtDate: tfd, relDate: trd } = window.OdemesData;

function PageTransactions() {
  const { t } = window.I18n.useT();
  const [period, setPeriod] = React.useState('month');
  const [filter, setFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [editing, setEditing] = React.useState(null);

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
          <button className="btn btn-primary"><TxI.plus size={14} /> {t('transactions.add')}</button>
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
                <button key={row.id} onClick={() => setEditing(row)}
                  style={{
                    display: 'grid', gridTemplateColumns: '32px 1fr 100px auto', gap: 14, alignItems: 'center',
                    width: '100%', padding: '12px 20px',
                    borderBottom: '1px solid var(--border-soft)',
                    background: 'transparent', textAlign: 'left',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-warm)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
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
                </button>
              ))}
            </div>
          );
        })}
      </div>

      {editing && (
        <div onClick={() => setEditing(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'grid', placeItems: 'center', zIndex: 200,
        }}>
          <div onClick={e => e.stopPropagation()} className="card" style={{ width: 420, boxShadow: 'var(--shadow-deep)' }}>
            <div className="card-head">
              <div className="card-title">{t('transactions.editTitle')}</div>
              <button className="icon-btn" onClick={() => setEditing(null)}><TxI.x size={14} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label className="label">{t('transactions.amount')}</label><input className="input mono" defaultValue={editing.amount.toFixed(2)} /></div>
              <div><label className="label">{t('transactions.category')}</label><input className="input" defaultValue={editing.category} /></div>
              <div><label className="label">{t('transactions.note')}</label><input className="input" defaultValue={editing.note} /></div>
              <div><label className="label">{t('transactions.date')}</label><input className="input mono" defaultValue={editing.date} /></div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button className="btn btn-danger"><TxI.trash size={14} /> {t('transactions.delete')}</button>
                <div style={{ flex: 1 }} />
                <button className="btn btn-secondary" onClick={() => setEditing(null)}>{t('transactions.cancel')}</button>
                <button className="btn btn-primary" onClick={() => setEditing(null)}>{t('transactions.save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.PageTransactions = PageTransactions;
