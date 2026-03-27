import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { asteroidsApi, aiApi } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { LoadingSpinner, ErrorMessage, PageHeader, StatCard } from '../components/UI';
import AIPanel from '../components/AIPanel';
import AsteroidProximityMap from '../components/AsteroidProximityMap';

const today      = () => new Date().toISOString().split('T')[0];
const offsetDate = (d, n) => { const dt = new Date(d); dt.setDate(dt.getDate() + n); return dt.toISOString().split('T')[0]; };

const ChartTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="t-card" style={{ padding: '8px 12px', borderColor: 'rgba(255,140,0,0.2)' }}>
      {payload.map(p => (
        <p key={p.name} style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: p.color, margin: '2px 0' }}>
          {p.name}: <span style={{ color: '#F0E6D3', fontWeight: 600 }}>{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const COLS = [
  { key: 'name',           label: 'DESIGNATION' },
  { key: 'date',           label: 'DATE' },
  { key: 'diameterMax',    label: 'DIAM. MAX (km)' },
  { key: 'missDistanceKm', label: 'MISS DIST. (km)' },
  { key: 'velocityKph',    label: 'VELOCITY (km/h)' },
  { key: 'isHazardous',    label: 'THREAT' },
];

function AsteroidTable({ asteroids }) {
  const [sort,   setSort]   = useState({ key: 'date', dir: 1 });
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const sorted = useMemo(() => {
    let rows = [...asteroids];
    if (filter === 'hazardous') rows = rows.filter(a => a.isHazardous);
    if (filter === 'safe')      rows = rows.filter(a => !a.isHazardous);
    if (search) rows = rows.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
    rows.sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key];
      if (typeof av === 'boolean') return sort.dir * (av === bv ? 0 : av ? -1 : 1);
      return sort.dir * (av < bv ? -1 : av > bv ? 1 : 0);
    });
    return rows;
  }, [asteroids, sort, filter, search]);

  return (
    <div className="t-card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span className="t-label">OBJECT FEED · {sorted.length}/{asteroids.length}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="text" placeholder="SEARCH DESIGNATION..." value={search}
            onChange={e => setSearch(e.target.value)} className="t-input" style={{ width: '200px', fontSize: '9px' }} />
          <div style={{ display: 'flex', border: '1px solid #262626' }}>
            {[['all','ALL'],['hazardous','⚠ HAZARD'],['safe','✓ SAFE']].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)}
                style={{
                  padding: '5px 10px', fontFamily: 'IBM Plex Mono', fontSize: '8px', fontWeight: 700,
                  letterSpacing: '0.08em', border: 'none', borderRight: '1px solid #262626', cursor: 'pointer',
                  background: filter === val ? '#FF8C00' : 'transparent',
                  color: filter === val ? '#080808' : '#444',
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
              {COLS.map(col => (
                <th key={col.key} onClick={() => setSort(s => ({ key: col.key, dir: s.key === col.key ? -s.dir : 1 }))}
                  style={{ padding: '8px 14px', fontFamily: 'IBM Plex Mono', fontSize: '8px', fontWeight: 700,
                    letterSpacing: '0.1em', color: sort.key === col.key ? '#FF8C00' : '#333',
                    textAlign: 'left', cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>
                  {col.label} {sort.key === col.key ? (sort.dir > 0 ? '↑' : '↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((a, i) => (
              <tr key={a.id} style={{ borderBottom: '1px solid #141414', background: a.isHazardous ? 'rgba(255,51,51,0.03)' : 'transparent' }}>
                <td style={{ padding: '8px 14px', fontFamily: 'IBM Plex Mono', fontSize: '10px' }}>
                  <a href={a.nasaUrl} target="_blank" rel="noreferrer" style={{ color: '#C8B89A', textDecoration: 'none' }}>{a.name}</a>
                </td>
                <td style={{ padding: '8px 14px', fontFamily: 'IBM Plex Mono', fontSize: '10px', color: '#444' }}>{a.date}</td>
                <td style={{ padding: '8px 14px', fontFamily: 'IBM Plex Mono', fontSize: '10px', color: '#F0E6D3' }}>{a.diameterMax.toFixed(3)}</td>
                <td style={{ padding: '8px 14px', fontFamily: 'IBM Plex Mono', fontSize: '10px', color: '#F0E6D3' }}>{a.missDistanceKm.toLocaleString()}</td>
                <td style={{ padding: '8px 14px', fontFamily: 'IBM Plex Mono', fontSize: '10px', color: '#F0E6D3' }}>{a.velocityKph.toLocaleString()}</td>
                <td style={{ padding: '8px 14px' }}>
                  {a.isHazardous
                    ? <span className="t-pill-red" style={{ fontSize: '7px' }}>⚠ PHO</span>
                    : <span className="t-pill-green" style={{ fontSize: '7px' }}>✓ CLEAR</span>}
                </td>
              </tr>
            ))}
            {!sorted.length && (
              <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', fontFamily: 'IBM Plex Mono', fontSize: '10px', color: '#333' }}>
                NO OBJECTS MATCH FILTER
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AsteroidPage() {
  const [startDate, setStartDate] = useState(today());
  const [endDate,   setEndDate]   = useState(offsetDate(today(), 6));

  const { data, loading, error, refetch } = useFetch(
    () => asteroidsApi.getFeed(startDate, endDate),
    [startDate, endDate]
  );

  return (
    <div>
      <PageHeader
        title="NEAR EARTH OBJECT SURVEILLANCE"
        subtitle="Real-time tracking of asteroids and comets approaching Earth. Data sourced from NASA Jet Propulsion Laboratory."
        badge="NEOWS · JPL"
      />

      {/* Date range */}
      <div className="t-card" style={{ padding: '12px 16px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: '#333', letterSpacing: '0.12em' }}>OBSERVATION WINDOW</span>
        <input type="date" value={startDate} max={endDate}
          onChange={e => setStartDate(e.target.value)} className="t-input" style={{ width: '150px' }} />
        <span style={{ color: '#333', fontFamily: 'IBM Plex Mono', fontSize: '10px' }}>→</span>
        <input type="date" value={endDate} min={startDate} max={offsetDate(startDate, 6)}
          onChange={e => setEndDate(e.target.value)} className="t-input" style={{ width: '150px' }} />
        <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', color: '#2a2a2a', fontStyle: 'italic' }}>// MAX 7-DAY WINDOW</span>
      </div>

      {loading && <LoadingSpinner label="SCANNING NEAR-EARTH SPACE..." />}
      {error   && <ErrorMessage message={error} onRetry={refetch} />}

      {!loading && !error && data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }} className="animate-slide-up">

          {/* Stat row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1px', marginBottom: '1px' }}>
            <StatCard label="TOTAL TRACKED"   value={data.elementCount}                            variant="amber" />
            <StatCard label="HAZARDOUS (PHO)" value={data.hazardousCount}                          variant={data.hazardousCount > 0 ? 'red' : 'default'} />
            <StatCard label="CLEAR APPROACHES" value={data.elementCount - data.hazardousCount}     variant="green" />
            <StatCard label="WINDOW"           value={`${data.dateRange.start.slice(5)} → ${data.dateRange.end.slice(5)}`} sub="YYYY·MM·DD" />
          </div>

          {/* Charts + map */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px' }}>
            {/* Bar chart */}
            <div className="t-card" style={{ padding: '16px' }}>
              <p className="t-label" style={{ marginBottom: '12px', fontSize: '8px' }}>DAILY OBJECT COUNT</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.byDay} margin={{ top: 0, right: 8, left: -28, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="#1a1a1a" />
                  <XAxis dataKey="date" tick={{ fill: '#333', fontSize: 8, fontFamily: 'IBM Plex Mono' }} tickFormatter={d => d.slice(5)} />
                  <YAxis tick={{ fill: '#333', fontSize: 8, fontFamily: 'IBM Plex Mono' }} />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="total"     name="Total"     fill="rgba(255,140,0,0.7)" radius={0} />
                  <Bar dataKey="hazardous" name="Hazardous" fill="rgba(255,51,51,0.7)"  radius={0} />
                  <Legend wrapperStyle={{ fontSize: '8px', fontFamily: 'IBM Plex Mono', color: '#444' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Canvas proximity map */}
            <AsteroidProximityMap asteroids={data.asteroids} />
          </div>

          {/* AI Briefing */}
          <AIPanel
            label="THREAT ASSESSMENT BRIEFING"
            resultKey="briefing"
            fetchFn={() => aiApi.asteroidBriefing({ asteroids: data.asteroids, dateRange: data.dateRange })}
          />

          {/* Table */}
          <AsteroidTable asteroids={data.asteroids} />
        </div>
      )}
    </div>
  );
}