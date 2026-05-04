// /report — financial grade + charts + insights
const { Icons: RpI } = window;
const { TRANSACTIONS: RT, SPEND_SERIES: SERIES } = window.OdemesData;

function PageReport() {
  const { t } = window.I18n.useT();
  const [period, setPeriod] = React.useState('month');

  const incomeSum = RT.filter(row => row.type === 'income').reduce((s,row)=>s+row.amount, 0);
  const expSum    = RT.filter(row => row.type === 'expense').reduce((s,row)=>s+row.amount, 0);
  const savings   = incomeSum > 0 ? (incomeSum - expSum) / incomeSum : 0;
  const grade     = savings >= 0.5 ? 'A' : savings >= 0.35 ? 'B' : savings >= 0.2 ? 'C' : savings >= 0.05 ? 'D' : 'F';
  const gradeColor = { A: 'var(--income)', B: 'var(--teal)', C: '#c8a015', D: 'var(--warn)', F: 'var(--expense)' }[grade];

  const catBreakdown = {};
  RT.filter(row => row.type === 'expense').forEach(row => { catBreakdown[row.category] = (catBreakdown[row.category] || 0) + row.amount; });
  const sortedCats = Object.entries(catBreakdown).sort((a,b)=>b[1]-a[1]);
  const totalExp = sortedCats.reduce((s,[,v])=>s+v,0);

  const COLORS = ['var(--accent)', 'var(--teal)', '#5b8def', '#c8a015', '#9e62d8', 'var(--warn)', 'var(--income)', '#666'];

  const radius = 64;
  const inner  = 40;
  let cum = 0;
  const segs = sortedCats.slice(0, 7).map(([cat, val], i) => {
    const start = cum / totalExp * 360;
    cum += val;
    const end = cum / totalExp * 360;
    return { cat, val, start, end, color: COLORS[i] };
  });

  const maxVal = Math.max(...SERIES.map(s => Math.max(s.income, s.expenses)));

  const periods = [
    { id: 'week',  label: t('report.week') },
    { id: 'month', label: t('report.month') },
    { id: 'year',  label: t('report.year') },
  ];

  const insights = [
    { ico: '🎉', txt: t('report.insight1'), tone: 'income' },
    { ico: '⚠️', txt: t('report.insight2'), tone: 'warn' },
    { ico: '📉', txt: t('report.insight3'), tone: 'income' },
    { ico: '💡', txt: t('report.insight4'), tone: 'neutral' },
    { ico: '🔥', txt: t('report.insight5'), tone: 'income' },
  ];

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>{t('report.title')}</h2>
          <div style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 4 }}>{t('report.subtitle')}</div>
        </div>
        <div className="seg">
          {periods.map(p => (
            <button key={p.id} onClick={() => setPeriod(p.id)} className={period === p.id ? 'active' : ''}>{p.label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16, marginBottom: 16 }}>
        {/* Grade card */}
        <div className="card" style={{ padding: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('report.financialGrade')}</div>
          <div style={{ position: 'relative', width: 180, height: 180, margin: '16px auto 8px' }}>
            <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="90" cy="90" r="76" fill="none" stroke="var(--bg-warm)" strokeWidth="14" />
              <circle cx="90" cy="90" r="76" fill="none" stroke={gradeColor} strokeWidth="14" strokeDasharray={`${savings * 2 * Math.PI * 76} 999`} strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <div>
                <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em', color: gradeColor }}>{grade}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{Math.round(savings * 100)}% {t('report.saved')}</div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 8 }}>
            {t('report.savingPrefix')} <b style={{ color: 'var(--text)' }}>{Math.round(savings*100)}%</b> {t('report.savingSuffix')}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-soft)' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{t('report.income')}</div>
              <div className="mono" style={{ fontSize: 16, fontWeight: 600, color: 'var(--income)' }}>+${incomeSum.toFixed(0)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{t('report.expenses')}</div>
              <div className="mono" style={{ fontSize: 16, fontWeight: 600, color: 'var(--expense)' }}>−${expSum.toFixed(0)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{t('report.net')}</div>
              <div className="mono" style={{ fontSize: 16, fontWeight: 600 }}>${(incomeSum - expSum).toFixed(0)}</div>
            </div>
          </div>
        </div>

        {/* Trend chart */}
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
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SERIES.length}, 1fr)`, gap: 14, height: 220, alignItems: 'end', padding: '12px 4px 0' }}>
            {SERIES.map((s,i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%' }}>
                <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                  <div style={{ flex: 1, background: 'var(--income)', borderRadius: '4px 4px 0 0', height: `${s.income / maxVal * 100}%`, opacity: i === SERIES.length - 1 ? 1 : 0.85 }} title={`Income $${s.income}`} />
                  <div style={{ flex: 1, background: 'var(--expense)', borderRadius: '4px 4px 0 0', height: `${s.expenses / maxVal * 100}%`, opacity: i === SERIES.length - 1 ? 1 : 0.85 }} title={`Expenses $${s.expenses}`} />
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
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 22, alignItems: 'center' }}>
            <svg width="180" height="180" viewBox="-90 -90 180 180">
              {segs.map((s,i) => {
                const a1 = s.start * Math.PI / 180 - Math.PI/2;
                const a2 = s.end   * Math.PI / 180 - Math.PI/2;
                const x1 = Math.cos(a1) * radius, y1 = Math.sin(a1) * radius;
                const x2 = Math.cos(a2) * radius, y2 = Math.sin(a2) * radius;
                const x3 = Math.cos(a2) * inner,  y3 = Math.sin(a2) * inner;
                const x4 = Math.cos(a1) * inner,  y4 = Math.sin(a1) * inner;
                const large = (s.end - s.start) > 180 ? 1 : 0;
                return (
                  <path key={i} d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${inner} ${inner} 0 ${large} 0 ${x4} ${y4} Z`} fill={s.color} />
                );
              })}
              <text x="0" y="-4" textAnchor="middle" style={{ fontSize: 10, fill: 'var(--text-3)', fontWeight: 600, letterSpacing: 1 }}>{t('report.spent')}</text>
              <text x="0" y="14" textAnchor="middle" style={{ fontSize: 18, fill: 'var(--text)', fontWeight: 700, fontFamily: 'var(--mono)' }}>${totalExp.toFixed(0)}</text>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {segs.map((s,i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '12px 1fr auto auto', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{s.cat}</span>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--text-2)', minWidth: 50, textAlign: 'right' }}>${s.val.toFixed(0)}</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)', minWidth: 36, textAlign: 'right' }}>{Math.round(s.val/totalExp*100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">{t('report.insights')}</div>
            <span className="pill"><span className="dot" /> {t('report.autoGenerated')}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {insights.map((ins, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '32px 1fr', gap: 12, alignItems: 'start',
                padding: 12, borderRadius: 10,
                background: 'var(--bg-warm)', border: '1px solid var(--border-soft)',
              }}>
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
