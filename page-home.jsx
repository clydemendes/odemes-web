// /home — three layout variations, live Supabase data
const { Icons: HI } = window;

const LANG_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
];

const NOTES_STORAGE_KEY = 'odemes_recent_notes';
const CHIPS_DEFAULT = 5;
const CHIPS_MAX = 9;

function loadRecentNotes() {
  try { return JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function saveRecentNotes(notes) {
  try { localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes)); } catch {}
}

function LangDropdown() {
  const { lang, setLang } = window.I18n.useT();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);
  const current = LANG_OPTIONS.find(l => l.code === lang) || LANG_OPTIONS[0];
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <HI.globe size={14} />{current.label}
        <HI.arrow_down size={12} style={{ opacity: 0.5, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: 'var(--bg-warm)', border: '1px solid var(--border-soft)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 148, zIndex: 200, overflow: 'hidden' }}>
          {LANG_OPTIONS.map((l, i) => (
            <button key={l.code} onClick={() => { setLang(l.code); setOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', textAlign: 'left', background: lang === l.code ? 'var(--accent-tint)' : 'transparent', color: lang === l.code ? 'var(--accent-text)' : 'var(--text)', fontSize: 13, fontWeight: lang === l.code ? 600 : 400, borderBottom: i < LANG_OPTIONS.length - 1 ? '1px solid var(--border-soft)' : 'none' }}>
              <span style={{ width: 14, display: 'flex', alignItems: 'center' }}>{lang === l.code && <HI.check size={12} />}</span>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function homeRelDate(dateStr) {
  if (!dateStr) return '';
  const s = dateStr.length > 10 ? dateStr.slice(0, 10) : dateStr;
  const d = new Date(s + 'T00:00:00');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.round((d - today) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === -1) return 'Yesterday';
  if (diff < 0 && diff > -6) return `${-diff}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Note input with autocomplete + recent history chips
function NoteInputWithHistory({ note, setNote, recentNotes, type, inputStyle, wrapStyle }) {
  const [showMore, setShowMore] = React.useState(false);
  const [focused, setFocused]   = React.useState(false);

  const query = note.trim().toLowerCase();

  // Matches while typing — exclude exact match
  const matches = query.length > 0
    ? recentNotes.filter(n => n.toLowerCase().includes(query) && n.trim().toLowerCase() !== query)
    : [];

  // Static recent chips when input is empty
  const chipsVisible = showMore ? recentNotes.slice(0, CHIPS_MAX) : recentNotes.slice(0, CHIPS_DEFAULT);
  const hasMore = !showMore && recentNotes.length > CHIPS_DEFAULT;

  const showDropdown = focused && matches.length > 0;
  const showChips    = query.length === 0 && recentNotes.length > 0;

  const placeholder = type === 'income'
    ? 'Salary, freelance, gift…'
    : 'Coffee, groceries, rent…';

  return (
    <div style={{ position: 'relative', ...wrapStyle }}>
      <input
        className="input"
        placeholder={placeholder}
        value={note}
        onChange={e => setNote(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 160)}
        autoComplete="off"
        style={inputStyle}
      />

      {/* Autocomplete dropdown */}
      {showDropdown && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 60,
          background: 'var(--bg)', border: '1px solid var(--border)',
          borderRadius: 10, boxShadow: 'var(--shadow-deep)', overflow: 'hidden',
        }}>
          {matches.slice(0, 5).map((m, i) => (
            <button
              key={m}
              onMouseDown={() => setNote(m)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', textAlign: 'left',
                padding: '9px 13px',
                fontSize: 13, color: 'var(--text)',
                borderBottom: i < Math.min(matches.length, 5) - 1 ? '1px solid var(--border-soft)' : 'none',
                transition: 'background 80ms ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-warm)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <HI.zap size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              {m}
            </button>
          ))}
        </div>
      )}

      {/* Recent chips */}
      {showChips && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
          {chipsVisible.map(chip => (
            <button
              key={chip}
              onClick={() => setNote(chip)}
              style={{
                padding: '3px 10px', borderRadius: 9999,
                background: 'var(--bg-warm)',
                color: 'var(--text-2)',
                border: '1px solid var(--border-soft)',
                fontSize: 12, fontWeight: 500,
                whiteSpace: 'nowrap',
                maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis',
              }}
            >
              {chip}
            </button>
          ))}
          {hasMore && (
            <button
              onClick={() => setShowMore(true)}
              style={{
                padding: '3px 10px', borderRadius: 9999,
                background: 'transparent',
                color: 'var(--accent-text)',
                border: '1px solid var(--border-soft)',
                fontSize: 12, fontWeight: 600,
              }}
            >
              See more
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function EntryFormSplit({ shared }) {
  const { t } = window.I18n.useT();
  const { type, setType, amount, setAmount, note, setNote, date, setDate, saving, saveError, saved, handleSave, recentNotes } = shared;
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="card-head" style={{ marginBottom: 0 }}>
        <div className="card-title">{t('home.newTransaction')}</div>
        <span className="card-sub mono">{homeRelDate(date)}</span>
      </div>
      {saveError && <div style={{ padding: '8px 12px', background: 'var(--expense-tint)', color: 'var(--expense)', borderRadius: 8, fontSize: 13 }}>{saveError}</div>}
      {saved && <div style={{ padding: '8px 12px', background: 'var(--income-tint)', color: 'var(--income)', borderRadius: 8, fontSize: 13 }}>Saved ✓</div>}
      <div className="seg" style={{ width: '100%' }}>
        <button onClick={() => setType('expense')} className={type === 'expense' ? 'active' : ''} style={{ flex: 1, color: type === 'expense' ? 'var(--expense)' : undefined }}>{t('home.expense')}</button>
        <button onClick={() => setType('income')}  className={type === 'income'  ? 'active' : ''} style={{ flex: 1, color: type === 'income'  ? 'var(--income)'  : undefined }}>{t('home.income')}</button>
      </div>
      <div style={{ border: `1.5px solid ${type === 'income' ? 'var(--income)' : 'var(--expense)'}`, borderRadius: 12, padding: '20px 22px', display: 'flex', alignItems: 'baseline', gap: 4, background: 'var(--bg)' }}>
        <span className="mono" style={{ fontSize: 22, color: 'var(--text-3)', fontWeight: 500 }}>$</span>
        <input value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.00" className="mono"
          style={{ flex: 1, border: 0, outline: 'none', background: 'transparent', fontSize: 36, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text)', padding: 0 }} />
        <span className="mono" style={{ fontSize: 12, color: 'var(--text-3)' }}>USD</span>
      </div>
      <div>
        <label className="label">{t('home.note')}</label>
        <NoteInputWithHistory note={note} setNote={setNote} recentNotes={recentNotes} type={type} />
      </div>
      <div>
        <label className="label">{t('home.date')}</label>
        <input className="input mono" type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>
      <button className="btn btn-primary" onClick={handleSave} disabled={saving || !amount}>
        <HI.check size={14} /> {saving ? '…' : t('home.save')}
      </button>
    </div>
  );
}

function SummaryStrip({ compact, todayNet, monthNet, savingsRate }) {
  const { t } = window.I18n.useT();
  const fmt = (n) => `${n >= 0 ? '+' : '−'}$${Math.abs(n).toFixed(2)}`;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
      <div className="card" style={{ padding: compact ? 14 : 18 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('home.todayNet')}</div>
        <div className="mono" style={{ fontSize: compact ? 22 : 28, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 4, color: todayNet >= 0 ? 'var(--income)' : 'var(--expense)' }}>{fmt(todayNet)}</div>
        <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{t('home.entries')}</div>
      </div>
      <div className="card" style={{ padding: compact ? 14 : 18 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('home.thisMonth')}</div>
        <div className="mono" style={{ fontSize: compact ? 22 : 28, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 4, color: monthNet >= 0 ? 'var(--income)' : 'var(--expense)' }}>{fmt(monthNet)}</div>
      </div>
      <div className="card" style={{ padding: compact ? 14 : 18 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('home.savingsRate')}</div>
        <div className="mono" style={{ fontSize: compact ? 22 : 28, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 4 }}>{savingsRate}%</div>
        {savingsRate >= 20 && <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 2 }}>{t('home.gradeA')}</div>}
      </div>
    </div>
  );
}

function RecentMini({ txData, setPage }) {
  const { t } = window.I18n.useT();
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">{t('home.recentActivity')}</div>
        <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => setPage && setPage('transactions')}>
          {t('home.viewAll')} <HI.arrow_right size={13} />
        </button>
      </div>
      {txData.length === 0 ? (
        <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>No transactions yet</div>
      ) : txData.map(row => (
        <div key={row.id} style={{ display: 'grid', gridTemplateColumns: '32px 1fr auto', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-soft)' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, display: 'grid', placeItems: 'center', background: row.type === 'income' ? 'var(--income-tint)' : 'var(--expense-tint)', color: row.type === 'income' ? 'var(--income)' : 'var(--expense)' }}>
            {row.type === 'income' ? <HI.arrow_down size={14} /> : <HI.arrow_up size={14} />}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {row.note || row.category || '—'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
              {homeRelDate(row.date || row.timestamp?.slice(0, 10))}
            </div>
          </div>
          <div className="mono" style={{ fontSize: 13, fontWeight: 600, color: row.type === 'income' ? 'var(--income)' : 'var(--expense)' }}>
            {row.type === 'income' ? '+' : '−'}${row.amount.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
}

function HomeSplit({ shared, stats, recentTx, setPage }) {
  return (
    <div className="home-split-grid" style={{ display: 'grid', gap: 20, gridTemplateColumns: 'minmax(360px, 1.05fr) minmax(320px, 1fr)' }}>
      <EntryFormSplit shared={shared} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
        <SummaryStrip {...stats} />
        <RecentMini txData={recentTx} setPage={setPage} />
      </div>
    </div>
  );
}

function HomeHero({ shared, stats, recentTx, setPage }) {
  const { t } = window.I18n.useT();
  const { type, setType, amount, setAmount, note, setNote, saving, saveError, saved, handleSave, recentNotes } = shared;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card" style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
        <div className="seg">
          <button onClick={() => setType('expense')} className={type === 'expense' ? 'active' : ''} style={{ color: type === 'expense' ? 'var(--expense)' : undefined }}>{t('home.expense')}</button>
          <button onClick={() => setType('income')}  className={type === 'income'  ? 'active' : ''} style={{ color: type === 'income'  ? 'var(--income)'  : undefined }}>{t('home.income')}</button>
        </div>
        {saveError && <div style={{ padding: '8px 16px', background: 'var(--expense-tint)', color: 'var(--expense)', borderRadius: 8, fontSize: 13 }}>{saveError}</div>}
        {saved && <div style={{ padding: '8px 16px', background: 'var(--income-tint)', color: 'var(--income)', borderRadius: 8, fontSize: 13 }}>Saved ✓</div>}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="mono" style={{ fontSize: 56, color: 'var(--text-3)', fontWeight: 500, lineHeight: 1 }}>$</span>
          <input value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.00" className="mono"
            style={{ border: 0, outline: 'none', background: 'transparent', fontSize: 96, fontWeight: 700, letterSpacing: '-0.04em', color: type === 'income' ? 'var(--income)' : 'var(--text)', width: 'min(540px, 60vw)', textAlign: 'center', padding: 0, lineHeight: 1 }} />
        </div>
        <NoteInputWithHistory
          note={note} setNote={setNote} recentNotes={recentNotes} type={type}
          wrapStyle={{ width: 'min(480px, 90%)' }}
          inputStyle={{ textAlign: 'center' }}
        />
        <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving || !amount}>
          <HI.check size={14} /> {saving ? '…' : t('home.save')}
        </button>
      </div>
      <SummaryStrip {...stats} />
      <RecentMini txData={recentTx} setPage={setPage} />
    </div>
  );
}

function HomeCalc({ shared, stats }) {
  const { t } = window.I18n.useT();
  const { type, setType, amount, setAmount, note, setNote, saving, saveError, saved, handleSave, recentNotes } = shared;
  const press = (k) => {
    if (k === '⌫') return setAmount(amount.slice(0, -1));
    if (k === '.' && amount.includes('.')) return;
    setAmount(amount + k);
  };
  const keys = ['1','2','3','4','5','6','7','8','9','.','0','⌫'];
  return (
    <div className="home-calc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="seg" style={{ alignSelf: 'stretch', width: '100%' }}>
          <button onClick={() => setType('expense')} className={type === 'expense' ? 'active' : ''} style={{ flex: 1, color: type === 'expense' ? 'var(--expense)' : undefined }}>{t('home.expense')}</button>
          <button onClick={() => setType('income')}  className={type === 'income'  ? 'active' : ''} style={{ flex: 1, color: type === 'income'  ? 'var(--income)'  : undefined }}>{t('home.income')}</button>
        </div>
        {(saveError || saved) && (
          <div style={{ padding: '8px 12px', background: saveError ? 'var(--expense-tint)' : 'var(--income-tint)', color: saveError ? 'var(--expense)' : 'var(--income)', borderRadius: 8, fontSize: 13 }}>
            {saveError || 'Saved ✓'}
          </div>
        )}
        <div style={{ background: 'var(--bg-warm)', border: '1px solid var(--border-soft)', borderRadius: 12, padding: '18px 20px', textAlign: 'right' }}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('home.amount')}</div>
          <div className="mono" style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.03em', color: type === 'income' ? 'var(--income)' : 'var(--expense)' }}>
            ${amount || '0.00'}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {keys.map(k => (
            <button key={k} onClick={() => press(k)} style={{ padding: '14px 0', borderRadius: 10, background: 'var(--bg-warm)', border: '1px solid var(--border-soft)', fontSize: 18, fontWeight: 600, fontFamily: 'var(--mono)', color: 'var(--text)' }}>{k}</button>
          ))}
        </div>
        <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving || !amount}>
          <HI.check size={14} /> {saving ? '…' : t('home.saveTransaction')}
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="card">
          <label className="label">{t('home.note')}</label>
          <NoteInputWithHistory note={note} setNote={setNote} recentNotes={recentNotes} type={type} />
        </div>
        <SummaryStrip {...stats} compact />
      </div>
    </div>
  );
}

function PageHome({ variation, user, setPage }) {
  const { t, lang } = window.I18n.useT();
  const firstName = React.useMemo(() => {
    const name = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || '';
    return name.trim().split(/\s+/)[0] || '';
  }, [user]);

  const [type, setType]     = React.useState('expense');
  const [amount, setAmount] = React.useState('');
  const [note, setNote]     = React.useState('');
  const [date, setDate]     = React.useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; });
  const [saving, setSaving]       = React.useState(false);
  const [saveError, setSaveError] = React.useState(null);
  const [saved, setSaved]         = React.useState(false);

  const [recentNotes, setRecentNotes] = React.useState(loadRecentNotes);
  const [recentTx, setRecentTx] = React.useState([]);
  const [monthTx, setMonthTx]   = React.useState([]);

  function addRecentNote(text) {
    if (!text.trim()) return;
    const updated = [text.trim(), ...recentNotes.filter(n => n !== text.trim())].slice(0, 20);
    setRecentNotes(updated);
    saveRecentNotes(updated);
  }

  React.useEffect(() => {
    if (!user) return;
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    window.sb
      .from('transactions')
      .select('*')
      .order('timestamp', { ascending: false })
      .then(({ data }) => {
        const all = data || [];
        setRecentTx(all.slice(0, 5));
        setMonthTx(all.filter(r => (r.date || '').startsWith(monthStr)));
      });
  }, [user]);

  async function handleSave() {
    const amt = parseFloat(amount);
    if (!amt) { setSaveError('Amount is required.'); return; }
    setSaving(true); setSaveError(null);
    const category = note.trim() || (type === 'income' ? 'Income' : 'Expense');
    const { data, error } = await window.sb
      .from('transactions')
      .insert({
        user_id: user.id,
        type, amount: amt,
        category,
        note: note.trim(),
        date,
        timestamp: new Date(date + 'T00:00:00').toISOString(),
        currency: 'USD',
        is_recurring: false,
      })
      .select().single();
    setSaving(false);
    if (error) { setSaveError(error.message); return; }
    if (note.trim()) addRecentNote(note.trim());
    setRecentTx(prev => [data, ...prev].slice(0, 5));
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    if ((data.date || '').startsWith(monthStr)) setMonthTx(prev => [...prev, data]);
    setAmount(''); setNote('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const _localeMap = { en: 'en-US', pt: 'pt-PT', es: 'es-ES', fr: 'fr-FR' };
  const _todayDayDate = new Date().toLocaleDateString(_localeMap[lang] || 'en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const todayStr  = new Date().toISOString().slice(0, 10);
  const todayTx   = monthTx.filter(r => r.date === todayStr);
  const todayNet  = todayTx.reduce((s, r) => s + (r.type === 'income' ? r.amount : -r.amount), 0);
  const monthInc  = monthTx.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
  const monthExp  = monthTx.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
  const monthNet  = monthInc - monthExp;
  const savingsRate = monthInc > 0 ? Math.round((monthNet / monthInc) * 100) : 0;

  const stats  = { todayNet, monthNet, savingsRate };
  const shared = { type, setType, amount, setAmount, note, setNote, date, setDate, saving, saveError, saved, handleSave, recentNotes };

  return (
    <div className="page">
      <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>{t('home.welcomeBack')}{firstName ? `, ${firstName}` : ''}</h2>
          <div style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 4 }}>{`${_todayDayDate} · ${t('home.subtitle')}`}</div>
        </div>
        <LangDropdown />
      </div>

      {variation === 'split' && <HomeSplit shared={shared} stats={stats} recentTx={recentTx} setPage={setPage} />}
      {variation === 'hero'  && <HomeHero  shared={shared} stats={stats} recentTx={recentTx} setPage={setPage} />}
      {variation === 'calc'  && <HomeCalc  shared={shared} stats={stats} />}
    </div>
  );
}

window.PageHome = PageHome;
