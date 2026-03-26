import { useRef, useEffect, useMemo } from 'react';

/**
 * Canvas-based asteroid proximity map.
 * Renders Earth at center with asteroids positioned by miss distance.
 */
export default function AsteroidProximityMap({ asteroids }) {
  const canvasRef = useRef(null);

  const processed = useMemo(() => {
    if (!asteroids?.length) return [];

    const maxDist   = Math.max(...asteroids.map(a => a.missDistanceKm));
    const maxDiam   = Math.max(...asteroids.map(a => a.diameterMax));

    // Assign stable angle per asteroid by index (no random on re-render)
    return asteroids.map((a, i) => ({
      ...a,
      normDist: a.missDistanceKm / maxDist,
      normDiam: a.diameterMax / maxDiam,
      angle:    (i / asteroids.length) * Math.PI * 2,
    }));
  }, [asteroids]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !processed.length) return;

    const dpr = window.devicePixelRatio || 1;
    const W   = canvas.offsetWidth;
    const H   = canvas.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const cx = W / 2;
    const cy = H / 2;
    const maxR = Math.min(W, H) / 2 - 24;

    // Background
    ctx.fillStyle = '#0e0e0e';
    ctx.fillRect(0, 0, W, H);

    // Concentric distance rings
    [0.25, 0.5, 0.75, 1].forEach(fraction => {
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * fraction, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,140,0,0.06)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Ring label
      const maxDistM = Math.max(...asteroids.map(a => a.missDistanceKm));
      const label = `${((maxDistM * fraction) / 1_000_000).toFixed(1)}M km`;
      ctx.fillStyle = 'rgba(255,140,0,0.25)';
      ctx.font = '8px IBM Plex Mono';
      ctx.textAlign = 'left';
      ctx.fillText(label, cx + maxR * fraction + 4, cy + 4);
    });

    // Cross hairs
    ctx.strokeStyle = 'rgba(255,140,0,0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath(); ctx.moveTo(cx, cy - maxR - 10); ctx.lineTo(cx, cy + maxR + 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - maxR - 10, cy); ctx.lineTo(cx + maxR + 10, cy); ctx.stroke();
    ctx.setLineDash([]);

    // Earth
    const earthGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14);
    earthGrad.addColorStop(0,   'rgba(0, 150, 255, 0.9)');
    earthGrad.addColorStop(0.6, 'rgba(0, 90, 180, 0.7)');
    earthGrad.addColorStop(1,   'rgba(0, 40, 100, 0.4)');
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fillStyle = earthGrad;
    ctx.fill();
    // Earth glow
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,150,255,0.25)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#F0E6D3';
    ctx.font = '7px IBM Plex Mono';
    ctx.textAlign = 'center';
    ctx.fillText('EARTH', cx, cy + 28);

    // Asteroids
    processed.forEach(a => {
      const r    = maxR * 0.12 + maxR * 0.88 * a.normDist;
      const x    = cx + r * Math.cos(a.angle);
      const y    = cy + r * Math.sin(a.angle);
      const size = 2.5 + a.normDiam * 7;

      // Hazardous pulse ring
      if (a.isHazardous) {
        ctx.beginPath();
        ctx.arc(x, y, size + 5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,51,51,0.25)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Asteroid dot
      const grad = ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, 0, x, y, size);
      if (a.isHazardous) {
        grad.addColorStop(0, 'rgba(255,120,120,1)');
        grad.addColorStop(1, 'rgba(180,0,0,0.7)');
      } else {
        grad.addColorStop(0, 'rgba(255,200,100,1)');
        grad.addColorStop(1, 'rgba(200,100,0,0.6)');
      }
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Line to center
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.strokeStyle = a.isHazardous ? 'rgba(255,51,51,0.08)' : 'rgba(255,140,0,0.05)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });

    // Legend
    const lx = 14, ly = H - 48;
    [
      { color: 'rgba(255,200,100,0.9)', label: 'SAFE APPROACH' },
      { color: 'rgba(255,80,80,0.9)',   label: 'POTENTIALLY HAZARDOUS' },
    ].forEach(({ color, label }, i) => {
      ctx.beginPath();
      ctx.arc(lx + 4, ly + i * 16, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.fillStyle = 'rgba(240,230,211,0.5)';
      ctx.font = '8px IBM Plex Mono';
      ctx.textAlign = 'left';
      ctx.fillText(label, lx + 14, ly + i * 16 + 3);
    });

  }, [processed, asteroids]);

  return (
    <div className="t-card" style={{ padding: '0' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a1a1a' }}>
        <span className="t-label">PROXIMITY MAP · EARTH-RELATIVE POSITIONS</span>
      </div>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '320px' }}
      />
    </div>
  );
}