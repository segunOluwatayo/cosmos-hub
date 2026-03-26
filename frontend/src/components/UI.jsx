// LoadingSpinner
export function LoadingSpinner({ label = 'LOADING...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '16px' }}
      className="animate-fade-in">
      <div style={{ position: 'relative', width: '40px', height: '40px' }}>
        <div style={{ position: 'absolute', inset: 0, border: '1px solid #262626' }} />
        <div style={{
          position: 'absolute', inset: 0,
          border: '1px solid transparent',
          borderTopColor: '#FF8C00',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
      <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: '#444', letterSpacing: '0.2em' }}>{label}</p>
    </div>
  );
}

// ErrorMessage 
export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="t-card animate-fade-in" style={{ padding: '32px', maxWidth: '480px', margin: '0 auto', textAlign: 'center', borderColor: 'rgba(255,51,51,0.3)' }}>
      <p className="t-label" style={{ color: '#FF3333', marginBottom: '12px' }}>// TRANSMISSION ERROR</p>
      <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: '#666', lineHeight: 1.7, marginBottom: '20px' }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="t-btn">↺ Retry</button>
      )}
    </div>
  );
}

// EmptyState 
export function EmptyState({ title = 'NO DATA', message }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 0' }} className="animate-fade-in">
      <p className="t-label" style={{ marginBottom: '8px' }}>// {title}</p>
      {message && <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: '#444', marginTop: '8px' }}>{message}</p>}
    </div>
  );
}

// PageHeader 
export function PageHeader({ title, subtitle, badge, status = 'ONLINE' }) {
  return (
    <div className="animate-slide-up" style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <p className="t-label" style={{ marginBottom: '6px' }}>// {title}</p>
          {subtitle && (
            <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: '#555', lineHeight: 1.6, maxWidth: '560px' }}>{subtitle}</p>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
          {badge && <span className="t-pill-amber">{badge}</span>}
          <span className="t-pill-green">
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00D46A', display: 'inline-block' }} />
            {status}
          </span>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #1a1a1a', marginTop: '16px' }} />
    </div>
  );
}

// StatCard 
export function StatCard({ label, value, sub, variant = 'default' }) {
  const valueColor = variant === 'amber' ? '#FF8C00' : variant === 'red' ? '#FF3333' : variant === 'green' ? '#00D46A' : '#F0E6D3';
  const borderColor = variant === 'amber' ? 'rgba(255,140,0,0.2)' : variant === 'red' ? 'rgba(255,51,51,0.2)' : '#262626';

  return (
    <div className="t-card" style={{ padding: '16px 20px', borderColor }}>
      <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: '#444', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</p>
      <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '24px', fontWeight: 700, color: valueColor, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: '#444', marginTop: '6px' }}>{sub}</p>}
    </div>
  );
}