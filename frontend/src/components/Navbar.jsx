import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/',          label: 'MISSION CTRL', code: 'M0' },
  { path: '/apod',      label: 'APOD',         code: 'A1' },
  { path: '/asteroids', label: 'NEOWS',         code: 'N2' },
  { path: '/mars',      label: 'MARS',          code: 'M3' },
  { path: '/epic',      label: 'EPIC',          code: 'E4' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header style={{ background: 'rgba(8,8,8,0.96)', borderBottom: '1px solid #262626', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(8px)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '52px' }}>

          {/* Logo */}
          <Link to="/" onClick={() => setOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{
              width: '28px', height: '28px', border: '1px solid #FF8C00', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '10px',
              fontWeight: 700, color: '#FF8C00', fontFamily: 'IBM Plex Mono',
              flexShrink: 0,
            }}>⬡</div>
            <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', fontWeight: 700, letterSpacing: '0.25em', color: '#F0E6D3' }}>
              COSMOS<span style={{ color: '#FF8C00' }}>HUB</span>
              <span style={{ color: '#444', marginLeft: '8px', fontWeight: 400 }}>// NASA ARCHIVE</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', gap: '2px', alignItems: 'center' }} className="hidden md:flex">
            {NAV_ITEMS.map(({ path, label, code }) => (
              <NavLink key={path} to={path} end={path === '/'}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 12px',
                  fontFamily: 'IBM Plex Mono',
                  fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em',
                  textDecoration: 'none',
                  transition: 'all 0.1s',
                  color: isActive ? '#FF8C00' : '#555',
                  background: isActive ? 'rgba(255,140,0,0.08)' : 'transparent',
                  borderBottom: isActive ? '1px solid #FF8C00' : '1px solid transparent',
                })}>
                <span style={{ fontSize: '8px', color: '#FF8C0060' }}>{code}</span>
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Live indicator */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '6px', fontSize: '9px', fontFamily: 'IBM Plex Mono', color: '#444', letterSpacing: '0.1em' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00D46A', display: 'inline-block', animation: 'pulse-amber 2s ease-in-out infinite' }} />
            SYS ONLINE
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden" onClick={() => setOpen(o => !o)}
            style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
              {open
                ? <path d="M1 1l16 12M1 13L17 1" stroke="currentColor" strokeWidth="1.5"/>
                : <><path d="M0 1h18M0 7h18M0 13h18" stroke="currentColor" strokeWidth="1.5"/></>
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden animate-fade-in" style={{ borderTop: '1px solid #1a1a1a', background: '#080808' }}>
          {NAV_ITEMS.map(({ path, label, code }) => (
            <NavLink key={path} to={path} end={path === '/'} onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 24px',
                fontFamily: 'IBM Plex Mono', fontSize: '10px', fontWeight: 600,
                letterSpacing: '0.12em', textDecoration: 'none',
                color: isActive ? '#FF8C00' : '#555',
                borderLeft: isActive ? '2px solid #FF8C00' : '2px solid transparent',
                background: isActive ? 'rgba(255,140,0,0.05)' : 'transparent',
              })}>
              <span style={{ color: '#FF8C0050', fontSize: '8px' }}>{code}</span>
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}