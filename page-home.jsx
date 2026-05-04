// /home — three layout variations selectable via Tweaks
const { Icons: HI } = window;
const { TRANSACTIONS: HOME_TX, CATEGORIES_EXP: HCE, CATEGORIES_INC: HCI, fmtDate: hfd, relDate: hrd, today: htoday } = window.OdemesData;

function HomeRecent() {
  const { t } = window.I18n.useT();
  const list = HOME_TX.slice(0, 6);
  return (
    <div className="card" style={{ gridColumn: 'span 12' }}>
      <div className="card-head">
        <div>
          <div className="card-title">{t('home.recentActivity')}</div>
          <div className="card-sub">{t('home.recentSub')}</div>
        </div>
        <button className="btn btn-ghost">{t('home.viewAll')} <HI.arrow_right size={14} /></button>
      </div>
      <div>
        {list.map(row => (
          <div key={row.id} style={{ display: 'grid', gridTemplateColumns: '32px 1fr auto auto', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-soft)' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, display: 'grid', placeItems: 'center', background: row.type === 'income' ? 'var(--income-tint)' : 'var(--expense-tint)', color: row.type === 'income' ? 'var(--income)' : 'var(--expense)' }}>
              {row.type === 'income' ? <HI.arrow_down size={14} /> : <HI.arrow_up size={14} />}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{row.category}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{row.note || '—'}</div>
            </div>
            <div className="mono" style={{ fontSize: 13, fontWeight: 600, color: row.type === 'income' ? 'var(--income)' : 'var(--expense)' }}>
              {row.type === 'income' ? '+' : '−'}${row.amount.toFixed(2)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{hrd(row.date)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Variation A: Split — entry left, recent right
function EntryFormSplit({ type, setType, amount, setAmount, category, setCategory }) {
  const { t } = window.I18n.useT();
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="card-head" style={{ marginBottom: 0 }}>
        <div className="card-title">{t('home.newTransaction')}</div>
        <span className="card-sub mono">{hrd(htoday.toISOString().slice(0,10))}</span>
      </div>

      <div className="seg" style={{ width: '100%', alignSelf: 'stretch' }}>
        <button onClick={() => setType('expense')} className={type === 'expense' ? 'active' : ''} style={{ flex: 1, color: type === 'expense' ? 'var(--expense)' : undefined }}>{t('home.expense')}</button>
        <button onClick={() => setType('income')}  className={type === 'income'  ? 'active' : ''} style={{ flex: 1, color: type === 'income'  ? 'var(--income)'  : undefined }}>{t('home.income')}</button>
      </div>

      <div style={{
        border: `1.5px solid ${type === 'income' ? 'var(--income)' : 'var(--expense)'}`,
        borderRadius: 12, padding: '20px 22px',
        display: 'flex', alignItems: 'baseline', gap: 4,
        background: 'var(--bg)'
      }}>
        <span className="mono" style={{ fontSize: 22, color: 'var(--text-3)', fontWeight: 500 }}>$</span>
        <input
          value={amount}
          onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
          placeholder="0.00"
          className="mono"
          style={{
            flex: 1, border: 0, outline: 'none', background: 'transparent',
            fontSize: 36, fontWeight: 600, letterSpacing: '-0.02em',
            color: 'var(--text)', padding: 0,
          }}
        />
        <span className="mono" style={{ fontSize: 12, color: 'var(--text-3)' }}>USD</span>
      </div>

      <div>
        <label className="label">{t('home.category')}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(type === 'expense' ? HCE : HCI).slice(0, 8).map(c => (
            <button key={c} onClick={() => setCategory(c)}
              style={{
                padding: '6px 12px', borderRadius: 9999,
                background: category === c ? 'var(--accent-tint)' : 'var(--bg-warm)',
                color: category === c ? 'var(--accent-text)' : 'var(--text-2)',
                border: '1px solid ' + (category === c ? 'transparent' : 'var(--border-soft)'),
                fontSize: 12, fontWeight: 600,
              }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label className="label">{t('home.note')}</label>
          <input className="input" placeholder={t('home.optional')} />
        </div>
        <div>
          <label className="label">{t('home.date')}</label>
          <input className="input mono" defaultValue="2026-04-26" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }}>{t('home.saveAndAdd')}</button>
        <button className="btn btn-primary" style={{ flex: 1 }}><HI.check size={14} /> {t('home.save')}</button>
      </div>
    </div>
  );
}

function HomeSplit({ shared }) {
  return (
    <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'minmax(360px, 1.05fr) minmax(320px, 1fr)' }}>
      <EntryFormSplit {...shared} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
        <SummaryStrip />
        <RecentMini />
      </div>
    </div>
  );
}

// Variation B: Centered hero — big amount input dominates
function HomeHero({ shared }) {
  const { t } = window.I18n.useT();
  const { type, setType, amount, setAmount, category, setCategory } = shared;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card" style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
        <div className="seg">
          <button onClick={() => setType('expense')} className={type === 'expense' ? 'active' : ''} style={{ color: type === 'expense' ? 'var(--expense)' : undefined }}>{t('home.expense')}</button>
          <button onClick={() => setType('income')}  className={type === 'income'  ? 'active' : ''} style={{ color: type === 'income'  ? 'var(--income)'  : undefined }}>{t('home.income')}</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="mono" style={{ fontSize: 56, color: 'var(--text-3)', fontWeight: 500, lineHeight: 1 }}>$</span>
          <input
            value={amount}
            onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="0.00"
            className="mono"
            style={{
              border: 0, outline: 'none', background: 'transparent',
              fontSize: 96, fontWeight: 700, letterSpacing: '-0.04em',
              color: type === 'income' ? 'var(--income)' : 'var(--text)',
              width: 'min(540px, 60vw)', textAlign: 'center', padding: 0, lineHeight: 1
            }}
          />
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-3)' }} className="mono">{t('home.entryDate')}</div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', maxWidth: 640 }}>
          {(type === 'expense' ? HCE : HCI).map(c => (
            <button key={c} onClick={() => setCategory(c)}
              style={{
                padding: '7px 14px', borderRadius: 9999,
                background: category === c ? 'var(--accent-tint)' : 'var(--bg-warm)',
                color: category === c ? 'var(--accent-text)' : 'var(--text-2)',
                border: '1px solid ' + (category === c ? 'transparent' : 'var(--border-soft)'),
                fontSize: 13, fontWeight: 600,
              }}>{c}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, width: 'min(420px, 90%)' }}>
          <input className="input" placeholder={t('home.addNote')} style={{ flex: 1 }} />
          <button className="btn btn-primary btn-lg"><HI.check size={14} /> {t('home.save')}</button>
        </div>
      </div>

      <SummaryStrip />
      <RecentMini />
    </div>
  );
}

// Variation C: Calculator — keypad-style on left, summary stack right
function HomeCalc({ shared }) {
  const { t } = window.I18n.useT();
  const { type, setType, amount, setAmount, category, setCategory } = shared;
  const press = (k) => {
    if (k === '⌫') return setAmount(amount.slice(0, -1));
    if (k === '.' && amount.includes('.')) return;
    setAmount(amount + k);
  };
  const keys = ['1','2','3','4','5','6','7','8','9','.','0','⌫'];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="seg" style={{ alignSelf: 'stretch', width: '100%' }}>
          <button onClick={() => setType('expense')} className={type === 'expense' ? 'active' : ''} style={{ flex: 1, color: type === 'expense' ? 'var(--expense)' : undefined }}>{t('home.expense')}</button>
          <button onClick={() => setType('income')}  className={type === 'income'  ? 'active' : ''} style={{ flex: 1, color: type === 'income'  ? 'var(--income)'  : undefined }}>{t('home.income')}</button>
        </div>
        <div style={{ background: 'var(--bg-warm)', border: '1px solid var(--border-soft)', borderRadius: 12, padding: '18px 20px', textAlign: 'right' }}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('home.amount')}</div>
          <div className="mono" style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.03em', color: type === 'income' ? 'var(--income)' : 'var(--expense)' }}>
            ${amount || '0.00'}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {keys.map(k => (
            <button key={k} onClick={() => press(k)} style={{
              padding: '14px 0', borderRadius: 10,
              background: 'var(--bg-warm)', border: '1px solid var(--border-soft)',
              fontSize: 18, fontWeight: 600, fontFamily: 'var(--mono)',
              color: 'var(--text)',
            }}>{k}</button>
          ))}
        </div>
        <button className="btn btn-primary btn-lg"><HI.check size={14} /> {t('home.saveTransaction')}</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="card">
          <label className="label">{t('home.category')}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(type === 'expense' ? HCE : HCI).slice(0, 9).map(c => (
              <button key={c} onClick={() => setCategory(c)}
                style={{
                  padding: '6px 12px', borderRadius: 9999,
                  background: category === c ? 'var(--accent-tint)' : 'var(--bg-warm)',
                  color: category === c ? 'var(--accent-text)' : 'var(--text-2)',
                  border: '1px solid ' + (category === c ? 'transparent' : 'var(--border-soft)'),
                  fontSize: 12, fontWeight: 600,
                }}>{c}</button>
            ))}
          </div>
        </div>
        <div className="card">
          <label className="label">{t('home.note')}</label>
          <input className="input" placeholder={t('home.optional')} />
          <div style={{ height: 12 }} />
          <label className="label">{t('home.date')}</label>
          <input className="input mono" defaultValue="2026-04-26" />
        </div>
        <SummaryStrip compact />
      </div>
    </div>
  );
}

function SummaryStrip({ compact }) {
  const { t } = window.I18n.useT();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
      <div className="card" style={{ padding: compact ? 14 : 18 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('home.todayNet')}</div>
        <div className="mono" style={{ fontSize: compact ? 22 : 28, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 4, color: 'var(--income)' }}>+$1,108.30</div>
        <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{t('home.entries')}</div>
      </div>
      <div className="card" style={{ padding: compact ? 14 : 18 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('home.thisMonth')}</div>
        <div className="mono" style={{ fontSize: compact ? 22 : 28, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 4 }}>$2,800.34</div>
        <div style={{ fontSize: 12, color: 'var(--income)', marginTop: 2 }}>{t('home.vsLast')}</div>
      </div>
      <div className="card" style={{ padding: compact ? 14 : 18 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('home.savingsRate')}</div>
        <div className="mono" style={{ fontSize: compact ? 22 : 28, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 4 }}>51%</div>
        <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 2 }}>{t('home.gradeA')}</div>
      </div>
    </div>
  );
}

function RecentMini() {
  const { t } = window.I18n.useT();
  const list = HOME_TX.slice(0, 5);
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">{t('home.recentActivity')}</div>
        <button className="btn btn-ghost" style={{ fontSize: 13 }}>{t('home.viewAll')} <HI.arrow_right size={13} /></button>
      </div>
      {list.map(row => (
        <div key={row.id} style={{ display: 'grid', gridTemplateColumns: '32px 1fr auto', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-soft)' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, display: 'grid', placeItems: 'center', background: row.type === 'income' ? 'var(--income-tint)' : 'var(--expense-tint)', color: row.type === 'income' ? 'var(--income)' : 'var(--expense)' }}>
            {row.type === 'income' ? <HI.arrow_down size={14} /> : <HI.arrow_up size={14} />}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{row.category}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{row.note || '—'} · {hrd(row.date)}</div>
          </div>
          <div className="mono" style={{ fontSize: 13, fontWeight: 600, color: row.type === 'income' ? 'var(--income)' : 'var(--expense)' }}>
            {row.type === 'income' ? '+' : '−'}${row.amount.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
}

function PageHome({ variation }) {
  const { t } = window.I18n.useT();
  const [type, setType] = React.useState('expense');
  const [amount, setAmount] = React.useState('84.20');
  const [category, setCategory] = React.useState('Groceries');
  const shared = { type, setType, amount, setAmount, category, setCategory };

  return (
    <div className="page">
      <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>{t('home.welcomeBack')}</h2>
          <div style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 4 }}>{t('home.subtitle')}</div>
        </div>
        <span className="pill"><span className="dot" /> {t('home.layout')}: <b style={{ marginLeft: 4, textTransform: 'capitalize' }}>{variation}</b></span>
      </div>

      {variation === 'split'  && <HomeSplit  shared={shared} />}
      {variation === 'hero'   && <HomeHero   shared={shared} />}
      {variation === 'calc'   && <HomeCalc   shared={shared} />}
    </div>
  );
}

window.PageHome = PageHome;
