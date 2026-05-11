// /recurring — live Supabase data (table: recurring)
const { Icons: RI } = window;
const { relDate: rrd, today: rtoday } = window.OdemesData;

function dueBadge(nextDueDate, t) {
  const days = Math.round((new Date(nextDueDate) - new Date()) / 86400000);
  if (days <= 0) return { label: t('recurring.dueToday'), cls: 'expense' };
  if (days <= 7) return { label: `${t('recurring.inDays')} ${days}d`, cls: 'warn' };
  return { label: new Date(nextDueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), cls: 'neutral' };
}

function PageRecurring({ user, onCountChange }) {
  const { t } = window.I18n.useT();
  const [recData, setRecData]   = React.useState([]);
  const [loading, setLoading]   = React.useState(true);
  const [error, setError]       = React.useState(null);
  const [adding, setAdding]     = React.useState(false);
  const [saving, setSaving]     = React.useState(false);
  const [addType, setAddType]   = React.useState('expense');
  const [addAmount, setAddAmount] = React.useState('');
  const [addCategory, setAddCategory] = React.useState('');
  const [addFrequency, setAddFrequency] = React.useState('monthly');
  const [addNextDue, setAddNextDue] = React.useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [addNote, setAddNote] = React.useState('');

  // Fetch
  React.useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    window.sb
      .from('recurring')
      .select('*')
      .eq('is_active', true)
      .order('next_due_date', { ascending: true })
      .then(({ data, error: err }) => {
        if (err) { console.error('Recurring fetch error:', err); setError(err.message); }
        else { setRecData(data || []); onCountChange && onCountChange((data || []).length); }
        setLoading(false);
      });
  }, [user]);

  async function handleAdd() {
    const amt = parseFloat(addAmount);
    if (!amt || !addCategory.trim()) { setError('Amount and category are required.'); return; }
    setSaving(true);
    setError(null);
    const { data, error: err } = await window.sb
      .from('recurring')
      .insert({
        user_id: user.id,
        type: addType,
        amount: amt,
        category: addCategory.trim(),
        note: addNote || '',
        frequency: addFrequency,
        next_due_date: new Date(addNextDue + 'T00:00:00').toISOString(),
        is_active: true,
        currency: 'USD',
      })
      .select()
      .single();
    setSaving(false);
    if (err) { console.error('Recurring insert error:', err); setError(err.message); return; }
    setRecData(prev => [...prev, data].sort((a, b) => new Date(a.next_due_date) - new Date(b.next_due_date)));
    setAdding(false);
    setAddAmount(''); setAddCategory(''); setAddNote('');
  }

  async function confirmPayment(r) {
    setError(null);
    const txDate = new Date().toISOString().slice(0, 10);
    const { error: txErr } = await window.sb.from('transactions').insert({
      user_id: user.id,
      type: r.type,
      amount: r.amount,
      category: r.category,
      note: r.note || '',
      date: txDate,
      timestamp: new Date().toISOString(),
      currency: r.currency || 'USD',
      is_recurring: true,
      recurring_pattern: r.frequency,
    });
    if (txErr) { console.error('Confirm payment tx error:', txErr); setError(txErr.message); return; }

    const next = new Date(r.next_due_date);
    if (r.frequency === 'yearly') next.setFullYear(next.getFullYear() + 1);
    else next.setMonth(next.getMonth() + 1);

    const { data, error: updErr } = await window.sb
      .from('recurring')
      .update({ next_due_date: next.toISOString(), last_processed_date: new Date().toISOString() })
      .eq('id', r.id)
      .select()
      .single();
    if (updErr) { console.error('Recurring update error:', updErr); setError(updErr.message); return; }
    setRecData(prev => prev.map(item => item.id === r.id ? data : item));
  }

  async function handleDelete(r) {
    setError(null);
    const { error: err } = await window.sb.from('recurring').delete().eq('id', r.id);
    if (err) { console.error('Recurring delete error:', err); setError(err.message); return; }
    setRecData(prev => prev.filter(item => item.id !== r.id));
  }

  const monthlyOut = recData.filter(r => r.type === 'expense' && r.frequency === 'monthly').reduce((s, r) => s + r.amount, 0);
  const monthlyIn  = recData.filter(r => r.type === 'income'  && r.frequency === 'monthly').reduce((s, r) => s + r.amount, 0);

  return (
    <div className="page">

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => { setAdding(true); setError(null); }}>
          <RI.plus size={14} /> {t('recurring.newRecurring')}
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ marginBottom: 14, padding: '10px 14px', background: 'var(--expense-tint)', color: 'var(--expense)', borderRadius: 8, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {error}
          <button type="button" onClick={() => setError(null)} style={{ color: 'inherit', fontSize: 12, fontWeight: 600 }}>✕</button>
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('recurring.monthlyOutgoing')}</div>
          <div className="mono" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 6, color: 'var(--expense)' }}>−${monthlyOut.toFixed(2)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{recData.filter(r => r.type === 'expense').length} active</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('recurring.monthlyIncoming')}</div>
          <div className="mono" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 6, color: 'var(--income)' }}>+${monthlyIn.toFixed(2)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{recData.filter(r => r.type === 'income').length} active</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('recurring.netPerMonth')}</div>
          <div className="mono" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 6, color: monthlyIn - monthlyOut >= 0 ? 'var(--income)' : 'var(--expense)' }}>
            {monthlyIn - monthlyOut >= 0 ? '+' : '−'}${Math.abs(monthlyIn - monthlyOut).toFixed(2)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{t('recurring.afterFixed')}</div>
        </div>
      </div>

      {/* List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border-soft)' }}>
          <div className="card-title">{t('recurring.allRecurring')} · {recData.length}</div>
          <div className="card-sub mono">{t('recurring.sortedByDue')}</div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>Loading…</div>
        ) : recData.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>No recurring items yet. Add your first one!</div>
        ) : recData.map(r => {
          const b = dueBadge(r.next_due_date, t);
          return (
            <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '36px 1fr 110px 120px 120px auto', gap: 14, alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--border-soft)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: r.type === 'income' ? 'var(--income-tint)' : 'var(--bg-warm)', display: 'grid', placeItems: 'center', color: r.type === 'income' ? 'var(--income)' : 'var(--text-2)', fontWeight: 700, fontSize: 13 }}>
                {(r.category || '?')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{r.category}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{r.note || '—'}</div>
              </div>
              <div className="pill neutral" style={{ textTransform: 'capitalize' }}>{r.frequency}</div>
              <span className={`pill ${b.cls}`}>{b.label}</span>
              <div className="mono" style={{ fontSize: 14, fontWeight: 600, color: r.type === 'income' ? 'var(--income)' : 'var(--expense)' }}>
                {r.type === 'income' ? '+' : '−'}${r.amount.toFixed(2)}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {b.cls === 'expense' && (
                  <button className="btn btn-primary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => confirmPayment(r)}>
                    <RI.check size={12} /> {t('recurring.confirm')}
                  </button>
                )}
                <button className="icon-btn" title="Delete" onClick={() => { if (window.confirm('Delete this recurring item?')) handleDelete(r); }}>
                  <RI.trash size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add modal */}
      {adding && (
        <div onClick={() => { setAdding(false); setError(null); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', zIndex: 200 }}>
          <div onClick={e => e.stopPropagation()} className="card"
            style={{ width: 'min(480px, 100%)', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-deep)', padding: 20 }}>
            <div className="card-head">
              <div className="card-title">{t('recurring.addRecurring')}</div>
              <button className="icon-btn" onClick={() => { setAdding(false); setError(null); }}><RI.x size={14} /></button>
            </div>

            {error && <div style={{ marginBottom: 10, padding: '8px 12px', background: 'var(--expense-tint)', color: 'var(--expense)', borderRadius: 8, fontSize: 13 }}>{error}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="seg" style={{ alignSelf: 'flex-start' }}>
                <button className={addType === 'expense' ? 'active' : ''} style={{ color: addType === 'expense' ? 'var(--expense)' : undefined }} onClick={() => setAddType('expense')}>{t('recurring.expense')}</button>
                <button className={addType === 'income' ? 'active' : ''} style={{ color: addType === 'income' ? 'var(--income)' : undefined }} onClick={() => setAddType('income')}>{t('recurring.income')}</button>
              </div>

              <div style={{ border: `1.5px solid ${addType === 'income' ? 'var(--income)' : 'var(--expense)'}`, borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'baseline', gap: 4, background: 'var(--bg)' }}>
                <span className="mono" style={{ fontSize: 16, color: 'var(--text-3)', fontWeight: 500 }}>$</span>
                <input value={addAmount} onChange={e => setAddAmount(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.00" className="mono" autoFocus
                  style={{ flex: 1, border: 0, outline: 'none', background: 'transparent', fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text)', padding: 0 }} />
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>USD</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="label">{t('recurring.category')}</label>
                  <input className="input" placeholder={t('recurring.categoryPlaceholder')} value={addCategory} onChange={e => setAddCategory(e.target.value)} />
                </div>
                <div>
                  <label className="label">{t('recurring.frequency')}</label>
                  <div className="seg" style={{ width: '100%' }}>
                    <button className={addFrequency === 'monthly' ? 'active' : ''} style={{ flex: 1 }} onClick={() => setAddFrequency('monthly')}>{t('recurring.monthly')}</button>
                    <button className={addFrequency === 'yearly' ? 'active' : ''} style={{ flex: 1 }} onClick={() => setAddFrequency('yearly')}>{t('recurring.yearly')}</button>
                  </div>
                </div>
              </div>

              <div>
                <label className="label">{t('recurring.nextDue')}</label>
                <input className="input mono" type="date" value={addNextDue} onChange={e => setAddNextDue(e.target.value)} />
              </div>

              <div>
                <label className="label">{t('recurring.note')}</label>
                <input className="input" placeholder={t('recurring.optional')} value={addNote} onChange={e => setAddNote(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => { setAdding(false); setError(null); }}>{t('recurring.cancel')}</button>
                <button className="btn btn-primary" onClick={handleAdd} disabled={saving || !addAmount || !addCategory}>
                  {saving ? '…' : t('recurring.create')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.PageRecurring = PageRecurring;
