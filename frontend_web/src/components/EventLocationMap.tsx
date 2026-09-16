import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface EventLocationMapProps {
  lat: number;
  lng: number;
  title: string;
}

export const EventLocationMap: React.FC<EventLocationMapProps> = ({ lat, lng, title }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    // Initialize map
    const map = L.map(containerRef.current, {
      zoomControl: true,
      dragging: true,
      scrollWheelZoom: false,
    }).setView([lat, lng], 15);

    mapRef.current = map;

    // Add Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Add Custom/Default Marker
    L.marker([lat, lng])
      .addTo(map)
      .bindPopup(`<strong>${title}</strong><br/>Ubicación del evento solidario`)
      .openPopup();

    // Invalidate size once to guarantee it renders correctly if container resized
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, title]);

  return (
    <div className="relative border border-neutral-200 rounded-lg overflow-hidden shadow-xs">
      <div ref={containerRef} className="w-full h-48 z-0" />
    </div>
  );
};
