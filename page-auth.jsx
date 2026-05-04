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

function FieldEye({ visible, onToggle, t }) {
  return (
    <button type="button" className="auth-eye" onClick={onToggle} aria-label={visible ? t('auth.hidePassword') : t('auth.showPassword')}>
      {visible
        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 002.8 2.8"/><path d="M9.9 5.1A10.4 10.4 0 0112 5c5.5 0 9 5 9 7 0 .9-.7 2.1-1.8 3.3M6.6 6.6C4.2 8 3 10.3 3 12c0 2 3.5 7 9 7 1.6 0 3-.4 4.2-1"/></svg>
        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>}
    </button>
  );
}

function PageAuth({ onSignedIn }) {
  const { t } = window.I18n.useT();
  const [mode, setMode] = React.useState('signin');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [agree, setAgree] = React.useState(false);
  const [loading, setLoading] = React.useState(null);

  const isSignup = mode === 'signup';
  const valid = /\S+@\S+\.\S+/.test(email) && password.length >= 6 && (!isSignup || (name.trim().length > 1 && agree));

  const submit = (e) => {
    e && e.preventDefault();
    if (!valid) return;
    setLoading('email');
    setTimeout(() => { setLoading(null); onSignedIn && onSignedIn(); }, 800);
  };

  const google = () => {
    setLoading('google');
    setTimeout(() => { setLoading(null); onSignedIn && onSignedIn(); }, 700);
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
          <div className="ar-line">
            <span>{t('auth.receiptIncome')}</span><span className="mono">+$5,420</span>
          </div>
          <div className="ar-line">
            <span>{t('auth.receiptExpenses')}</span><span className="mono">−$2,620</span>
          </div>
          <div className="ar-line ar-line-total">
            <span>{t('auth.receiptNet')}</span><span className="mono">+$2,800</span>
          </div>
        </div>

        <div className="auth-aside-foot">
          <span className="dot-tiny"/> {t('auth.trusted')}
        </div>
      </aside>

      {/* Right — form */}
      <section className="auth-main">
        <div className="auth-topnav">
          <div className="auth-brand-mob">
            <img src="assets/logo-black.png" alt="Odemes" className="logo-light" />
            <img src="assets/logo-white.png" alt="Odemes" className="logo-dark" />
          </div>
          <div className="auth-toggle" role="tablist">
            <button role="tab" aria-selected={!isSignup} className={!isSignup ? 'on' : ''} onClick={() => setMode('signin')}>{t('auth.signIn')}</button>
            <button role="tab" aria-selected={isSignup} className={isSignup ? 'on' : ''} onClick={() => setMode('signup')}>{t('auth.signUp')}</button>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-head">
            <h2>{isSignup ? t('auth.createAccount') : t('auth.welcomeBack')}</h2>
            <p>{isSignup ? t('auth.createDesc') : t('auth.welcomeDesc')}</p>
          </div>

          <button className="auth-oauth" onClick={google} disabled={loading !== null}>
            {loading === 'google'
              ? <span className="auth-spin" />
              : <GoogleMark />}
            <span>{loading === 'google' ? t('auth.connecting') : t('auth.continueGoogle')}</span>
          </button>
          <button className="auth-oauth auth-oauth-apple" disabled>
            <AppleMark />
            <span>{t('auth.continueApple')}</span>
            <span className="auth-soon">{t('auth.soon')}</span>
          </button>

          <div className="auth-or"><span>{t('auth.orEmail')}</span></div>

          <form onSubmit={submit} className="auth-form" noValidate>
            {isSignup && (
              <label className="auth-field">
                <span>{t('auth.fullName')}</span>
                <input
                  type="text"
                  autoComplete="name"
                  placeholder={t('auth.fullNamePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>
            )}

            <label className="auth-field">
              <span>{t('auth.email')}</span>
              <input
                type="email"
                autoComplete="email"
                placeholder={t('auth.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="auth-field">
              <span>
                {t('auth.password')}
                {!isSignup && <a href="#" className="auth-tiny-link" onClick={(e) => e.preventDefault()}>{t('auth.forgot')}</a>}
              </span>
              <div className="auth-field-wrap">
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  placeholder={isSignup ? t('auth.atLeast6') : '••••••••'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <FieldEye visible={showPw} onToggle={() => setShowPw(!showPw)} t={t} />
              </div>
              {isSignup && (
                <div className="auth-pw-meter" data-strength={
                  password.length >= 12 ? 'strong' :
                  password.length >= 8  ? 'good' :
                  password.length >= 6  ? 'fair' : 'weak'
                }>
                  <div /><div /><div /><div />
                </div>
              )}
            </label>

            {isSignup && (
              <label className="auth-check">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                <span>
                  {t('auth.agreePrefix')}{' '}
                  <a href="#" onClick={(e) => e.preventDefault()}>{t('auth.terms')}</a>
                  {' '}{t('auth.and')}{' '}
                  <a href="#" onClick={(e) => e.preventDefault()}>{t('auth.privacy')}</a>.
                </span>
              </label>
            )}

            <button type="submit" className="auth-submit" disabled={!valid || loading !== null}>
              {loading === 'email'
                ? <><span className="auth-spin auth-spin-light" /> {isSignup ? t('auth.creatingAccount') : t('auth.signingIn')}</>
                : (isSignup ? t('auth.createBtn') : t('auth.signInBtn'))}
            </button>
          </form>

          <div className="auth-switch">
            {isSignup
              ? <>{t('auth.alreadyHave')} <a href="#" onClick={(e) => { e.preventDefault(); setMode('signin'); }}>{t('auth.signIn')}</a></>
              : <>{t('auth.newToOdemes')} <a href="#" onClick={(e) => { e.preventDefault(); setMode('signup'); }}>{t('auth.createLink')}</a></>}
          </div>
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
