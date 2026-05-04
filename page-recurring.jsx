// /recurring
const { Icons: RI } = window;
const { RECURRING: REC, fmtDate: rfd, relDate: rrd, today: rtoday } = window.OdemesData;

function dueBadge(next, t) {
  const days = Math.round((new Date(next) - rtoday) / 86400000);
  if (days <= 0) return { label: t('recurring.dueToday'), cls: 'expense' };
  if (days <= 7) return { label: `${t('recurring.inDays')} ${days}d`, cls: 'warn' };
  return { label: rrd(next), cls: 'neutral' };
}

function PageRecurring() {
  const { t } = window.I18n.useT();
  const [adding, setAdding] = React.useState(false);

  const monthlyOut = REC.filter(r => r.type === 'expense' && r.frequency === 'monthly').reduce((s,r) => s+r.amount, 0);
  const monthlyIn  = REC.filter(r => r.type === 'income'  && r.frequency === 'monthly').reduce((s,r) => s+r.amount, 0);

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>{t('recurring.title')}</h2>
          <div style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 4 }}>{t('recurring.subtitle')}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setAdding(true)}><RI.plus size={14} /> {t('recurring.newRecurring')}</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('recurring.monthlyOutgoing')}</div>
          <div className="mono" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 6, color: 'var(--expense)' }}>−${monthlyOut.toFixed(2)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{t('recurring.active4')}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('recurring.monthlyIncoming')}</div>
          <div className="mono" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 6, color: 'var(--income)' }}>+${monthlyIn.toFixed(2)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{t('recurring.active1')}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('recurring.netPerMonth')}</div>
          <div className="mono" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 6, color: 'var(--income)' }}>+${(monthlyIn - monthlyOut).toFixed(2)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{t('recurring.afterFixed')}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border-soft)' }}>
          <div className="card-title">{t('recurring.allRecurring')} · {REC.length}</div>
          <div className="card-sub mono">{t('recurring.sortedByDue')}</div>
        </div>
        {REC.slice().sort((a,b) => a.next.localeCompare(b.next)).map(r => {
          const b = dueBadge(r.next, t);
          return (
            <div key={r.id} style={{
              display: 'grid', gridTemplateColumns: '36px 1fr 110px 120px 120px auto', gap: 14, alignItems: 'center',
              padding: '14px 20px', borderBottom: '1px solid var(--border-soft)',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: r.type === 'income' ? 'var(--income-tint)' : 'var(--bg-warm)', display: 'grid', placeItems: 'center', color: r.type === 'income' ? 'var(--income)' : 'var(--text-2)', fontWeight: 700, fontSize: 13 }}>
                {r.category[0]}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{r.category}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{r.note}</div>
              </div>
              <div className="pill neutral" style={{ textTransform: 'capitalize' }}>{r.frequency}</div>
              <span className={`pill ${b.cls}`}>{b.label}</span>
              <div className="mono" style={{ fontSize: 14, fontWeight: 600, color: r.type === 'income' ? 'var(--income)' : 'var(--expense)' }}>
                {r.type === 'income' ? '+' : '−'}${r.amount.toFixed(2)}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {b.cls === 'expense' && <button className="btn btn-primary" style={{ fontSize: 12, padding: '6px 12px' }}><RI.check size={12} /> {t('recurring.confirm')}</button>}
                <button className="icon-btn"><RI.edit size={14} /></button>
                <button className="icon-btn"><RI.more size={14} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {adding && (
        <div onClick={() => setAdding(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'grid', placeItems: 'center', zIndex: 200 }}>
          <div onClick={e => e.stopPropagation()} className="card" style={{ width: 460, boxShadow: 'var(--shadow-deep)' }}>
            <div className="card-head">
              <div className="card-title">{t('recurring.addRecurring')}</div>
              <button className="icon-btn" onClick={() => setAdding(false)}><RI.x size={14} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="seg" style={{ alignSelf: 'flex-start' }}>
                <button className="active">{t('recurring.expense')}</button>
                <button>{t('recurring.income')}</button>
              </div>
              <div><label className="label">{t('recurring.amount')}</label><input className="input mono" placeholder={t('recurring.amountPlaceholder')} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label className="label">{t('recurring.category')}</label><input className="input" placeholder={t('recurring.categoryPlaceholder')} /></div>
                <div>
                  <label className="label">{t('recurring.frequency')}</label>
                  <div className="seg" style={{ width: '100%' }}>
                    <button className="active" style={{ flex: 1 }}>{t('recurring.monthly')}</button>
                    <button style={{ flex: 1 }}>{t('recurring.yearly')}</button>
                  </div>
                </div>
              </div>
              <div><label className="label">{t('recurring.nextDue')}</label><input className="input mono" defaultValue="2026-05-01" /></div>
              <div><label className="label">{t('recurring.note')}</label><input className="input" placeholder={t('recurring.optional')} /></div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setAdding(false)}>{t('recurring.cancel')}</button>
                <button className="btn btn-primary" onClick={() => setAdding(false)}>{t('recurring.create')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.PageRecurring = PageRecurring;
