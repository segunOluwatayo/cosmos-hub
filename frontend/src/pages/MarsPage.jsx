import { useState, useCallback } from 'react';
import { marsApi, aiApi } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { LoadingSpinner, ErrorMessage, PageHeader } from '../components/UI';
import AIPanel from '../components/AIPanel';

const PRESETS = [
  'mars rover',
  'curiosity rover',
  'perseverance rover',
  'opportunity rover',
  'spirit rover',
  'mars surface',
  'mars crater',
  'mars landscape',
];

function ImageModal({ item, onClose }) {
  return (
    <div onClick={onClose} className="animate-fade-in"
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.97)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="t-card" style={{ maxWidth: '820px', width: '100%', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <img src={item.imageUrl || item.thumbUrl} alt={item.title}
          style={{ width: '100%', maxHeight: '60vh', objectFit: 'contain', display: 'block', background: '#080808' }} />
        <div style={{ padding: '14px 18px', borderTop: '1px solid #1a1a1a' }}>
          <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '12px', fontWeight: 600, color: '#C8B89A', marginBottom: '8px', lineHeight: 1.4 }}>{item.title}</p>
          {item.description && (
            <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: '#444', lineHeight: 1.8, marginBottom: '10px' }}>
              {item.description.length > 300 ? item.description.slice(0, 300) + '…' : item.description}
            </p>
          )}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              ['DATE',   item.date],
              ['CENTER', item.center || '—'],
              ['ID',     item.id],
            ].map(([label, val]) => (
              <div key={label}>
                <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '7px', color: '#333', letterSpacing: '0.1em', marginBottom: '2px' }}>{label}</p>
                <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', fontWeight: 600, color: '#FF8C00' }}>{val}</p>
              </div>
            ))}
            <div style={{ marginLeft: 'auto' }}>
              <a href={item.imageUrl} target="_blank" rel="noreferrer" className="t-btn" style={{ fontSize: '9px', padding: '6px 12px' }}>FULL RES ↗</a>
            </div>
          </div>
          {item.keywords?.length > 0 && (
            <div style={{ marginTop: '10px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {item.keywords.slice(0, 8).map(k => (
                <span key={k} className="t-pill" style={{ fontSize: '7px', borderColor: '#1e1e1e', color: '#333' }}>{k}</span>
              ))}
            </div>
          )}
        </div>
        <button onClick={onClose}
          style={{ position: 'absolute', top: '10px', right: '14px', background: 'none', border: 'none', color: '#444', fontSize: '22px', cursor: 'pointer', lineHeight: 1 }}>×</button>
      </div>
    </div>
  );
}

export default function MarsPage() {
  const [query,    setQuery]    = useState('mars rover');
  const [inputVal, setInputVal] = useState('mars rover');
  const [page,     setPage]     = useState(1);
  const [selected, setSelected] = useState(null);
  const [aiItem,   setAiItem]   = useState(null);

  const fetchImages = useCallback(
    () => marsApi.search({ q: query, page }),
    [query, page]
  );
  const { data, loading, error, refetch } = useFetch(fetchImages, [query, page]);

  const handleSearch = () => {
    const trimmed = inputVal.trim();
    if (!trimmed) return;
    setPage(1);
    setQuery(trimmed);
  };

  const handlePreset = (preset) => {
    setInputVal(preset);
    setPage(1);
    setQuery(preset);
  };

  return (
    <div>
      {selected && <ImageModal item={selected} onClose={() => setSelected(null)} />}

      <PageHeader
        title="NASA IMAGE ARCHIVE — MARS"
        subtitle="Search NASA's complete image and video library for Mars surface imagery, rover photographs, and planetary science records."
        badge="NASA IMAGE LIBRARY"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1px', alignItems: 'start' }}
        className="mars-grid">

        {/* ── Sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>

          {/* Search input */}
          <div className="t-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p className="t-label" style={{ fontSize: '8px' }}>SEARCH ARCHIVE</p>
            <input
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. mars crater"
              className="t-input"
            />
            <button onClick={handleSearch} className="t-btn" style={{ width: '100%', justifyContent: 'center' }}>
              ↳ QUERY DATABASE
            </button>
          </div>

          {/* Preset queries */}
          <div className="t-card" style={{ padding: '14px' }}>
            <p className="t-label" style={{ fontSize: '8px', marginBottom: '10px' }}>PRESET QUERIES</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {PRESETS.map(preset => (
                <button key={preset} onClick={() => handlePreset(preset)}
                  style={{
                    padding: '8px 10px', background: query === preset ? '#FF8C000f' : 'transparent',
                    border: `1px solid ${query === preset ? '#FF8C0044' : '#1e1e1e'}`,
                    cursor: 'pointer', textAlign: 'left',
                  }}>
                  <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: query === preset ? '#FF8C00' : '#444', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {preset}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          {data && (
            <div className="t-card" style={{ padding: '14px' }}>
              <p className="t-label" style={{ fontSize: '8px', marginBottom: '10px' }}>QUERY STATS</p>
              {[
                ['TOTAL RESULTS', data.total?.toLocaleString()],
                ['PAGE',          `${data.page} / ${Math.ceil(data.total / 100) || 1}`],
                ['RESULTS SHOWN', data.items?.length],
                ['SOURCE',        'NASA IMAGE LIB'],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #141414' }}>
                  <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '8px', color: '#333', letterSpacing: '0.08em' }}>{label}</span>
                  <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '8px', fontWeight: 600, color: '#FF8C00' }}>{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Results grid ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}>
          {loading && <LoadingSpinner label="QUERYING NASA IMAGE ARCHIVE..." />}
          {error   && <ErrorMessage message={error} onRetry={refetch} />}

          {!loading && !error && data && (
            <>
              {/* Pagination bar */}
              <div className="t-card" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: '#333' }}>
                  {data.total?.toLocaleString()} RECORDS · QUERY: "{query}"
                </span>
                <div style={{ display: 'flex', gap: '1px' }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="t-btn-ghost" style={{ padding: '4px 10px', fontSize: '9px' }}>← PREV</button>
                  <span style={{ padding: '4px 12px', fontFamily: 'IBM Plex Mono', fontSize: '9px', color: '#444', border: '1px solid #1e1e1e', borderLeft: 'none', borderRight: 'none' }}>P.{page}</span>
                  <button onClick={() => setPage(p => p + 1)} disabled={!data.items?.length || data.items.length < 100} className="t-btn-ghost" style={{ padding: '4px 10px', fontSize: '9px' }}>NEXT →</button>
                </div>
              </div>

              {data.items?.length === 0 ? (
                <div className="t-card" style={{ padding: '60px', textAlign: 'center' }}>
                  <p className="t-label" style={{ color: '#2a2a2a' }}>// NO RECORDS FOUND</p>
                  <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: '#2a2a2a', marginTop: '8px' }}>Try a different search query</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1px' }} className="animate-fade-in">
                    {data.items.map((item) => (
                      <button key={item.id} onClick={() => { setSelected(item); setAiItem(item); }}
                        className="t-card-hover"
                        style={{ padding: 0, border: 'none', cursor: 'pointer', display: 'block', textAlign: 'left', background: '#141414' }}>
                        <img src={item.thumbUrl || item.imageUrl} alt={item.title} loading="lazy"
                          style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block', background: '#0e0e0e', filter: 'sepia(0.15)' }} />
                        <div style={{ padding: '6px 8px' }}>
                          <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '8px', fontWeight: 700, color: '#FF8C00', letterSpacing: '0.06em', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                          <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '7px', color: '#333' }}>{item.date}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {aiItem && (
                    <AIPanel
                      key={aiItem.id}
                      label={`IMAGE ANALYSIS · ${aiItem.id}`}
                      resultKey="description"
                      fetchFn={() => aiApi.describeMarsScene({
                        title:       aiItem.title,
                        description: aiItem.description,
                        date:        aiItem.date,
                        keywords:    aiItem.keywords,
                      })}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
