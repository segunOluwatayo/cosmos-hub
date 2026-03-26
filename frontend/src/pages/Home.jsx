import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apodApi } from '../services/api';

const MODULES = [
  {
    path: '/apod',
    code: 'SYS-A1',
    label: 'APOD',
    title: 'Astronomy Picture of the Day',
    desc: 'Browse NASA\'s daily space photography archive. Date browser, gallery mode, AI-generated analysis on each image.',
    status: 'NOMINAL',
    statusColor: '#00D46A',
  },
  {
    path: '/asteroids',
    code: 'SYS-N2',
    label: 'NEOWS',
    title: 'Near Earth Object Tracker',
    desc: 'Real-time asteroid surveillance. Proximity map, velocity charts, hazard classification, and AI threat briefings.',
    status: 'TRACKING',
    statusColor: '#FF8C00',
  },
  {
    path: '/mars',
    code: 'SYS-M3',
    label: 'MARS ROVERS',
    title: 'Surface Exploration Archive',
    desc: 'Search NASA\'s complete image archive for Mars surface photography. Curiosity, Perseverance, Spirit, Opportunity. AI scene analysis.',
    status: 'ACTIVE',
    statusColor: '#00D46A',
  },
  {
    path: '/epic',
    code: 'SYS-E4',
    label: 'EPIC',
    title: 'Earth Polychromatic Imagery',
    desc: 'Full-disc Earth imagery from the DSCOVR satellite at the L1 Lagrange point, 1.5 million km from Earth.',
    status: 'TRANSMITTING',
    statusColor: '#00D46A',
  },
];

function TypedText({ text, speed = 18 }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    setDisplayed('');
    const iv = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, ++i)); }
      else clearInterval(iv);
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span style={{ animation: 'blink 1s step-end infinite', color: '#FF8C00' }}>_</span>
      )}
    </span>
  );
}

function APODPreview() {
  const [apod, setApod] = useState(null);
  useEffect(() => { apodApi.getToday().then(setApod).catch(() => {}); }, []);
  if (!apod || apod.media_type !== 'image') return null;
  return (
    <div className="t-card" style={{ overflow: 'hidden', marginBottom: '32px' }}>
      <div style={{ position: 'relative' }}>
        <img src={apod.url} alt={apod.title} style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block', filter: 'brightness(0.5) sepia(0.2)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #080808 0%, transparent 50%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 20px' }}>
          <p className="t-label" style={{ marginBottom: '4px', fontSize: '8px' }}>APOD · {apod.date} · LATEST TRANSMISSION</p>
          <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '13px', fontWeight: 600, color: '#F0E6D3', lineHeight: 1.4 }}>{apod.title}</p>
        </div>
        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
          <Link to="/apod" className="t-btn" style={{ fontSize: '9px', padding: '5px 10px' }}>VIEW →</Link>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="animate-slide-up grid-bg" style={{ padding: '8px 0' }}>

      {/* Boot header */}
      <div style={{ marginBottom: '32px', padding: '20px 0 16px', borderBottom: '1px solid #1a1a1a' }}>
        <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: '#333', letterSpacing: '0.2em', marginBottom: '12px' }}>
          NASA DATA INTERFACE v2.4.1 · INITIALIZING...
        </p>
        <h1 style={{
          fontFamily: 'IBM Plex Mono', fontWeight: 700, fontSize: 'clamp(28px, 5vw, 48px)',
          color: '#FF8C00', letterSpacing: '0.08em', lineHeight: 1.1, marginBottom: '8px',
        }}>
          <TypedText text="COSMOSHUB" speed={60} />
        </h1>
        <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: '#444', letterSpacing: '0.1em' }}>
           CLASSIFIED · MISSION ARCHIVE · NASA OPEN API INTERFACE
        </p>
      </div>

      {/* System status row */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {[
          ['NASA API',  '#00D46A', 'CONNECTED'],
          ['APOD',      '#00D46A', 'ONLINE'],
          ['NEOWS',     '#00D46A', 'SCANNING'],
          ['MARS FEED', '#00D46A', 'ACTIVE'],
          ['EPIC SAT',  '#00D46A', 'TRANSMITTING'],
          ['CLAUDE AI', '#FF8C00', 'STANDBY'],
        ].map(([label, color, status]) => (
          <div key={label} className="t-pill" style={{ borderColor: `${color}30`, background: `${color}08`, color: '#555' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: color, display: 'inline-block' }} />
            <span style={{ color: '#444' }}>{label}</span>
            <span style={{ color }}>{status}</span>
          </div>
        ))}
      </div>

      {/* APOD Preview */}
      <APODPreview />

      {/* Module grid */}
      <div style={{ marginBottom: '8px' }}>
        <p className="t-label" style={{ marginBottom: '16px', fontSize: '8px', color: '#333' }}>// MISSION MODULES · SELECT TARGET</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1px', border: '1px solid #1a1a1a', marginBottom: '32px' }}>
        {MODULES.map((mod, i) => (
          <Link key={mod.path} to={mod.path} style={{ textDecoration: 'none' }}>
            <div className="t-card-hover" style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: '#333', letterSpacing: '0.1em' }}>{mod.code}</span>
                <span className="t-pill" style={{ borderColor: `${mod.statusColor}30`, color: mod.statusColor, background: `${mod.statusColor}08`, fontSize: '7px' }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: mod.statusColor, display: 'inline-block' }} />
                  {mod.status}
                </span>
              </div>
              <div>
                <p className="t-label" style={{ marginBottom: '4px' }}>{mod.label}</p>
                <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '12px', fontWeight: 600, color: '#C8B89A', marginBottom: '8px', lineHeight: 1.3 }}>{mod.title}</p>
                <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: '#444', lineHeight: 1.7 }}>{mod.desc}</p>
              </div>
              <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: '#333' }}>0{i + 1}/04</span>
                <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: '#FF8C00' }}>ENTER MODULE →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer strip */}
      <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: '#555', letterSpacing: '0.1em' }}>
          DATA SOURCE: api.nasa.gov · AI: Anthropic Claude · NOT AFFILIATED WITH NASA
        </p>
        <a href="https://api.nasa.gov" target="_blank" rel="noreferrer"
          style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: '#555', textDecoration: 'none' }}>
          api.nasa.gov ↗
        </a>
      </div>
    </div>
  );
}