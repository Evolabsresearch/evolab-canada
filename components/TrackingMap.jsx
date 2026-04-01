/**
 * TrackingMap — Interactive Mapbox GL JS map for shipment tracking
 * Dynamically imported (no SSR) from pages/account/tracking/[trackingNumber].jsx
 *
 * Props:
 *   checkpoints: Array<{ lat, lng, message, location, datetime }>
 *   currentLocation: { lat, lng } | null
 */
import { useEffect, useRef, useState } from 'react';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Fallback center (continental US) when no coordinates available
const DEFAULT_CENTER = [-98.5795, 39.8283];
const DEFAULT_ZOOM   = 3.5;

export default function TrackingMap({ checkpoints = [], currentLocation = null }) {
  const mapContainer = useRef(null);
  const mapRef       = useRef(null);
  const markersRef   = useRef([]);
  const [mapError, setMapError] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);

  // Checkpoints that have valid coordinates
  const geoPoints = checkpoints.filter(cp => cp.lat && cp.lng);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (mapRef.current) return; // already initialized

    if (!MAPBOX_TOKEN) {
      setMapError('Mapbox token not configured.');
      return;
    }

    let map;
    (async () => {
      try {
        const mapboxgl = (await import('mapbox-gl')).default;
        await import('mapbox-gl/dist/mapbox-gl.css');

        mapboxgl.accessToken = MAPBOX_TOKEN;

        // Initial center / zoom
        const center = currentLocation
          ? [currentLocation.lng, currentLocation.lat]
          : geoPoints.length > 0
          ? [geoPoints[0].lng, geoPoints[0].lat]
          : DEFAULT_CENTER;

        map = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/dark-v11',
          center,
          zoom: geoPoints.length > 0 ? 5 : DEFAULT_ZOOM,
          attributionControl: false,
          logoPosition: 'bottom-right',
        });

        mapRef.current = map;

        map.addControl(
          new mapboxgl.NavigationControl({ showCompass: false }),
          'top-right'
        );
        map.addControl(
          new mapboxgl.AttributionControl({ compact: true }),
          'bottom-right'
        );

        map.on('load', () => {
          setMapLoaded(true);
          renderRoute(map, mapboxgl, geoPoints, currentLocation);
        });

        map.on('error', e => {
          console.error('Mapbox error:', e);
          setMapError('Map failed to load.');
        });
      } catch (err) {
        console.error('TrackingMap init error:', err);
        setMapError('Could not initialize map.');
      }
    })();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render route when checkpoints change after initial load
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    (async () => {
      const mapboxgl = (await import('mapbox-gl')).default;
      mapboxgl.accessToken = MAPBOX_TOKEN;
      renderRoute(mapRef.current, mapboxgl, geoPoints, currentLocation);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded, checkpoints, currentLocation]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0a0a0a' }}>
      {/* Map container */}
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* No-coordinates notice */}
      {!mapError && geoPoints.length === 0 && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(10,10,10,0.82)',
          pointerEvents: 'none',
        }}>
          <span style={{ fontSize: 32, marginBottom: 10 }}>📦</span>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', textAlign: 'center', maxWidth: 220, lineHeight: 1.6 }}>
            Location data will appear once the carrier scans your package.
          </p>
        </div>
      )}

      {/* Error state */}
      {mapError && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: '#0a0a0a',
        }}>
          <span style={{ fontSize: 28, marginBottom: 8 }}>🗺️</span>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{mapError}</p>
        </div>
      )}

      {/* Legend */}
      {geoPoints.length > 0 && (
        <div style={{
          position: 'absolute', bottom: 36, left: 12,
          background: 'rgba(10,10,10,0.82)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8, padding: '8px 12px',
          display: 'flex', flexDirection: 'column', gap: 5,
          pointerEvents: 'none',
        }}>
          <LegendItem color="#06b6d4" label="Current location" />
          <LegendItem color="#60a5fa" label="Previous stops" />
          <LegendItem color="rgba(6,182,212,0.45)" label="Route" dashed />
        </div>
      )}
    </div>
  );
}

function LegendItem({ color, label, dashed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      {dashed ? (
        <div style={{ width: 18, height: 2, background: color, borderTop: `2px dashed ${color}` }} />
      ) : (
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
      )}
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>{label}</span>
    </div>
  );
}

// ─── Map rendering helpers ────────────────────────────────────────────────────

function renderRoute(map, mapboxgl, geoPoints, currentLocation) {
  // Clean up previous markers
  if (window.__trackingMarkers) {
    window.__trackingMarkers.forEach(m => m.remove());
  }
  window.__trackingMarkers = [];

  // Remove existing layers / sources safely
  ['tracking-route', 'tracking-route-points'].forEach(id => {
    if (map.getLayer(id)) map.removeLayer(id);
  });
  if (map.getSource('tracking-route')) map.removeSource('tracking-route');
  if (map.getSource('tracking-points')) map.removeSource('tracking-points');

  if (geoPoints.length === 0) return;

  const coordinates = geoPoints.map(cp => [cp.lng, cp.lat]);

  // ── Route line ──
  map.addSource('tracking-route', {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates },
    },
  });

  map.addLayer({
    id: 'tracking-route',
    type: 'line',
    source: 'tracking-route',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-color': 'rgba(6,182,212,0.45)',
      'line-width': 2,
      'line-dasharray': [4, 3],
    },
  });

  // ── Checkpoint markers ──
  geoPoints.forEach((cp, i) => {
    const isCurrent = i === 0;
    const el = document.createElement('div');
    el.style.cssText = `
      width: ${isCurrent ? 18 : 12}px;
      height: ${isCurrent ? 18 : 12}px;
      border-radius: 50%;
      background: ${isCurrent ? '#06b6d4' : '#60a5fa'};
      border: 2px solid ${isCurrent ? 'rgba(6,182,212,0.6)' : 'rgba(96,165,250,0.5)'};
      box-shadow: 0 0 ${isCurrent ? '12px rgba(6,182,212,0.7)' : '6px rgba(96,165,250,0.4)'};
      cursor: pointer;
    `;

    // Popup
    const dateStr = cp.datetime
      ? new Date(cp.datetime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
      : '';

    const popup = new mapboxgl.Popup({
      offset: 14,
      closeButton: false,
      maxWidth: '220px',
      className: 'tracking-popup',
    }).setHTML(`
      <div style="
        background:#161616;
        border:1px solid rgba(255,255,255,0.1);
        border-radius:8px;
        padding:10px 12px;
        font-family:'DM Sans',sans-serif;
        color:#fff;
      ">
        ${isCurrent ? '<div style="font-size:10px;color:#06b6d4;font-weight:700;margin-bottom:4px;text-transform:uppercase;letter-spacing:.05em">Current Location</div>' : ''}
        <div style="font-size:12px;font-weight:600;line-height:1.4;margin-bottom:3px">${cp.message || 'Checkpoint'}</div>
        ${cp.location ? `<div style="font-size:10px;color:rgba(255,255,255,0.45)">${cp.location}</div>` : ''}
        ${dateStr ? `<div style="font-size:10px;color:rgba(255,255,255,0.3);margin-top:4px">${dateStr}</div>` : ''}
      </div>
    `);

    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat([cp.lng, cp.lat])
      .setPopup(popup)
      .addTo(map);

    window.__trackingMarkers.push(marker);

    // Auto-open popup for current location
    if (isCurrent) marker.togglePopup();
  });

  // ── Fit bounds ──
  if (coordinates.length === 1) {
    map.flyTo({ center: coordinates[0], zoom: 7, duration: 1200 });
  } else {
    const bounds = coordinates.reduce(
      (b, c) => b.extend(c),
      new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
    );
    map.fitBounds(bounds, { padding: { top: 60, bottom: 60, left: 60, right: 60 }, maxZoom: 10, duration: 1200 });
  }
}
