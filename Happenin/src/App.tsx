import RealTimeMap from './components/features/events/RealTimeMap'
import './App.css'

function App() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Happenin - Real Time Events</h1>
        <p style={{ color: '#666', fontSize: '1.1rem', margin: 0 }}>Discover what's happening around you</p>
      </header>
      
      <main>
        <div style={{ background: '#fff', padding: '1rem', borderRadius: '16px', border: '1px solid #eaeaea' }}>
          <h2 style={{ fontSize: '1.5rem', marginTop: 0, marginBottom: '1rem', color: '#111' }}>Live Event Map</h2>
          <RealTimeMap />
        </div>
      </main>
    </div>
  )
}

export default App
