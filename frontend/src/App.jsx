import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import APODPage from './pages/APODPage';
import AsteroidPage from './pages/AsteroidPage';
import MarsPage from './pages/MarsPage';
import EPICPage from './pages/EPICPage';
import ScrollToTop from './components/ScrollToTop';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '28px 24px' }}>
          <Routes>
            <Route path="/"          element={<Home />}         />
            <Route path="/apod"      element={<APODPage />}     />
            <Route path="/asteroids" element={<AsteroidPage />} />
            <Route path="/mars"      element={<MarsPage />}     />
            <Route path="/epic"      element={<EPICPage />}     />
          </Routes>
        </main>
        <footer style={{
          borderTop: '1px solid #141414', padding: '14px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '8px',
        }}>
          <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '8px', color: '#222', letterSpacing: '0.12em' }}>
            COSMOSHUB · NASA DATA INTERFACE · POWERED BY CLAUDE AI
          </span>
          <a href="https://api.nasa.gov" target="_blank" rel="noreferrer"
            style={{ fontFamily: 'IBM Plex Mono', fontSize: '8px', color: '#2a2a2a', textDecoration: 'none', letterSpacing: '0.1em' }}>
            api.nasa.gov ↗
          </a>
        </footer>
      </div>
    </BrowserRouter>
  );
}