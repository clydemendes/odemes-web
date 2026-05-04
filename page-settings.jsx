// /settings
const { Icons: SI } = window;

function Row({ title, sub, control }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center',
      padding: '14px 0', borderBottom: '1px solid var(--border-soft)',
    }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>}
      </div>
      <div>{control}</div>
    </div>
  );
}

function PageSettings({ tweaks, setTweak }) {
  const { t, lang, setLang } = window.I18n.useT();

  const Toggle = ({ on, onClick }) => (
    <button onClick={onClick} className={`toggle ${on ? 'on' : ''}`} aria-pressed={on} />
  );

  return (
    <div className="page">
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>{t('settings.title')}</h2>
        <div style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 4 }}>{t('settings.subtitle')}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{t('settings.accountSection')}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--border-soft)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))', color: '#fff', fontWeight: 700, display: 'grid', placeItems: 'center' }}>JM</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>Julia Méndez</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{t('settings.joinedInfo')}</div>
            </div>
            <button className="btn btn-secondary">{t('settings.editBtn')}</button>
          </div>
          <Row title={t('settings.currency')} sub={t('settings.currencySub')} control={
            <select className="input" defaultValue="USD" style={{ width: 120 }}>
              <option>USD</option><option>EUR</option><option>GBP</option><option>JPY</option><option>BRL</option>
            </select>
          } />
          <Row title={t('settings.language')} control={
            <select
              className="input"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              style={{ width: 140 }}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="pt">Português</option>
              <option value="fr">Français</option>
            </select>
          } />
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '14px 0 6px' }}>{t('settings.appearance')}</div>
          <Row title={t('settings.darkMode')} sub={t('settings.darkModeSub')} control={<Toggle on={tweaks.theme === 'dark'} onClick={() => setTweak('theme', tweaks.theme === 'dark' ? 'light' : 'dark')} />} />
          <Row title={t('settings.reminderTime')} sub={t('settings.reminderSub')} control={
            <input className="input mono" defaultValue="09:00" style={{ width: 100 }} />
          } />
        </div>

        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{t('settings.dataSection')}</div>
          <Row title={t('settings.exportCsv')} sub={t('settings.exportSub')} control={<button className="btn btn-secondary"><SI.download size={14} /> {t('settings.exportBtn')}</button>} />
          <Row title={t('settings.importCsv')} sub={t('settings.importSub')} control={<button className="btn btn-secondary"><SI.upload size={14} /> {t('settings.importBtn')}</button>} />
          <Row title={t('settings.backup')}    sub={t('settings.backupSub')} control={<span className="pill income"><SI.check size={11} /> {t('settings.backupOn')}</span>} />
          <Row title={t('settings.deleteAll')} sub={t('settings.deleteAllSub')} control={<button className="btn btn-danger"><SI.trash size={14} /> {t('settings.deleteBtn')}</button>} />
        </div>

        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{t('settings.securitySection')}</div>
          <Row title={t('settings.emailRow')} control={<span style={{ fontSize: 13, color: 'var(--text-2)' }} className="mono">julia@odemes.com</span>} />
          <Row title={t('settings.signInMethod')} sub={t('settings.signInMethodSub')} control={<span className="pill"><span className="dot" /> {t('settings.google')}</span>} />
          <Row title={t('settings.twoFactor')}    sub={t('settings.twoFactorSub')}   control={<button className="btn btn-secondary">{t('settings.enableBtn')}</button>} />
          <Row title={t('settings.signOutEverywhere')} sub={t('settings.signOutSub')} control={<button className="btn btn-secondary"><SI.logout size={14} /> {t('settings.signOutBtn')}</button>} />
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-soft)', fontSize: 12, color: 'var(--text-3)' }}>
            {t('settings.version')}
          </div>
        </div>
      </div>
    </div>
  );
}

window.PageSettings = PageSettings;
