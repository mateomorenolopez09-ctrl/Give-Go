import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Search, Navigation, Check, AlertTriangle } from 'lucide-react';

// Fix for default Leaflet marker icon in Vite
// @ts-ignore
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// @ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface LocationPickerProps {
  lat: number | null | undefined;
  lng: number | null | undefined;
  onChange: (coords: {
    lat: number;
    lng: number;
    direccion?: string;
    barrio?: string;
    localidad?: string;
    ciudad?: string;
    departamento?: string;
    pais?: string;
  }) => void;
  initialSearchTerm?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  lat,
  lng,
  onChange,
  initialSearchTerm = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState(initialSearchTerm);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Default coordinate: Kennedy, Bogotá
  const defaultLat = 4.624335;
  const defaultLng = -74.125804;

  const currentLat = lat || defaultLat;
  const currentLng = lng || defaultLng;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Prevent re-initialization
    if (mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView([currentLat, currentLng], 14);
    mapRef.current = map;

    // Add OpenStreetMap layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Create marker
    const marker = L.marker([currentLat, currentLng], {
      draggable: true,
    }).addTo(map);
    markerRef.current = marker;

    // Handle marker drag end
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      handleCoordsChange(position.lat, position.lng);
    });

    // Handle map click to place marker
    map.on('click', (e) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      marker.setLatLng([clickLat, clickLng]);
      handleCoordsChange(clickLat, clickLng);
    });

    // Clean up
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update marker position if prop coordinates change externally
  useEffect(() => {
    if (mapRef.current && markerRef.current && lat && lng) {
      const markerLatLng = markerRef.current.getLatLng();
      if (markerLatLng.lat !== lat || markerLatLng.lng !== lng) {
        markerRef.current.setLatLng([lat, lng]);
        mapRef.current.panTo([lat, lng]);
      }
    }
  }, [lat, lng]);

  // Reverse geocoding using Nominatim (OpenStreetMap)
  const handleCoordsChange = async (newLat: number, newLng: number) => {
    try {
      setSuccessMsg('Ubicación seleccionada. Obteniendo dirección...');
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'es' } }
      );
      if (!res.ok) throw new Error('Error al consultar geocodificación inversa');
      const data = await res.json();

      const addr = data.address || {};
      const road = addr.road || addr.pedestrian || addr.suburb || '';
      const houseNumber = addr.house_number || '';
      const direction = road ? `${road} ${houseNumber}`.trim() : '';

      const barrio = addr.neighbourhood || addr.suburb || addr.village || addr.residential || '';
      const localidad = addr.suburb || addr.city_district || 'Kennedy';
      const ciudad = addr.city || addr.town || addr.municipality || 'Bogotá';
      const departamento = addr.state || 'Bogotá D.C.';
      const pais = addr.country || 'Colombia';

      onChange({
        lat: newLat,
        lng: newLng,
        direccion: direction || data.display_name,
        barrio,
        localidad,
        ciudad,
        departamento,
        pais,
      });
      setSuccessMsg('Dirección cargada correctamente.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      // Fallback update without address details
      onChange({ lat: newLat, lng: newLng });
      setSuccessMsg('Coordenadas actualizadas.');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  // Forward geocoding (Search address)
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setSuccessMsg(null);

    try {
      // Append Bogotá, Colombia if not explicitly mentioned, to focus on the target area
      let fullQuery = searchQuery;
      if (!queryContainsTarget(searchQuery)) {
        fullQuery = `${searchQuery}, Bogotá, Colombia`;
      }

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          fullQuery
        )}&limit=1&addressdetails=1`,
        { headers: { 'Accept-Language': 'es' } }
      );
      if (!res.ok) throw new Error('Error en búsqueda de dirección');
      const results = await res.json();

      if (results.length === 0) {
        throw new Error('No se encontró ningún lugar con esta dirección. Intente ser más específico.');
      }

      const place = results[0];
      const newLat = parseFloat(place.lat);
      const newLng = parseFloat(place.lon);

      if (mapRef.current && markerRef.current) {
        markerRef.current.setLatLng([newLat, newLng]);
        mapRef.current.setView([newLat, newLng], 15);
      }

      const addr = place.address || {};
      const road = addr.road || addr.pedestrian || addr.suburb || '';
      const houseNumber = addr.house_number || '';
      const direction = road ? `${road} ${houseNumber}`.trim() : '';

      const barrio = addr.neighbourhood || addr.suburb || addr.village || addr.residential || '';
      const localidad = addr.suburb || addr.city_district || 'Kennedy';
      const ciudad = addr.city || addr.town || addr.municipality || 'Bogotá';
      const departamento = addr.state || 'Bogotá D.C.';
      const pais = addr.country || 'Colombia';

      onChange({
        lat: newLat,
        lng: newLng,
        direccion: direction || place.display_name,
        barrio,
        localidad,
        ciudad,
        departamento,
        pais,
      });

      setSuccessMsg('Dirección encontrada con éxito.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setSearchError(err.message || 'Error al buscar ubicación');
    } finally {
      setIsSearching(false);
    }
  };

  const queryContainsTarget = (q: string) => {
    const qLower = q.toLowerCase();
    return qLower.includes('bogota') || qLower.includes('bogotá') || qLower.includes('colombia');
  };

  return (
    <div className="space-y-3">
      <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest select-none">
        Ubicación en el Mapa Interactiva (Leaflet + OpenStreetMap)
      </label>

      {/* Buscador sobre el mapa */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            className="w-full px-4 py-2.5 text-xs border border-neutral-200 rounded-xl bg-white text-neutral-950 placeholder-neutral-400 focus:outline-none focus:ring-4 focus:ring-red-600/10 focus:border-red-600 transition-all duration-150 pr-8"
            placeholder="Buscar dirección en Bogotá (Ej: Sede de la organización, calle, etc.)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <MapPin className="absolute right-3 top-3 w-4 h-4 text-neutral-400 pointer-events-none" />
        </div>
        <button
          type="button"
          onClick={() => handleSearch()}
          disabled={isSearching}
          className="bg-red-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-1.5 shrink-0 shadow-xs shadow-red-600/15 cursor-pointer"
        >
          {isSearching ? '...' : <Search className="w-3.5 h-3.5" />}
          <span>Buscar</span>
        </button>
      </div>

      {searchError && (
        <div className="bg-red-50 border border-red-200 p-2 rounded flex items-center gap-2 text-xs text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{searchError}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-neutral-50 border border-neutral-200 p-2 rounded flex items-center gap-2 text-xs text-neutral-800">
          <Check className="w-4 h-4 text-neutral-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Map Container */}
      <div className="relative border border-neutral-200 rounded-lg overflow-hidden shadow-xs">
        <div ref={mapContainerRef} className="w-full h-64 z-0" />
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2 py-1 rounded border border-neutral-200 text-[9px] font-semibold text-neutral-500 z-10">
          Arrastra el marcador o haz clic en el mapa para posicionar.
        </div>
      </div>

      {/* Coordinates readout */}
      <div className="flex justify-between items-center bg-neutral-50 border border-neutral-200 px-3 py-2 rounded-lg text-[10px] text-neutral-600 font-mono">
        <div className="flex gap-4">
          <span>Lat: <strong className="text-neutral-900">{lat ? lat.toFixed(6) : 'No definida'}</strong></span>
          <span>Lng: <strong className="text-neutral-900">{lng ? lng.toFixed(6) : 'No definida'}</strong></span>
        </div>
        <span className="text-[9px] text-neutral-400 uppercase font-sans">Coordenadas del Evento</span>
      </div>
    </div>
  );
};
