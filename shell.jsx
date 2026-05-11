// Browser frame + sidebar shell.
const { Icons } = window;

function BrowserChrome() {
  const { t } = window.I18n.useT();
  return (
    <div className="b-chrome">
      <div className="b-lights"><span /><span /><span /></div>
      <div className="b-tabs">
        <div className="b-tab">
          <img src="assets/logo-black.png" alt="" className="logo-light" />
          <img src="assets/logo-white.png" alt="" className="logo-dark" />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t('shell.tabTitle')}</span>
          <Icons.x size={11} />
        </div>
      </div>
      <div className="b-url">
        <Icons.lock size={11} />
        <span>app.odemes.com/<span style={{ color: 'var(--text)' }}>home</span></span>
      </div>
      <div className="b-actions">
        <Icons.download size={14} />
        <Icons.more size={14} />
      </div>
    </div>);
}

function userDisplayName(user) {
  return user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
}
function userInitials(user) {
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
  if (name.trim()) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
  }
  return (user?.email?.[0] || '?').toUpperCase();
}

function Sidebar({ page, setPage, user, txCount, recCount, open, onClose }) {
  const { t } = window.I18n.useT();
  const items = [
    { id: 'home',         label: t('nav.home'),         ico: 'home' },
    { id: 'transactions', label: t('nav.transactions'), ico: 'list',   pill: txCount  != null ? String(txCount)  : undefined },
    { id: 'recurring',    label: t('nav.recurring'),    ico: 'repeat', pill: recCount != null ? String(recCount) : undefined },
    { id: 'report',       label: t('nav.report'),       ico: 'chart' },
  ];

  const handleNav = (id) => { setPage(id); if (onClose && window.innerWidth <= 768) onClose(); };

  return (
    <aside className={`side${open ? ' side--open' : ' side--closed'}`}>
      <div className="side-brand">
        <img src="assets/logo-black.png" alt="Odemes" className="logo-light" />
        <img src="assets/logo-white.png" alt="Odemes" className="logo-dark" />
        <button className="side-close-btn" onClick={onClose} aria-label="Close menu">
          <Icons.x size={16} />
        </button>
      </div>

      <div className="side-section">{t('shell.workspace')}</div>
      {items.map((it) => {
        const Ico = Icons[it.ico];
        return (
          <button key={it.id} className={`side-item ${page === it.id ? 'active' : ''}`} onClick={() => handleNav(it.id)}>
            <Ico className="ico" />
            <span>{it.label}</span>
            {it.pill && <span className="pill">{it.pill}</span>}
          </button>);
      })}

      <div className="side-section">{t('shell.account')}</div>
      <button className={`side-item ${page === 'settings' ? 'active' : ''}`} onClick={() => handleNav('settings')}>
        <Icons.settings className="ico" />
        <span>{t('nav.settings')}</span>
      </button>

      <div className="side-spacer" />

      <div className="side-user">
        <div className="av">{userInitials(user)}</div>
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <div className="nm">{userDisplayName(user)}</div>
          <div className="em">{user?.email || ''}</div>
        </div>
      </div>
    </aside>);
}

function TopBar({ title, sub, right, onMenuToggle }) {
  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <button className="icon-btn" onClick={onMenuToggle} aria-label="Toggle sidebar" style={{ flexShrink: 0 }}>
          <Icons.menu size={18} />
        </button>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</h1>
          {sub && <div className="sub" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>}
        </div>
      </div>
      <div className="topbar-right">{right}</div>
    </div>);
}

// Theme + dark logo swap
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function applyAccent(hex) {
  const root = document.documentElement;
  root.style.setProperty('--accent', hex);
  const deep = mixHex(hex, '#000000', 0.18);
  root.style.setProperty('--accent-deep', deep);
  root.style.setProperty('--accent-tint', mixHex(hex, '#ffffff', 0.88));
  root.style.setProperty('--accent-text', mixHex(hex, '#000000', 0.28));
}
function hexToRgb(h) { h = h.replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); }
function rgbToHex(r, g, b) { return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join(''); }
function mixHex(a, b, w) {
  const [r1, g1, b1] = hexToRgb(a), [r2, g2, b2] = hexToRgb(b);
  return rgbToHex(
    Math.round(r1 * (1 - w) + r2 * w),
    Math.round(g1 * (1 - w) + g2 * w),
    Math.round(b1 * (1 - w) + b2 * w)
  );
}

window.AppShell = { BrowserChrome, Sidebar, TopBar, applyTheme, applyAccent };
