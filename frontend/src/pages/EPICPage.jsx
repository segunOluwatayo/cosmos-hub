import { useState, useEffect } from 'react';
import { epicApi } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { LoadingSpinner, ErrorMessage, PageHeader } from '../components/UI';

function EPICImageCard({ image, index }) {
  const [loaded,   setLoaded]   = useState(false);
  const [enlarged, setEnlarged] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <>
      {enlarged && (
        <div onClick={() => setEnlarged(false)} className="animate-fade-in"
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.97)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ maxWidth: '720px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1px' }} onClick={e => e.stopPropagation()}>
            <div className="t-card" style={{ overflow: 'hidden', padding: 0 }}>
              <img src={image.imageUrl} alt={image.caption}
                style={{ width: '100%', display: 'block', objectFit: 'contain', maxHeight: '65vh', background: '#000' }} />
            </div>
            <div className="t-card" style={{ padding: '14px 18px' }}>
              <p className="t-label" style={{ fontSize: '8px', marginBottom: '8px' }}>{image.date}</p>
              <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: '#666', lineHeight: 1.7, marginBottom: '10px' }}>{image.caption}</p>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {[
                  ['CENTROID LAT', `${image.centroidCoordinates?.lat?.toFixed(2)}°`],
                  ['CENTROID LON', `${image.centroidCoordinates?.lon?.toFixed(2)}°`],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '7px', color: '#333', letterSpacing: '0.1em', marginBottom: '2px' }}>{label}</p>
                    <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', fontWeight: 600, color: '#00D46A' }}>{val}</p>
                  </div>
                ))}
                <div style={{ marginLeft: 'auto' }}>
                  <a href={image.imageUrl} target="_blank" rel="noreferrer" className="t-btn" style={{ fontSize: '9px', padding: '6px 12px' }}>
                    FULL RES ↗
                  </a>
                </div>
              </div>
            </div>
            <button onClick={() => setEnlarged(false)}
              style={{ position: 'absolute', top: '12px', right: '16px', background: 'none', border: 'none', color: '#444', fontSize: '22px', cursor: 'pointer' }}>×</button>
          </div>
        </div>
      )}

      <button onClick={() => setEnlarged(true)}
        style={{ padding: 0, border: 'none', cursor: 'pointer', display: 'block', background: '#141414', textAlign: 'left', animationDelay: `${index * 40}ms` }}
        className="t-card-hover animate-fade-in">
        <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: '#000' }}>
          {!loaded && !imgError && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '24px', height: '24px', border: '1px solid #1a1a1a', borderTopColor: '#00D46A', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          )}
          <img
            src={imgError ? image.imageUrl : (image.thumbUrl || image.imageUrl)}
            alt={image.caption}
            onLoad={() => setLoaded(true)}
            onError={() => { if (!imgError) { setImgError(true); } else { setLoaded(true); } }}
            style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              filter: 'saturate(1.1)',
              opacity: loaded ? 1 : 0, transition: 'opacity 0.4s',
            }}
          />
          {/* Coordinate overlay on hover */}
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            padding: '8px', opacity: 0, transition: 'opacity 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0}>
            <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '8px', color: '#00D46A', fontWeight: 600 }}>
              φ {image.centroidCoordinates?.lat?.toFixed(1)}° λ {image.centroidCoordinates?.lon?.toFixed(1)}°
            </p>
            <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '7px', color: '#666' }}>CLICK TO EXPAND</p>
          </div>
        </div>
        <div style={{ padding: '8px 10px' }}>
          <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '8px', fontWeight: 700, color: '#00D46A', letterSpacing: '0.08em', marginBottom: '2px' }}>
            {image.date?.split(' ')[0]}
          </p>
          <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '7px', color: '#333' }}>
            {image.date?.split(' ')[1]?.substring(0, 5)} UTC
          </p>
        </div>
      </button>
    </>
  );
}

export default function EPICPage() {
  const [selectedDate, setSelectedDate] = useState('');
  const [fetchDate,    setFetchDate]    = useState('');

  const { data: datesData } = useFetch(() => epicApi.getDates(), []);

  useEffect(() => {
    if (datesData?.dates?.length) {
      const latest = datesData.dates[0];
      setSelectedDate(latest);
      setFetchDate(latest);
    }
  }, [datesData]);

  const { data, loading, error, refetch } = useFetch(
    () => (fetchDate ? epicApi.getByDate(fetchDate) : epicApi.getLatest()),
    [fetchDate],
    { immediate: !!fetchDate }
  );

  return (
    <div>
      <PageHeader
        title="EARTH POLYCHROMATIC IMAGING CAMERA"
        subtitle="Natural-color full-disc Earth imagery from the DSCOVR satellite. Position: Sun-Earth L1 Lagrange point · 1.5M km from Earth."
        badge="EPIC · DSCOVR"
      />

      {/* Satellite info bar */}
      <div className="t-card" style={{ padding: '12px 16px', marginBottom: '1px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {[
          ['SATELLITE',  'DSCOVR'],
          ['CAMERA',     'EPIC (Earth Polychromatic Imaging Camera)'],
          ['ORBIT',      'Sun-Earth L1 Lagrange Point'],
          ['DIST. EARTH','~1,500,000 km'],
          ['IMAGE TYPE', 'Natural Color (443nm + 551nm + 680nm)'],
        ].map(([label, val]) => (
          <div key={label}>
            <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '7px', color: '#2a2a2a', letterSpacing: '0.1em', marginBottom: '2px' }}>{label}</p>
            <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: '#555' }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Date selector */}
      <div className="t-card" style={{ padding: '12px 16px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: '#333', letterSpacing: '0.12em' }}>IMAGE DATE</span>
        <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="t-select" style={{ width: '180px' }}>
          {datesData?.dates?.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <button onClick={() => setFetchDate(selectedDate)} className="t-btn"
          disabled={!selectedDate || selectedDate === fetchDate}>
          ↳ LOAD TRANSMISSION
        </button>
        {data?.images?.length > 0 && (
          <span style={{ marginLeft: 'auto', fontFamily: 'IBM Plex Mono', fontSize: '9px', color: '#333' }}>
            {data.images.length} FRAMES · {data.date}
          </span>
        )}
      </div>

      {loading && <LoadingSpinner label="RECEIVING EARTH IMAGERY..." />}
      {error   && <ErrorMessage message={error} onRetry={refetch} />}

      {!loading && !error && data?.images && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '1px' }}
          className="animate-slide-up">
          {data.images.map((image, i) => (
            <EPICImageCard key={image.identifier} image={image} index={i} />
          ))}
        </div>
      )}

      {!loading && !error && !fetchDate && (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p className="t-label" style={{ color: '#1e1e1e' }}>// SELECT DATE TO LOAD IMAGERY</p>
        </div>
      )}
    </div>
  );
}