// /transactions — live Supabase data
const { Icons: TxI } = window;
const { CATEGORIES_EXP: TX_CE, CATEGORIES_INC: TX_CI } = window.OdemesData;

function localDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function txRelDate(s) {
  if (!s) return '';
  const d = new Date(s + 'T00:00:00');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.round((d - today) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === -1) return 'Yesterday';
  if (diff < 0 && diff > -6) return `${-diff}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
function txFmtDate(s) {
  if (!s) return '';
  return new Date(s + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function PageTransactions({ txQuickAdd = { seq: 0, kind: 'expense' }, user, onCountChange }) {
  const { t } = window.I18n.useT();
  const [txData, setTxData]       = React.useState([]);
  const [loading, setLoading]     = React.useState(true);
  const [error, setError]         = React.useState(null);
  const [saving, setSaving]       = React.useState(false);
  const [period, setPeriod]       = React.useState('overall');
  const [filter, setFilter]       = React.useState('all');
  const [search, setSearch]       = React.useState('');
  const [editing, setEditing]     = React.useState(null);
  const [adding, setAdding]       = React.useState(false);
  const [addType, setAddType]     = React.useState('expense');
  const [addAmount, setAddAmount] = React.useState('');
  const [addCategory, setAddCategory] = React.useState(TX_CE[0] || '');
  const [addNote, setAddNote]     = React.useState('');
  const [addDate, setAddDate]     = React.useState(() => localDateString());
  const [editAmount, setEditAmount]   = React.useState('');
  const [editCategory, setEditCategory] = React.useState('');
  const [editNote, setEditNote]     = React.useState('');
  const [editDate, setEditDate]     = React.useState('');

  // Fetch transactions
  React.useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    window.sb
      .from('transactions')
      .select('*')
      .order('timestamp', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) { console.error('Fetch error:', err); setError(err.message); }
        else { setTxData(data || []); onCountChange && onCountChange((data || []).length); }
        setLoading(false);
      });
  }, [user]);

  // Populate edit fields when a row is selected
  React.useEffect(() => {
    if (!editing) return;
    setEditAmount(String(editing.amount ?? ''));
    setEditCategory(editing.category ?? '');
    setEditNote(editing.note ?? '');
    setEditDate(editing.date ?? new Date().toISOString().slice(0, 10));
  }, [editing]);

  // Quick-add trigger from top bar
  React.useEffect(() => {
    if (txQuickAdd.seq <= 0) return;
    openAdd(txQuickAdd.kind);
  }, [txQuickAdd.seq]);

  function openAdd(kind) {
    setEditing(null);
    setError(null);
    setAdding(true);
    setAddType(kind);
    setAddAmount('');
    setAddNote('');
    setAddDate(localDateString());
    setAddCategory((kind === 'expense' ? TX_CE : TX_CI)[0] || '');
  }

  async function handleAdd() {
    const amt = parseFloat(addAmount);
    if (!amt || !addCategory) { setError('Amount and category are required.'); return; }
    setSaving(true);
    setError(null);
    const { data, error: err } = await window.sb
      .from('transactions')
      .insert({
        user_id: user.id,
        type: addType,
        amount: amt,
        category: addCategory,
        note: addNote || '',
        date: addDate,
        timestamp: new Date(addDate).toISOString(),
        currency: 'USD',
        is_recurring: false,
      })
      .select()
      .single();
    setSaving(false);
    if (err) { console.error('Insert error:', err); setError(err.message); return; }
    setTxData(prev => [data, ...prev]);
    setAdding(false);
  }

  async function handleSaveEdit() {
    const amt = parseFloat(editAmount);
    if (!amt || !editCategory || !editing) { setError('Amount and category are required.'); return; }
    setSaving(true);
    setError(null);
    const { data, error: err } = await window.sb
      .from('transactions')
      .update({ amount: amt, category: editCategory, note: editNote || '', date: editDate })
      .eq('id', editing.id)
      .select()
      .single();
    setSaving(false);
    if (err) { console.error('Update error:', err); setError(err.message); return; }
    setTxData(prev => prev.map(r => r.id === data.id ? data : r));
    setEditing(null);
  }

  async function handleDelete() {
    if (!editing) return;
    setSaving(true);
    setError(null);
    const { error: err } = await window.sb.from('transactions').delete().eq('id', editing.id);
    setSaving(false);
    if (err) { console.error('Delete error:', err); setError(err.message); return; }
    setTxData(prev => prev.filter(r => r.id !== editing.id));
    setEditing(null);
  }

  const now       = new Date();
  const todayStr  = localDateString(now);
  const monthStr  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const yearStr   = String(now.getFullYear());
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);

  const rows = txData.filter(row => {
    if (filter !== 'all' && row.type !== filter) return false;
    if (search && !(row.category + ' ' + (row.note || '')).toLowerCase().includes(search.toLowerCase())) return false;
    const d = row.date || (row.timestamp ? row.timestamp.slice(0, 10) : '');
    if (period === 'day'   && d !== todayStr) return false;
    if (period === 'week'  && new Date(d + 'T00:00:00') < weekStart) return false;
    if (period === 'month' && !d.startsWith(monthStr)) return false;
    if (period === 'year'  && !d.startsWith(yearStr))  return false;
    return true;
  });

  const income   = rows.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
  const expenses = rows.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
  const net = income - expenses;

  const groups = {};
  rows.forEach(row => {
    const key = row.date || (row.timestamp ? row.timestamp.slice(0, 10) : '');
    if (key) (groups[key] = groups[key] || []).push(row);
  });
  const dates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  const periods = [
    { id: 'day', label: t('transactions.day') }, { id: 'week', label: t('transactions.week') },
    { id: 'month', label: t('transactions.month') }, { id: 'year', label: t('transactions.year') },
    { id: 'overall', label: t('transactions.overall') },
  ];
  const filters = [
    { id: 'all', label: t('transactions.all') },
    { id: 'income', label: t('transactions.income2') },
    { id: 'expense', label: t('transactions.expense') },
  ];

  return (
    <div className="page">

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button type="button" className="btn btn-primary" onClick={() => openAdd('expense')}>
          <TxI.plus size={14} /> {t('transactions.add')}
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ marginBottom: 14, padding: '10px 14px', background: 'var(--expense-tint)', color: 'var(--expense)', borderRadius: 8, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {error}
          <button type="button" onClick={() => setError(null)} style={{ color: 'inherit', fontSize: 12, fontWeight: 600 }}>✕</button>
        </div>
      )}

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
          {periods.map(p => <button key={p.id} onClick={() => setPeriod(p.id)} className={period === p.id ? 'active' : ''}>{p.label}</button>)}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 6 }}>
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
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
          <input className="input" placeholder={t('transactions.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32, width: 220 }} />
        </div>
      </div>

      {/* List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>No transactions yet. Add your first one!</div>
        ) : dates.map(d => {
          const list = groups[d];
          const dayTotal = list.reduce((s, row) => s + (row.type === 'income' ? row.amount : -row.amount), 0);
          return (
            <div key={d}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', background: 'var(--bg-warm)', borderTop: '1px solid var(--border-soft)', borderBottom: '1px solid var(--border-soft)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {txRelDate(d)} <span style={{ color: 'var(--text-3)', marginLeft: 6 }}>{txFmtDate(d)}</span>
                </div>
                <div className="mono" style={{ fontSize: 12, fontWeight: 600, color: dayTotal >= 0 ? 'var(--income)' : 'var(--expense)' }}>
                  {dayTotal >= 0 ? '+' : '−'}${Math.abs(dayTotal).toFixed(2)}
                </div>
              </div>
              {list.map(row => (
                <div key={row.id} role="button" tabIndex={0}
                  onClick={() => { setAdding(false); setError(null); setEditing(row); }}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setAdding(false); setEditing(row); } }}
                  style={{ display: 'grid', gridTemplateColumns: '32px 1fr 100px auto auto', gap: 14, alignItems: 'center', width: '100%', padding: '12px 20px', borderBottom: '1px solid var(--border-soft)', background: 'transparent', textAlign: 'left', cursor: 'pointer' }}
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
                    <button type="button" className="icon-btn" onClick={() => { setAdding(false); setError(null); setEditing(row); }}><TxI.edit size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Add modal */}
      {adding && (
        <div role="presentation" onClick={() => setAdding(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', zIndex: 200, padding: 16 }}>
          <div role="dialog" aria-modal="true" onClick={e => e.stopPropagation()} className="card"
            style={{ width: 'min(420px, 100%)', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-deep)', padding: 20 }}>
            <div className="card-head" style={{ marginBottom: 10 }}>
              <div className="card-title">{t('home.newTransaction')}</div>
              <button type="button" className="icon-btn" onClick={() => setAdding(false)}><TxI.x size={14} /></button>
            </div>

            {error && <div style={{ marginBottom: 10, padding: '8px 12px', background: 'var(--expense-tint)', color: 'var(--expense)', borderRadius: 8, fontSize: 13 }}>{error}</div>}

            <div className="seg" style={{ width: '100%', marginBottom: 12 }}>
              <button type="button" onClick={() => { setAddType('expense'); setAddCategory(TX_CE[0]); }} className={addType === 'expense' ? 'active' : ''} style={{ flex: 1, color: addType === 'expense' ? 'var(--expense)' : undefined }}>{t('home.expense')}</button>
              <button type="button" onClick={() => { setAddType('income'); setAddCategory(TX_CI[0]); }} className={addType === 'income' ? 'active' : ''} style={{ flex: 1, color: addType === 'income' ? 'var(--income)' : undefined }}>{t('home.income')}</button>
            </div>

            <div style={{ border: `1.5px solid ${addType === 'income' ? 'var(--income)' : 'var(--expense)'}`, borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'baseline', gap: 4, background: 'var(--bg)', marginBottom: 14 }}>
              <span className="mono" style={{ fontSize: 16, color: 'var(--text-3)', fontWeight: 500 }}>$</span>
              <input value={addAmount} onChange={e => setAddAmount(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.00" className="mono" autoFocus
                style={{ flex: 1, border: 0, outline: 'none', background: 'transparent', fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text)', padding: 0 }} />
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>USD</span>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="label">{t('home.category')}</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(addType === 'expense' ? TX_CE : TX_CI).slice(0, 10).map(c => (
                  <button key={c} type="button" onClick={() => setAddCategory(c)} style={{ padding: '5px 10px', borderRadius: 9999, background: addCategory === c ? 'var(--accent-tint)' : 'var(--bg-warm)', color: addCategory === c ? 'var(--accent-text)' : 'var(--text-2)', border: '1px solid ' + (addCategory === c ? 'transparent' : 'var(--border-soft)'), fontSize: 12, fontWeight: 600 }}>{c}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div>
                <label className="label">{t('home.note')}</label>
                <input className="input" placeholder={t('home.optional')} value={addNote} onChange={e => setAddNote(e.target.value)} />
              </div>
              <div>
                <label className="label">{t('home.date')}</label>
                <input className="input mono" type="date" value={addDate} onChange={e => setAddDate(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => { setAdding(false); setError(null); }}>{t('transactions.cancel')}</button>
              <button type="button" className="btn btn-primary" onClick={handleAdd} disabled={saving || !addAmount}>
                <TxI.check size={14} /> {saving ? '…' : t('home.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div onClick={() => { setEditing(null); setError(null); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', zIndex: 200 }}>
          <div onClick={e => e.stopPropagation()} className="card" style={{ width: 'min(420px, 100%)', boxShadow: 'var(--shadow-deep)', padding: 20 }}>
            <div className="card-head">
              <div className="card-title">{t('transactions.editTitle')}</div>
              <button type="button" className="icon-btn" onClick={() => { setEditing(null); setError(null); }}><TxI.x size={14} /></button>
            </div>

            {error && <div style={{ marginBottom: 10, padding: '8px 12px', background: 'var(--expense-tint)', color: 'var(--expense)', borderRadius: 8, fontSize: 13 }}>{error}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label className="label">{t('transactions.amount')}</label><input className="input mono" value={editAmount} onChange={e => setEditAmount(e.target.value.replace(/[^0-9.]/g, ''))} /></div>
              <div><label className="label">{t('transactions.category')}</label><input className="input" value={editCategory} onChange={e => setEditCategory(e.target.value)} /></div>
              <div><label className="label">{t('transactions.note')}</label><input className="input" value={editNote} onChange={e => setEditNote(e.target.value)} /></div>
              <div><label className="label">{t('transactions.date')}</label><input className="input mono" type="date" value={editDate} onChange={e => setEditDate(e.target.value)} /></div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={saving}><TxI.trash size={14} /> {t('transactions.delete')}</button>
                <div style={{ flex: 1 }} />
                <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setError(null); }}>{t('transactions.cancel')}</button>
                <button type="button" className="btn btn-primary" onClick={handleSaveEdit} disabled={saving}>{saving ? '…' : t('transactions.save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.PageTransactions = PageTransactions;
