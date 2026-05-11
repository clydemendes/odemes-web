// /auth — sign-in / sign-up. Renders full-bleed inside the browser viewport.

function GoogleMark({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.28-1.93-6.15-4.53H2.18v2.84A11 11 0 0012 23z"/>
      <path fill="#FBBC05" d="M5.85 14.11A6.6 6.6 0 015.5 12c0-.73.13-1.44.35-2.11V7.05H2.18A11 11 0 001 12c0 1.78.43 3.46 1.18 4.95l3.67-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.67 2.84C6.72 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}

function AppleMark({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M16.37 12.85c.02-2.4 1.96-3.55 2.05-3.6-1.12-1.63-2.86-1.86-3.48-1.88-1.48-.15-2.9.87-3.65.87-.76 0-1.92-.85-3.16-.83-1.62.02-3.13.95-3.97 2.4-1.7 2.94-.43 7.27 1.21 9.65.81 1.16 1.76 2.46 3 2.42 1.21-.05 1.66-.78 3.13-.78 1.45 0 1.88.78 3.16.75 1.31-.02 2.13-1.18 2.93-2.34.93-1.34 1.31-2.65 1.33-2.72-.03-.01-2.55-.98-2.58-3.88zM14.16 5.42c.66-.81 1.11-1.92.99-3.04-.96.04-2.13.65-2.81 1.45-.61.71-1.15 1.85-1.01 2.94 1.07.08 2.16-.55 2.83-1.35z"/>
    </svg>
  );
}


const AUTH_LANG_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
];

function AuthLangDropdown() {
  const { lang, setLang } = window.I18n.useT();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const current = AUTH_LANG_OPTIONS.find(l => l.code === lang) || AUTH_LANG_OPTIONS[0];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 12px', borderRadius: 8,
          background: 'transparent', border: '1px solid rgba(128,128,128,0.25)',
          fontSize: 13, fontWeight: 500, color: 'inherit', cursor: 'pointer',
        }}
      >
        <window.Icons.globe size={14} />
        {current.label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
          style={{ opacity: 0.5, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          background: 'var(--bg-warm, #fff)', border: '1px solid rgba(128,128,128,0.2)',
          borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          minWidth: 148, zIndex: 300, overflow: 'hidden',
        }}>
          {AUTH_LANG_OPTIONS.map((l, i) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '9px 14px', textAlign: 'left',
                background: lang === l.code ? 'var(--accent-tint)' : 'transparent',
                color: lang === l.code ? 'var(--accent-text)' : 'inherit',
                fontSize: 13, fontWeight: lang === l.code ? 600 : 400,
                borderBottom: i < AUTH_LANG_OPTIONS.length - 1 ? '1px solid rgba(128,128,128,0.12)' : 'none',
                cursor: 'pointer',
              }}
            >
              <span style={{ width: 14, display: 'flex', alignItems: 'center' }}>
                {lang === l.code && <window.Icons.check size={12} />}
              </span>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PageAuth({ onSignedIn }) {
  const { t } = window.I18n.useT();
  const [loading, setLoading] = React.useState(null);
  const [error, setError]     = React.useState(null);

  const signInWithGoogle = async () => {
    setLoading('google');
    setError(null);
    const { error } = await window.sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + window.location.pathname },
    });
    if (error) { setError(error.message); setLoading(null); }
  };

  return (
    <div className="auth-stage">
      {/* Left — marketing panel */}
      <aside className="auth-aside">
        <div className="auth-aside-top">
          <div className="auth-brand">
            <img src="assets/logo-white.png" alt="Odemes" />
          </div>
          <div className="auth-eyebrow">{t('auth.tagline')}</div>
          <h1 className="auth-headline">
            {t('auth.headline1')}<br/>
            {t('auth.headline2')}
          </h1>
          <p className="auth-lede" dangerouslySetInnerHTML={{ __html: t('auth.lede') }} />
        </div>

        <div className="auth-receipt" aria-hidden="true">
          <div className="ar-row"><span>April 2026</span><span className="mono">$2,800.00 net</span></div>
          <div className="ar-bar"><div className="ar-bar-fill" style={{ width: '78%' }} /></div>
          <div className="ar-grade">
            <div className="ar-grade-letter">A</div>
            <div className="ar-grade-meta">
              <div style={{ fontSize: 13, fontWeight: 600 }}>{t('auth.onTrack')}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{t('auth.savedTarget')}</div>
            </div>
          </div>
          <div className="ar-line"><span>{t('auth.receiptIncome')}</span><span className="mono">+$5,420</span></div>
          <div className="ar-line"><span>{t('auth.receiptExpenses')}</span><span className="mono">−$2,620</span></div>
          <div className="ar-line ar-line-total"><span>{t('auth.receiptNet')}</span><span className="mono">+$2,800</span></div>
        </div>

      </aside>

      {/* Right — sign-in */}
      <section className="auth-main">
        <div className="auth-topnav">
          <div className="auth-brand-mob">
            <img src="assets/logo-black.png" alt="Odemes" className="logo-light" />
            <img src="assets/logo-white.png" alt="Odemes" className="logo-dark" />
          </div>
          <AuthLangDropdown />
        </div>

        <div className="auth-card">
          <div className="auth-card-head">
            <h2>{t('auth.welcomeBack')}</h2>
            <p>{t('auth.welcomeDesc')}</p>
          </div>

          <button className="auth-oauth" onClick={signInWithGoogle} disabled={loading !== null}>
            {loading === 'google' ? <span className="auth-spin" /> : <GoogleMark />}
            <span>{loading === 'google' ? t('auth.connecting') : t('auth.continueGoogle')}</span>
          </button>

          <button className="auth-oauth auth-oauth-apple" disabled style={{ opacity: 0.45, cursor: 'not-allowed' }}>
            <AppleMark />
            <span>{t('auth.continueApple')}</span>
            <span style={{
              marginLeft: 'auto', padding: '2px 8px', borderRadius: 9999,
              background: 'var(--bg-warm-2, rgba(128,128,128,0.15))',
              fontSize: 10, fontWeight: 600, letterSpacing: '0.05em',
              textTransform: 'uppercase', color: 'var(--text-3)',
            }}>{t('auth.soon')}</span>
          </button>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-3)', marginTop: 10 }}>
            Apple Sign In is coming soon.
          </p>

          {error && (
            <div style={{ fontSize: 13, color: 'var(--expense)', background: 'var(--expense-tint)', padding: '10px 14px', borderRadius: 8, marginTop: 4 }}>
              {error}
            </div>
          )}
        </div>

        <footer className="auth-foot">
          <div className="auth-foot-left">
            <window.Icons.lock size={12} /> {t('auth.ssl')}
          </div>
          <div className="auth-foot-right">
            <a href="#" onClick={(e) => e.preventDefault()}>{t('auth.help')}</a>
            <a href="#" onClick={(e) => e.preventDefault()}>{t('auth.privacyLink')}</a>
            <a href="#" onClick={(e) => e.preventDefault()}>{t('auth.termsLink')}</a>
          </div>
        </footer>
      </section>
    </div>
  );
}

window.PageAuth = PageAuth;
