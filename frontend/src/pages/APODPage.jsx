import { useState } from 'react';
import { apodApi, aiApi } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { LoadingSpinner, ErrorMessage, PageHeader } from '../components/UI';
import AIPanel from '../components/AIPanel';

const today    = new Date().toISOString().split('T')[0];
const sevenAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

// Classify a video URL so we know how to render it.
const getVideoType = (url) => {
  if (!url) return 'external';
  if (url.includes('youtube.com/embed') || url.includes('player.vimeo.com')) return 'iframe';
  if (url.match(/\.mp4(\?|$)/i)) return 'mp4';
  return 'external';
};

// YouTube embed → thumbnail image URL.
const getYouTubeThumb = (url) => {
  const match = url?.match(/youtube\.com\/embed\/([^?&]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
};

function APODCard({ data }) {
  const [expanded, setExpanded] = useState(false);
  const isVideo = data.media_type === 'video';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
      {/* Media */}
      <div className="t-card" style={{ overflow: 'hidden', padding: 0 }}>
        {isVideo ? (
          getVideoType(data.url) === 'iframe' ? (
            <iframe src={data.url} title={data.title} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
              style={{ width: '100%', height: '440px', border: 'none', display: 'block' }} />
          ) : getVideoType(data.url) === 'mp4' ? (
            <video src={data.url} controls style={{ width: '100%', maxHeight: '480px', display: 'block', background: '#0e0e0e' }} />
          ) : (
            <a href={data.url} target="_blank" rel="noreferrer"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '260px', background: '#141414', gap: '14px', textDecoration: 'none' }}>
              <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '36px', color: '#FF8C00' }}>▶</span>
              <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: '#FF8C00', letterSpacing: '0.15em', border: '1px solid #FF8C0044', padding: '6px 14px' }}>WATCH VIDEO ↗</span>
            </a>
          )
        ) : (
          <a href={data.hdurl || data.url} target="_blank" rel="noreferrer" style={{ display: 'block', position: 'relative' }}>
            <img src={data.url} alt={data.title} style={{ width: '100%', maxHeight: '560px', objectFit: 'contain', display: 'block', background: '#0e0e0e' }} />
            <span className="t-pill-amber" style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '8px' }}>HD ↗</span>
          </a>
        )}
      </div>

      {/* Info card */}
      <div className="t-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          <div>
            <p className="t-label" style={{ fontSize: '8px', marginBottom: '6px' }}>
              {data.date} · {isVideo ? 'VIDEO CONTENT' : 'PHOTOGRAPH'}
              {data.copyright ? ` · © ${data.copyright.trim()}` : ''}
            </p>
            <h2 style={{ fontFamily: 'IBM Plex Mono', fontSize: '18px', fontWeight: 700, color: '#F0E6D3', lineHeight: 1.3 }}>{data.title}</h2>
          </div>
          {isVideo && <span className="t-pill-amber">VIDEO</span>}
        </div>

        <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '14px' }}>
          <p style={{
            fontFamily: 'IBM Plex Mono', fontSize: '11px', color: '#777', lineHeight: 1.8,
            overflow: expanded ? 'visible' : 'hidden',
            display: '-webkit-box', WebkitBoxOrient: 'vertical',
            WebkitLineClamp: expanded ? 'unset' : 4,
          }}>
            {data.explanation}
          </p>
          <button onClick={() => setExpanded(e => !e)}
            style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: '#FF8C00', background: 'none', border: 'none', cursor: 'pointer', marginTop: '8px', padding: 0, letterSpacing: '0.1em' }}>
            {expanded ? '[ COLLAPSE ]' : '[ READ MORE ]'}
          </button>
        </div>
      </div>

      {/* AI Analysis */}
      <AIPanel
        label="APOD ANALYSIS"
        resultKey="analysis"
        fetchFn={() => aiApi.analyzeApod({ title: data.title, explanation: data.explanation, date: data.date, mediaType: data.media_type })}
      />
    </div>
  );
}

function APODGallery({ items }) {
  const [selected, setSelected] = useState(null);
  return (
    <>
      {selected && (
        <div onClick={() => setSelected(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          className="animate-fade-in">
          <div className="t-card" style={{ maxWidth: '800px', width: '100%', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            {selected.media_type === 'image'
              ? <img src={selected.hdurl || selected.url} alt={selected.title} style={{ width: '100%', maxHeight: '65vh', objectFit: 'contain', display: 'block', background: '#0e0e0e' }} />
              : getVideoType(selected.url) === 'iframe'
                ? <iframe src={selected.url} title={selected.title} style={{ width: '100%', height: '400px', border: 'none' }} />
                : getVideoType(selected.url) === 'mp4'
                  ? <video src={selected.url} controls style={{ width: '100%', maxHeight: '400px', display: 'block', background: '#0e0e0e' }} />
                  : (
                    <a href={selected.url} target="_blank" rel="noreferrer"
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '260px', background: '#141414', gap: '14px', textDecoration: 'none' }}>
                      <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '36px', color: '#FF8C00' }}>▶</span>
                      <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: '#FF8C00', letterSpacing: '0.15em', border: '1px solid #FF8C0044', padding: '6px 14px' }}>WATCH VIDEO ↗</span>
                    </a>
                  )
            }
            <div style={{ padding: '16px 20px' }}>
              <p className="t-label" style={{ fontSize: '8px', marginBottom: '4px' }}>{selected.date}</p>
              <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '13px', fontWeight: 600, color: '#F0E6D3', marginBottom: '8px' }}>{selected.title}</p>
              <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: '#555', lineHeight: 1.7,
                overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3 }}>
                {selected.explanation}
              </p>
            </div>
            <button onClick={() => setSelected(null)}
              style={{ position: 'absolute', top: '10px', right: '14px', background: 'none', border: 'none', color: '#555', fontSize: '20px', cursor: 'pointer' }}>×</button>
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1px', border: '1px solid #1a1a1a' }}>
        {items.map((item, i) => (
          <button key={item.date} onClick={() => setSelected(item)}
            className="t-card-hover"
            style={{ padding: 0, background: 'none', border: 'none', cursor: 'pointer', display: 'block', textAlign: 'left', animationDelay: `${i * 30}ms` }}>
            {item.media_type === 'image'
              ? <img src={item.url} alt={item.title} style={{ width: '100%', height: '130px', objectFit: 'cover', display: 'block', background: '#0e0e0e' }} />
              : (
                <div style={{ position: 'relative', width: '100%', height: '130px', background: '#141414', overflow: 'hidden' }}>
                  {getVideoType(item.url) === 'iframe' && getYouTubeThumb(item.url)
                    ? <img src={getYouTubeThumb(item.url)} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.6)' }} />
                    : getVideoType(item.url) === 'mp4'
                      ? <video src={item.url} muted preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.6)' }} />
                      : null
                  }
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '28px', color: '#FF8C00', textShadow: '0 0 12px rgba(0,0,0,0.8)' }}>▶</span>
                  </div>
                </div>
              )
            }
            <div style={{ padding: '10px 12px' }}>
              <p className="t-label" style={{ fontSize: '7px', marginBottom: '3px' }}>{item.date}</p>
              <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', fontWeight: 500, color: '#999', lineHeight: 1.4,
                overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>
                {item.title}
              </p>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

export default function APODPage() {
  const [mode,     setMode]     = useState('today');
  const [selDate,  setSelDate]  = useState(today);
  const [startDate, setStart]   = useState(sevenAgo);
  const [endDate,   setEnd]     = useState(today);

  const fetchFn = () => {
    if (mode === 'today') return apodApi.getToday();
    if (mode === 'date')  return apodApi.getByDate(selDate);
    return apodApi.getRange(startDate, endDate);
  };
  const { data, loading, error, refetch } = useFetch(fetchFn, [mode, selDate, startDate, endDate]);
  const isArray = Array.isArray(data);

  return (
    <div>
      <PageHeader
        title="ASTRONOMY PICTURE OF THE DAY"
        subtitle="Daily space photography curated by NASA astronomers since 1995. Each image explained by a professional."
        badge="APOD"
      />

      {/* Controls */}
      <div className="t-card" style={{ padding: '12px 16px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', border: '1px solid #262626' }}>
          {[['today','TODAY'],['date','BY DATE'],['range','RANGE']].map(([val, label]) => (
            <button key={val} onClick={() => setMode(val)}
              style={{
                padding: '6px 12px', fontFamily: 'IBM Plex Mono', fontSize: '9px', fontWeight: 700,
                letterSpacing: '0.1em', border: 'none', cursor: 'pointer', transition: 'all 0.1s',
                background: mode === val ? '#FF8C00' : 'transparent',
                color: mode === val ? '#080808' : '#444',
                borderRight: '1px solid #262626',
              }}>
              {label}
            </button>
          ))}
        </div>
        {mode === 'date' && (
          <input type="date" value={selDate} max={today} min="1995-06-16"
            onChange={e => setSelDate(e.target.value)} className="t-input" style={{ width: '160px' }} />
        )}
        {mode === 'range' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <input type="date" value={startDate} max={endDate} min="1995-06-16"
              onChange={e => setStart(e.target.value)} className="t-input" style={{ width: '150px' }} />
            <span style={{ color: '#333', fontSize: '10px', fontFamily: 'IBM Plex Mono' }}>→</span>
            <input type="date" value={endDate} max={today} min={startDate}
              onChange={e => setEnd(e.target.value)} className="t-input" style={{ width: '150px' }} />
          </div>
        )}
      </div>

      {loading && <LoadingSpinner label="FETCHING APOD DATA..." />}
      {error   && <ErrorMessage message={error} onRetry={refetch} />}
      {!loading && !error && data && (
        isArray ? <APODGallery items={data} /> : <APODCard data={data} />
      )}
    </div>
  );
}