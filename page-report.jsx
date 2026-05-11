// /report — financial grade + charts + insights, live Supabase data
const { Icons: RpI } = window;

const RPT_COLORS = ['var(--accent)', 'var(--teal)', '#5b8def', '#c8a015', '#9e62d8', 'var(--warn)', 'var(--income)', '#888'];

function PageReport({ user }) {
  const { t } = window.I18n.useT();
  const [period, setPeriod] = React.useState('month');
  const [allTx, setAllTx]   = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;
    setLoading(true);
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 6);
    cutoff.setDate(1);
    cutoff.setHours(0, 0, 0, 0);
    window.sb
      .from('transactions')
      .select('*')
      .gte('timestamp', cutoff.toISOString())
      .order('timestamp', { ascending: false })
      .then(({ data }) => { setAllTx(data || []); setLoading(false); });
  }, [user]);

  const now       = new Date();
  const monthStr  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const yearStr   = String(now.getFullYear());
  const weekStart = new Date(now); weekStart.setDate(weekStart.getDate() - 6); weekStart.setHours(0, 0, 0, 0);

  const periodTx = allTx.filter(row => {
    const d = row.date || (row.timestamp ? row.timestamp.slice(0, 10) : '');
    if (period === 'week')  return new Date(d + 'T00:00:00') >= weekStart;
    if (period === 'month') return d.startsWith(monthStr);
    if (period === 'year')  return d.startsWith(yearStr);
    return true;
  });

  const incomeSum = periodTx.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
  const expSum    = periodTx.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
  const savings   = incomeSum > 0 ? (incomeSum - expSum) / incomeSum : 0;
  const grade     = savings >= 0.5 ? 'A' : savings >= 0.35 ? 'B' : savings >= 0.2 ? 'C' : savings >= 0.05 ? 'D' : 'F';
  const gradeColor = { A: 'var(--income)', B: 'var(--teal)', C: '#c8a015', D: 'var(--warn)', F: 'var(--expense)' }[grade];

  const catMap = {};
  periodTx.filter(r => r.type === 'expense').forEach(r => { catMap[r.category] = (catMap[r.category] || 0) + r.amount; });
  const sortedCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  const totalExp   = sortedCats.reduce((s, [, v]) => s + v, 0);

  const radius = 64, inner = 40;
  let cum = 0;
  const segs = sortedCats.slice(0, 7).map(([cat, val], i) => {
    const start = totalExp > 0 ? cum / totalExp * 360 : 0;
    cum += val;
    const end = totalExp > 0 ? cum / totalExp * 360 : 0;
    return { cat, val, start, end, color: RPT_COLORS[i] };
  });

  const trendSeries = React.useMemo(() => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStr  = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      const mTx   = allTx.filter(r => (r.date || '').startsWith(mStr));
      result.push({
        month:    label,
        income:   mTx.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0),
        expenses: mTx.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0),
      });
    }
    return result;
  }, [allTx]);

  const maxVal = Math.max(...trendSeries.map(s => Math.max(s.income, s.expenses)), 1);

  const insights = React.useMemo(() => {
    if (periodTx.length === 0) return [{ ico: '💡', txt: 'Add transactions to see insights here.' }];
    const list = [];
    const savePct = Math.round(savings * 100);
    if (savings >= 0.5)       list.push({ ico: '🎉', txt: `Great job! You saved <b>${savePct}%</b> of your income this period.` });
    else if (incomeSum === 0) list.push({ ico: '💡', txt: 'No income recorded yet. Add income transactions to track your savings rate.' });
    else if (savings > 0)     list.push({ ico: '📊', txt: `You saved <b>${savePct}%</b> of income. Aim for 20%+ to build a safety net.` });
    else                      list.push({ ico: '⚠️', txt: `You spent <b>$${(expSum - incomeSum).toFixed(0)} more</b> than you earned this period.` });

    if (sortedCats[0]) list.push({ ico: '📦', txt: `Biggest expense: <b>${sortedCats[0][0]}</b> at $${sortedCats[0][1].toFixed(0)} (${Math.round(sortedCats[0][1] / totalExp * 100)}% of spending).` });
    list.push({ ico: '🧾', txt: `<b>${periodTx.length}</b> transaction${periodTx.length === 1 ? '' : 's'} recorded for this period.` });

    if (trendSeries.length >= 2) {
      const cur  = trendSeries[trendSeries.length - 1];
      const prev = trendSeries[trendSeries.length - 2];
      if (prev.expenses > 0 && cur.expenses > 0) {
        const diff = cur.expenses - prev.expenses;
        const pct  = Math.round(Math.abs(diff) / prev.expenses * 100);
        list.push({ ico: diff <= 0 ? '📉' : '📈', txt: diff <= 0 ? `Spending is down <b>${pct}%</b> vs last month.` : `Spending is up <b>${pct}%</b> vs last month.` });
      }
    }
    return list;
  }, [periodTx, savings, sortedCats, trendSeries]);

  const periods = [
    { id: 'week',  label: t('report.week') },
    { id: 'month', label: t('report.month') },
    { id: 'year',  label: t('report.year') },
  ];

  if (loading) return (
    <div className="page" style={{ display: 'grid', placeItems: 'center', minHeight: 300, color: 'var(--text-3)', fontSize: 14 }}>Loading…</div>
  );

  return (
    <div className="page" style={{ position: 'relative' }}>
      {/* Coming soon overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        background: 'var(--coming-soon-overlay)',
        zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
      }}>
        <div style={{ fontSize: 40 }}>📊</div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>Coming Soon</div>
        <div style={{ fontSize: 14, color: 'var(--text-2)', textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>
          Advanced reporting and insights are on the way.
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>{t('report.title')}</h2>
          <div style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 4 }}>{t('report.subtitle')}</div>
        </div>
        <div className="seg">
          {periods.map(p => <button key={p.id} onClick={() => setPeriod(p.id)} className={period === p.id ? 'active' : ''}>{p.label}</button>)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16, marginBottom: 16 }}>
        {/* Grade card */}
        <div className="card" style={{ padding: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('report.financialGrade')}</div>
          {periodTx.length === 0 ? (
            <div style={{ padding: '40px 0', color: 'var(--text-3)', fontSize: 13 }}>No data for this period</div>
          ) : (<>
            <div style={{ position: 'relative', width: 180, height: 180, margin: '16px auto 8px' }}>
              <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="90" cy="90" r="76" fill="none" stroke="var(--bg-warm)" strokeWidth="14" />
                <circle cx="90" cy="90" r="76" fill="none" stroke={gradeColor} strokeWidth="14"
                  strokeDasharray={`${Math.min(Math.max(savings, 0), 1) * 2 * Math.PI * 76} 999`} strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em', color: gradeColor }}>{grade}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{Math.round(savings * 100)}% {t('report.saved')}</div>
                </div>
              </div>
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 8 }}>
              {t('report.savingPrefix')} <b style={{ color: 'var(--text)' }}>{Math.round(savings * 100)}%</b> {t('report.savingSuffix')}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-soft)' }}>
              <div><div style={{ fontSize: 11, color: 'var(--text-3)' }}>{t('report.income')}</div><div className="mono" style={{ fontSize: 16, fontWeight: 600, color: 'var(--income)' }}>+${incomeSum.toFixed(0)}</div></div>
              <div><div style={{ fontSize: 11, color: 'var(--text-3)' }}>{t('report.expenses')}</div><div className="mono" style={{ fontSize: 16, fontWeight: 600, color: 'var(--expense)' }}>−${expSum.toFixed(0)}</div></div>
              <div><div style={{ fontSize: 11, color: 'var(--text-3)' }}>{t('report.net')}</div><div className="mono" style={{ fontSize: 16, fontWeight: 600 }}>${(incomeSum - expSum).toFixed(0)}</div></div>
            </div>
          </>)}
        </div>

        {/* Trend chart — always 6 months */}
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">{t('report.trendTitle')}</div>
              <div className="card-sub">{t('report.trendSub')}</div>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-2)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--income)' }} /> {t('report.income')}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--expense)' }} /> {t('report.expenses')}</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${trendSeries.length}, 1fr)`, gap: 14, height: 220, alignItems: 'end', padding: '12px 4px 0' }}>
            {trendSeries.map((s, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%' }}>
                <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                  <div style={{ flex: 1, background: 'var(--income)', borderRadius: '4px 4px 0 0', height: `${s.income / maxVal * 100}%`, minHeight: s.income > 0 ? 2 : 0, opacity: i === trendSeries.length - 1 ? 1 : 0.75 }} title={`Income $${s.income}`} />
                  <div style={{ flex: 1, background: 'var(--expense)', borderRadius: '4px 4px 0 0', height: `${s.expenses / maxVal * 100}%`, minHeight: s.expenses > 0 ? 2 : 0, opacity: i === trendSeries.length - 1 ? 1 : 0.75 }} title={`Expenses $${s.expenses}`} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>{s.month}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories + Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-head">
            <div className="card-title">{t('report.spendingTitle')}</div>
            <div className="card-sub mono">${totalExp.toFixed(2)} total</div>
          </div>
          {segs.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>No expense data for this period</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 22, alignItems: 'center' }}>
              <svg width="180" height="180" viewBox="-90 -90 180 180">
                {segs.map((s, i) => {
                  const a1 = s.start * Math.PI / 180 - Math.PI / 2;
                  const a2 = s.end   * Math.PI / 180 - Math.PI / 2;
                  const x1 = Math.cos(a1) * radius, y1 = Math.sin(a1) * radius;
                  const x2 = Math.cos(a2) * radius, y2 = Math.sin(a2) * radius;
                  const x3 = Math.cos(a2) * inner,  y3 = Math.sin(a2) * inner;
                  const x4 = Math.cos(a1) * inner,  y4 = Math.sin(a1) * inner;
                  const large = (s.end - s.start) > 180 ? 1 : 0;
                  return <path key={i} d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${inner} ${inner} 0 ${large} 0 ${x4} ${y4} Z`} fill={s.color} />;
                })}
                <text x="0" y="-4" textAnchor="middle" style={{ fontSize: 10, fill: 'var(--text-3)', fontWeight: 600, letterSpacing: 1 }}>{t('report.spent')}</text>
                <text x="0" y="14" textAnchor="middle" style={{ fontSize: 18, fill: 'var(--text)', fontWeight: 700, fontFamily: 'var(--mono)' }}>${totalExp.toFixed(0)}</text>
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {segs.map((s, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '12px 1fr auto auto', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{s.cat}</span>
                    <span className="mono" style={{ fontSize: 12, color: 'var(--text-2)', minWidth: 50, textAlign: 'right' }}>${s.val.toFixed(0)}</span>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)', minWidth: 36, textAlign: 'right' }}>{Math.round(s.val / totalExp * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">{t('report.insights')}</div>
            <span className="pill"><span className="dot" /> {t('report.autoGenerated')}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {insights.map((ins, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: 12, alignItems: 'start', padding: 12, borderRadius: 10, background: 'var(--bg-warm)', border: '1px solid var(--border-soft)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border-soft)', display: 'grid', placeItems: 'center', fontSize: 14 }}>{ins.ico}</div>
                <div style={{ fontSize: 13, lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: ins.txt }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.PageReport = PageReport;
