import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const LiveMap = ({ onBack }) => {
  const mapRef = useRef(null);
  const [locations, setLocations] = useState([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapInstance = useRef(null);
  const markers = useRef({});

  useEffect(() => {
    // 1. INJECT LEAFLET CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // 2. INJECT LEAFLET JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setIsMapLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(script);
    };
  }, []);

  const fetchLocations = () => {
    fetch('/api/admin/locations')
      .then(r => r.json())
      .then(data => setLocations(data || []))
      .catch(err => console.error("Map Fetch Error:", err));
  };

  useEffect(() => {
    if (isMapLoaded && !mapInstance.current) {
      // INIZIALIZE MAP
      mapInstance.current = window.L.map(mapRef.current).setView([17.3850, 78.4867], 10); // DEFAULT (Hyd)
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(mapInstance.current);
    }
    
    if (isMapLoaded) {
        fetchLocations();
        const interval = setInterval(fetchLocations, 30000); // 30s update
        return () => clearInterval(interval);
    }
  }, [isMapLoaded]);

  useEffect(() => {
    if (!isMapLoaded || !mapInstance.current) return;

    locations.forEach(user => {
      const { lat, lng } = user.location;
      
      if (markers.current[user.username]) {
        // UPDATE MARKER
        markers.current[user.username].setLatLng([lat, lng]);
      } else {
        // CREATE NEW MARKER
        const marker = window.L.marker([lat, lng])
          .addTo(mapInstance.current)
          .bindPopup(`<strong>${user.name || user.username}</strong><br/>${user.role}<br/>Last seen: ${new Date(user.last_seen).toLocaleTimeString()}`);
        markers.current[user.username] = marker;
      }
    });
  }, [locations, isMapLoaded]);

  return (
    <Container>
      <header className="map-header">
        <button className="back-btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </button>
        <div className="title-area">
          <h1>Employee Live Locator</h1>
          <span className="live-status">● LIVE</span>
        </div>
      </header>

      <div id="map-container" ref={mapRef} style={{ width: '100%', height: '600px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}></div>
      
      <div className="legend">
        <h3>Connected Field Staff</h3>
        <div className="staff-list">
          {locations.map(u => (
            <div key={u.username} className="staff-item">
              <div className="avatar">{u.name?.[0] || u.username[0]}</div>
              <div className="info">
                <strong>{u.name || u.username}</strong>
                <span>{new Date(u.last_seen).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
          {locations.length === 0 && <p className="empty">Waiting for active signals...</p>}
        </div>
      </div>
    </Container>
  );
};

const Container = styled.div`
  padding: 1rem;
  animation: fadeIn 0.4s ease-out;

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .map-header {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin-bottom: 2rem;
    
    .back-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #f3f4f6;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      &:hover { background: #e5e7eb; }
    }
  }

  .title-area {
      display: flex;
      align-items: center;
      gap: 1rem;
      h1 { font-size: 1.5rem; color: #111827; margin: 0; }
  }

  .live-status {
      color: #10b981;
      font-size: 0.8rem;
      font-weight: bold;
      background: #ecfdf5;
      padding: 4px 10px;
      border-radius: 20px;
      animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.6; }
    100% { opacity: 1; }
  }

  .legend {
    margin-top: 2rem;
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);

    h3 { margin-top: 0; font-size: 1.1rem; color: #374151; margin-bottom: 1.5rem; }
    .staff-list { display: flex; flex-wrap: wrap; gap: 1rem; }
    .staff-item {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      padding: 10px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #f3f4f6;
    }
    .avatar { width: 32px; height: 32px; background: #10b981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    .info { display: flex; flex-direction: column; }
    .info strong { font-size: 0.9rem; color: #111827; }
    .info span { font-size: 0.75rem; color: #6b7280; }
    .empty { color: #9ca3af; font-size: 0.9rem; }
  }
`;

export default LiveMap;
