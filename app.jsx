// Top-level app — routing, tweaks panel, theme/accent application.
const { Sidebar, TopBar, applyTheme, applyAccent } = window.AppShell;
const { TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakColor, TweakSelect, TweakToggle } = window;

function readDefaults() {
  try {
    const raw = document.getElementById('tweak-defaults').textContent;
    return JSON.parse(raw.replace('/*EDITMODE-BEGIN*/','').replace('/*EDITMODE-END*/',''));
  } catch (e) {
    return { theme: 'light', accent: '#F4622A', homeVariation: 'split', density: 'comfortable', page: 'home' };
  }
}

function NewTxnSplitButton({ onPick }) {
  const { t } = window.I18n.useT();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const pick = (kind) => { setOpen(false); onPick && onPick(kind); };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button className="btn btn-primary split-main" onClick={() => pick('expense')}>
        <window.Icons.plus size={14} /> {t('newTxn.new')}
      </button>
      <button
        className="btn btn-primary split-caret"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      {open && (
        <div role="menu" className="split-menu">
          <button role="menuitem" onClick={() => pick('expense')}>
            <span className="split-dot" style={{ background: 'var(--expense)' }} />
            <div>
              <div style={{ fontWeight: 600 }}>{t('newTxn.expense')}</div>
              <div className="split-sub">{t('newTxn.expenseSub')}</div>
            </div>
          </button>
          <button role="menuitem" onClick={() => pick('income')}>
            <span className="split-dot" style={{ background: 'var(--income)' }} />
            <div>
              <div style={{ fontWeight: 600 }}>{t('newTxn.income')}</div>
              <div className="split-sub">{t('newTxn.incomeSub')}</div>
            </div>
          </button>
          <button role="menuitem" onClick={() => pick('recurring')}>
            <span className="split-dot" style={{ background: 'var(--accent)' }} />
            <div>
              <div style={{ fontWeight: 600 }}>{t('newTxn.recurring')}</div>
              <div className="split-sub">{t('newTxn.recurringSub')}</div>
            </div>
          </button>
          <div className="split-divider" />
          <button role="menuitem" onClick={() => pick('import')}>
            <window.Icons.upload size={14} />
            <div style={{ fontWeight: 500 }}>{t('newTxn.importCsv')}</div>
          </button>
        </div>
      )}
    </div>
  );
}

function App() {
  const { t, lang } = window.I18n.useT();
  const defaults = React.useMemo(readDefaults, []);
  const [tweaks, setTweak] = useTweaks(defaults);
  const [page, setPage] = React.useState(defaults.page || 'home');
  const [authed, setAuthed] = React.useState(defaults.page !== 'auth');
  const [user, setUser] = React.useState(null);
  const [txCount, setTxCount] = React.useState(null);
  const [recCount, setRecCount] = React.useState(null);
  /** Bump seq so Transactions page can open the quick-add modal from the top bar without navigating away. */
  const [txQuickAdd, setTxQuickAdd] = React.useState({ seq: 0, kind: 'expense' });
  const [sidebarOpen, setSidebarOpen] = React.useState(() => window.innerWidth >= 768);

  React.useEffect(() => { applyTheme('dark'); }, []);
  React.useEffect(() => { applyAccent(tweaks.accent); }, [tweaks.accent]);
  React.useEffect(() => { document.documentElement.setAttribute('data-density', tweaks.density); }, [tweaks.density]);

  // Real Supabase auth state
  React.useEffect(() => {
    window.sb.auth.getSession().then(({ data: { session } }) => {
      if (session) { setAuthed(true); setUser(session.user); setPage(p => p === 'auth' ? 'home' : p); }
    });
    const { data: { subscription } } = window.sb.auth.onAuthStateChange((_event, session) => {
      if (session) { setAuthed(true); setUser(session.user); setPage(p => p === 'auth' ? 'home' : p); }
      else          { setAuthed(false); setUser(null); setPage('auth'); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const _localeMap = { en: 'en-US', pt: 'pt-PT', es: 'es-ES', fr: 'fr-FR' };
  const _todayDateStr = new Date().toLocaleDateString(_localeMap[lang] || 'en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const titles = {
    home:         { title: t('nav.home'),         sub: `${t('topbar.homeSub')} · ${_todayDateStr}` },
    transactions: { title: t('nav.transactions'), sub: t('topbar.transactionsSub') },
    recurring:    { title: t('nav.recurring'),    sub: t('topbar.recurringSub') },
    report:       { title: t('nav.report'),       sub: t('topbar.reportSub') },
    settings:     { title: t('nav.settings'),     sub: t('topbar.settingsSub') },
  };

  let content = null;
  if (page === 'home')         content = <window.PageHome variation={tweaks.homeVariation} user={user} setPage={setPage} />;
  if (page === 'transactions') content = <window.PageTransactions txQuickAdd={txQuickAdd} user={user} onCountChange={setTxCount} />;
  if (page === 'recurring')    content = <window.PageRecurring user={user} onCountChange={setRecCount} />;
  if (page === 'report')       content = <window.PageReport user={user} />;
  if (page === 'settings')     content = <window.PageSettings tweaks={tweaks} setTweak={setTweak} user={user} />;

  if (page === 'auth' || !authed) {
    return (
      <div className="stage">
        <div className="browser">
          <window.PageAuth onSignedIn={() => { setAuthed(true); setPage('home'); setTweak('page', 'home'); }} />
        </div>
        {renderTweaks()}
      </div>
    );
  }

  function renderTweaks() {
    return (
      <TweaksPanel title="Tweaks">
        <TweakSection label={t('tweaks.appearance')}>
          <TweakColor label={t('tweaks.accent')} value={tweaks.accent} onChange={(v) => setTweak('accent', v)} />
          <TweakRadio
            label={t('tweaks.density')}
            value={tweaks.density}
            onChange={(v) => setTweak('density', v)}
            options={[
              { value: 'comfortable', label: t('tweaks.comfortable') },
              { value: 'compact',     label: t('tweaks.compact') },
            ]}
          />
        </TweakSection>
        <TweakSection label={t('tweaks.homeLayout')}>
          <TweakRadio
            label={t('tweaks.variation')}
            value={tweaks.homeVariation}
            onChange={(v) => setTweak('homeVariation', v)}
            options={[
              { value: 'split', label: t('tweaks.split') },
              { value: 'hero',  label: t('tweaks.hero') },
              { value: 'calc',  label: t('tweaks.calculator') },
            ]}
          />
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{t('tweaks.layoutNote')}</div>
        </TweakSection>
        <TweakSection label={t('tweaks.navigate')}>
          <TweakSelect
            label={t('tweaks.page')}
            value={page}
            onChange={(v) => { setPage(v); if (v !== 'auth') setAuthed(true); }}
            options={[
              { value: 'auth',         label: t('tweaks.authPage') },
              { value: 'home',         label: t('nav.home') },
              { value: 'transactions', label: t('nav.transactions') },
              { value: 'recurring',    label: t('nav.recurring') },
              { value: 'report',       label: t('nav.report') },
              { value: 'settings',     label: t('nav.settings') },
            ]}
          />
          {authed && (
            <button className="btn btn-secondary" style={{ marginTop: 8, width: '100%' }} onClick={() => { window.sb.auth.signOut(); setAuthed(false); setPage('auth'); setTweak('page', 'auth'); }}>
              {t('tweaks.signOutPreview')}
            </button>
          )}
        </TweakSection>
      </TweaksPanel>
    );
  }

  return (
    <div className="stage">
      <div className="browser">
        <div
          className={`sidebar-backdrop${sidebarOpen ? ' open' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />
        <div className="app" style={{ gridTemplateColumns: sidebarOpen ? '232px 1fr' : '0px 1fr' }}>
          <Sidebar page={page} setPage={setPage} user={user} txCount={txCount} recCount={recCount}
            open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main style={{ minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <TopBar
              title={titles[page].title}
              sub={titles[page].sub}
              onMenuToggle={() => setSidebarOpen(o => !o)}
              right={<>
                {page !== 'home' && page !== 'transactions' && page !== 'recurring' && (
                  <NewTxnSplitButton
                    onPick={(k) => {
                      if (k === 'recurring') setPage('recurring');
                      else if (k === 'import') setPage('settings');
                      else setPage('home');
                    }}
                  />
                )}
              </>}
            />
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>{content}</div>
          </main>
        </div>
      </div>

      {renderTweaks()}
    </div>
  );
}

const { LangProvider } = window.I18n;
ReactDOM.createRoot(document.getElementById('root')).render(
  <LangProvider><App /></LangProvider>
);
