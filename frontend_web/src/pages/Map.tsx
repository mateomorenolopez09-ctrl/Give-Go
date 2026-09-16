import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { OrganizationService, EventService, CategoryService } from '../services/db';
import { Organizacion, Evento, Categoria } from '../types';
import { Card, Badge, Button, formatDate, Select, SearchBar } from '../components/UI';
import { MapPin, Building2, Phone, Mail, Navigation, Heart, Calendar, Eye, Layers, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

// Haversine formula to calculate distance between two coordinates in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const Map: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organizacion[]>([]);
  const [events, setEvents] = useState<Evento[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);

  // Selected item on map (can be an organization or an event)
  const [selectedItem, setSelectedItem] = useState<{
    type: 'organization' | 'event';
    data: any;
  } | null>(null);

  // User location and filters
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [maxDistance, setMaxDistance] = useState<number>(0); // 0 means all, otherwise radius in km

  // Filters
  const [filterType, setFilterType] = useState<'all' | 'org' | 'event'>('all');
  const [filterCat, setFilterCat] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Kennedy default position
  const centerLat = 4.6215;
  const centerLng = -74.1280;

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(coords);
        setIsLocating(false);
        if (mapRef.current) {
          mapRef.current.setView([coords.lat, coords.lng], 14);
        }
      },
      (error) => {
        console.warn('Geolocation unavailable or permission denied:', error?.message || 'Access denied');
        setIsLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    async function loadData() {
      const orgs = await OrganizationService.getAll();
      const evts = await EventService.getAll();
      const cats = await CategoryService.getAll();

      setOrganizations(orgs);
      setEvents(evts.filter(e => e.estado === 'activo'));
      setCategories(cats);

      // Select first organization as default detail
      if (orgs.length > 0) {
        setSelectedItem({ type: 'organization', data: orgs[0] });
      }
    }
    loadData();
  }, []);

  // Map initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], 13);
    mapRef.current = map;

    // Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Layer Group for dynamic marker updates
    const group = L.layerGroup().addTo(map);
    markersGroupRef.current = group;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersGroupRef.current = null;
      }
    };
  }, []);

  // Update Markers when data, filters, or user position changes
  useEffect(() => {
    if (!mapRef.current || !markersGroupRef.current) return;

    // Clear previous markers
    markersGroupRef.current.clearLayers();

    const bounds: L.LatLngExpression[] = [];

    // Helper for fallbacks to avoid stacking on exact same spot if lat/lng is missing
    const getFallbackCoords = (index: number) => {
      // Small offsets around Kennedy center
      const offsetLat = [0, -0.005, 0.006, -0.003, 0.004, -0.006];
      const offsetLng = [0, 0.007, -0.004, -0.007, 0.005, 0.003];
      const i = index % offsetLat.length;
      return {
        lat: centerLat + offsetLat[i],
        lng: centerLng + offsetLng[i]
      };
    };

    // 0. Add User Current Location Marker
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-user-location-marker',
        html: `<div class="relative flex items-center justify-center">
                 <div class="absolute w-8 h-8 rounded-full bg-indigo-500 animate-ping opacity-35"></div>
                 <div class="absolute w-5 h-5 rounded-full bg-indigo-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
                   <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
                 </div>
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon });
      userMarker.bindPopup(`
        <div class="text-neutral-900 font-sans p-1.5 text-center">
          <span class="text-[9px] font-extrabold uppercase tracking-widest text-indigo-600">Tu Ubicación</span>
          <h4 class="font-bold text-xs leading-tight m-0 text-neutral-950">Estás aquí</h4>
          <p class="text-[9px] text-neutral-500 m-0">Descubriendo causas cercanas</p>
        </div>
      `);
      userMarker.addTo(markersGroupRef.current);
      bounds.push([userLocation.lat, userLocation.lng]);
    }

    // 1. Add Organizations
    if (filterType === 'all' || filterType === 'org') {
      organizations.forEach((org, idx) => {
        // Matches search term
        if (searchTerm && !org.nombre.toLowerCase().includes(searchTerm.toLowerCase()) && !org.direccion.toLowerCase().includes(searchTerm.toLowerCase())) {
          return;
        }

        const orgLat = org.latitud ? Number(org.latitud) : getFallbackCoords(idx).lat;
        const orgLng = org.longitud ? Number(org.longitud) : getFallbackCoords(idx).lng;

        // Proximity Filtering
        let distance: number | null = null;
        if (userLocation) {
          distance = calculateDistance(userLocation.lat, userLocation.lng, orgLat, orgLng);
          if (maxDistance > 0 && distance > maxDistance) {
            return;
          }
        }

        // Custom divIcon for Organizacion using blue theme
        const orgIcon = L.divIcon({
          className: 'custom-org-marker',
          html: `<div class="w-9 h-9 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all cursor-pointer">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="2" width="18" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="16"/><line x1="15" y1="22" x2="15" y2="16"/><line x1="9" y1="16" x2="15" y2="16"/><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M9 14h.01"/><path d="M15 14h.01"/><path d="M9 6h.01"/><path d="M15 6h.01"/></svg>
                 </div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([orgLat, orgLng], { icon: orgIcon });
        
        // Popup with distance info
        const distanceStr = distance !== null 
          ? `<p class="text-[9px] font-bold text-indigo-600 m-0 bg-indigo-50 px-1.5 py-0.5 rounded w-fit">A ${distance.toFixed(2)} km de ti</p>`
          : '';

        marker.bindPopup(`
          <div class="text-neutral-900 font-sans p-1.5 space-y-1">
            <span class="text-[9px] font-extrabold uppercase tracking-widest text-blue-600">Sede de Organización</span>
            <h4 class="font-bold text-xs leading-tight m-0 text-neutral-950">${org.nombre}</h4>
            <p class="text-[10px] text-neutral-500 m-0">${org.direccion || ''}</p>
            ${distanceStr}
            <div class="pt-1.5 flex gap-1">
              <button id="btn-select-org-${org.id}" class="bg-blue-600 text-white text-[9px] font-bold px-2 py-1 rounded hover:bg-blue-700 transition-colors cursor-pointer border-none w-full">
                Ver Detalles
              </button>
            </div>
          </div>
        `);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-select-org-${org.id}`);
          if (btn) {
            btn.addEventListener('click', () => {
              setSelectedItem({ type: 'organization', data: org });
            });
          }
        });

        marker.addTo(markersGroupRef.current!);
        bounds.push([orgLat, orgLng]);
      });
    }

    // 2. Add Events
    if (filterType === 'all' || filterType === 'event') {
      events.forEach((evt, idx) => {
        // Matches search term
        if (searchTerm && !evt.nombre.toLowerCase().includes(searchTerm.toLowerCase()) && !evt.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) {
          return;
        }

        // Matches category
        if (filterCat !== 'todos' && evt.categoria !== filterCat) {
          return;
        }

        const evtLat = evt.latitud ? Number(evt.latitud) : getFallbackCoords(idx + 10).lat;
        const evtLng = evt.longitud ? Number(evt.longitud) : getFallbackCoords(idx + 10).lng;

        // Proximity Filtering
        let distance: number | null = null;
        if (userLocation) {
          distance = calculateDistance(userLocation.lat, userLocation.lng, evtLat, evtLng);
          if (maxDistance > 0 && distance > maxDistance) {
            return;
          }
        }

        // Custom divIcon for Event using brand/emerald theme based on category
        const isReforestacion = evt.categoria.toLowerCase().includes('medio') || evt.categoria.toLowerCase().includes('reforest');
        const colorClass = isReforestacion ? 'bg-emerald-600' : 'bg-brand';

        const evtIcon = L.divIcon({
          className: 'custom-evt-marker',
          html: `<div class="w-9 h-9 rounded-full ${colorClass} border-2 border-white flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all cursor-pointer animate-pulse">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                 </div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([evtLat, evtLng], { icon: evtIcon });

        // Popup with distance info
        const distanceStr = distance !== null 
          ? `<p class="text-[9px] font-bold text-indigo-600 m-0 bg-indigo-50 px-1.5 py-0.5 rounded w-fit">A ${distance.toFixed(2)} km de ti</p>`
          : '';

        marker.bindPopup(`
          <div class="text-neutral-900 font-sans p-1.5 space-y-1">
            <span class="text-[9px] font-extrabold uppercase tracking-widest text-emerald-600">Convocatoria Solidaria</span>
            <h4 class="font-bold text-xs leading-tight m-0 text-neutral-950">${evt.nombre}</h4>
            <p class="text-[10px] text-neutral-500 m-0">${evt.direccion || ''}</p>
            ${distanceStr}
            <div class="pt-1.5 flex gap-1">
              <button id="btn-select-evt-${evt.id}" class="bg-emerald-600 text-white text-[9px] font-bold px-2 py-1 rounded hover:bg-emerald-700 transition-colors cursor-pointer border-none w-full">
                Ver Detalles
              </button>
            </div>
          </div>
        `);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-select-evt-${evt.id}`);
          if (btn) {
            btn.addEventListener('click', () => {
              setSelectedItem({ type: 'event', data: evt });
            });
          }
        });

        marker.addTo(markersGroupRef.current!);
        bounds.push([evtLat, evtLng]);
      });
    }

    // Pan map to encompass filtered markers if any exist
    if (bounds.length > 0 && mapRef.current) {
      mapRef.current.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 14 });
    }
  }, [organizations, events, filterType, filterCat, searchTerm, userLocation, maxDistance]);

  // Center Map on selected sidebar item
  const handleCenterOnMap = () => {
    if (!selectedItem || !mapRef.current) return;
    const item = selectedItem.data;
    if (item.latitud && item.longitud) {
      mapRef.current.setView([Number(item.latitud), Number(item.longitud)], 16);
    }
  };

  const getOrgName = (orgId: string) => {
    return organizations.find(o => o.id === orgId)?.nombre || 'Organización';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-neutral-900 uppercase tracking-wider">Mapa Solidario Interactivo</h1>
        <p className="text-xs text-neutral-500 mt-1">
          Explora la distribución geográfica de organizaciones benéficas y eventos de voluntariado en tiempo real sobre Kennedy y Bogotá.
        </p>
      </div>

      {/* Controladores de Filtro */}
      <div className="bg-white border border-neutral-200 p-4 rounded shadow-xs grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-3">
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 mb-1.5 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            Tipo de Marcador
          </label>
          <select
            value={filterType}
            onChange={(e: any) => setFilterType(e.target.value)}
            className="w-full text-xs border border-neutral-300 rounded-lg px-2 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white font-medium"
          >
            <option value="all">Todos los marcadores</option>
            <option value="org">Sedes de Organizaciones</option>
            <option value="event">Eventos / Convocatorias</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 mb-1.5 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Categoría del Evento
          </label>
          <select
            value={filterCat}
            onChange={(e: any) => setFilterCat(e.target.value)}
            disabled={filterType === 'org'}
            className="w-full text-xs border border-neutral-300 rounded-lg px-2 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white font-medium disabled:opacity-50"
          >
            <option value="todos">Todas las categorías</option>
            {categories.map(c => (
              <option key={c.id} value={c.nombre}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 mb-1.5 flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5" />
            Rango de Cercanía
          </label>
          <select
            value={maxDistance}
            onChange={(e: any) => setMaxDistance(Number(e.target.value))}
            disabled={!userLocation}
            className="w-full text-xs border border-neutral-300 rounded-lg px-2 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white font-medium disabled:opacity-50"
          >
            <option value={0}>{userLocation ? "Mostrar todo (Sin límite)" : "Activar GPS para filtrar"}</option>
            <option value={2}>Cercanos (A menos de 2 km)</option>
            <option value={5}>Cercanos (A menos de 5 km)</option>
            <option value={10}>Cercanos (A menos de 10 km)</option>
            <option value={20}>Cercanos (A menos de 20 km)</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <button
            type="button"
            onClick={requestUserLocation}
            disabled={isLocating}
            className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold px-3 py-2 rounded-lg border border-neutral-300 transition-colors flex items-center justify-center gap-1.5 shrink-0 h-[38px] disabled:opacity-50 cursor-pointer"
          >
            <Navigation className={`w-3.5 h-3.5 text-indigo-600 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Obteniendo GPS...' : 'Mi Ubicación'}</span>
          </button>
        </div>

        <div className="md:col-span-12">
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Búsqueda rápida en el mapa..." />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leaflet Map Container */}
        <div className="lg:col-span-2 border border-neutral-200 rounded-lg overflow-hidden relative shadow-xs">
          {/* Quick Info header on map */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded border border-neutral-200 text-xs font-semibold text-neutral-700 shadow-xs z-[1000] flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-blue-600 animate-pulse" />
            <span>Zona de Cobertura Activa: Bogotá D.C.</span>
          </div>

          <div ref={mapContainerRef} className="w-full h-[500px] z-0" />

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs border border-neutral-200 p-3 rounded-lg text-xs text-neutral-600 font-bold flex gap-4 shadow-sm z-[1000] flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-blue-600 inline-block border-2 border-white shadow-xs" />
              <span>Sedes de Organizaciones (ONG)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-red-500 inline-block border-2 border-white shadow-xs" />
              <span>Campañas de Soporte Social</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-600 inline-block border-2 border-white shadow-xs" />
              <span>Campañas de Reforestación / Ambiental</span>
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="lg:col-span-1">
          {selectedItem ? (
            <div className="space-y-6">
              {selectedItem.type === 'organization' ? (
                <Card
                  title={selectedItem.data.nombre}
                  subtitle="Información de la ONG"
                  footer={
                    <div className="w-full space-y-2">
                      {selectedItem.data.latitud && selectedItem.data.longitud && (
                        <Button variant="outline" size="sm" className="w-full" onClick={handleCenterOnMap}>
                          <Navigation className="w-4 h-4 mr-1.5" />
                          Centrar en el Mapa
                        </Button>
                      )}
                      <Link to="/events" className="block w-full">
                        <Button variant="primary" size="sm" className="w-full">
                          Ver Convocatorias de Voluntariado
                        </Button>
                      </Link>
                    </div>
                  }
                >
                  <div className="space-y-4">
                    <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                      {selectedItem.data.descripcion || 'Esta organización trabaja en Kennedy impulsando causas de apoyo social.'}
                    </p>

                    {userLocation && selectedItem.data.latitud && selectedItem.data.longitud && (
                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-indigo-900 flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Navigation className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                          <span>Distancia desde ti:</span>
                        </div>
                        <span className="font-extrabold text-xs text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-100">
                          {calculateDistance(userLocation.lat, userLocation.lng, Number(selectedItem.data.latitud), Number(selectedItem.data.longitud)).toFixed(2)} km
                        </span>
                      </div>
                    )}

                    <div className="space-y-3 text-xs text-neutral-600 font-medium">
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-2.5 text-neutral-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-neutral-950">{selectedItem.data.direccion}</p>
                          <p className="text-[10px] text-neutral-400">
                            {selectedItem.data.barrio ? `Barrio: ${selectedItem.data.barrio}` : ''}
                            {selectedItem.data.localidad ? ` | Localidad: ${selectedItem.data.localidad}` : ''}
                          </p>
                        </div>
                      </div>

                      {selectedItem.data.telefono && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2.5 text-neutral-400 shrink-0" />
                          <span>{selectedItem.data.telefono}</span>
                        </div>
                      )}

                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2.5 text-neutral-400 shrink-0" />
                        <a href={`mailto:${selectedItem.data.correo}`} className="text-neutral-900 hover:underline">{selectedItem.data.correo}</a>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card
                  title={selectedItem.data.nombre}
                  subtitle={`Convocatoria - ${selectedItem.data.categoria}`}
                  footer={
                    <div className="w-full space-y-2">
                      {selectedItem.data.latitud && selectedItem.data.longitud && (
                        <Button variant="outline" size="sm" className="w-full" onClick={handleCenterOnMap}>
                          <Navigation className="w-4 h-4 mr-1.5" />
                          Centrar en el Mapa
                        </Button>
                      )}
                      <Link to="/events" className="block w-full">
                        <Button variant="primary" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-1.5" />
                          Ver Detalles & Registrarme
                        </Button>
                      </Link>
                    </div>
                  }
                >
                  <div className="space-y-4">
                    <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                      {selectedItem.data.descripcion}
                    </p>

                    {userLocation && selectedItem.data.latitud && selectedItem.data.longitud && (
                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-indigo-900 flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Navigation className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                          <span>Distancia desde ti:</span>
                        </div>
                        <span className="font-extrabold text-xs text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-100">
                          {calculateDistance(userLocation.lat, userLocation.lng, Number(selectedItem.data.latitud), Number(selectedItem.data.longitud)).toFixed(2)} km
                        </span>
                      </div>
                    )}

                    <div className="space-y-3 text-xs text-neutral-600 font-medium">
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 mr-2.5 text-neutral-400 shrink-0" />
                        <span>Organiza: <strong className="text-neutral-900">{getOrgName(selectedItem.data.organizacionId)}</strong></span>
                      </div>

                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2.5 text-neutral-400 shrink-0" />
                        <span>Fecha: <strong className="text-neutral-950">{formatDate(selectedItem.data.fecha)}</strong></span>
                      </div>

                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-2.5 text-neutral-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-neutral-950">{selectedItem.data.direccion}</p>
                          {selectedItem.data.nombre_lugar && (
                            <p className="text-xs text-neutral-500 font-semibold mt-0.5">
                              Lugar: <span className="text-neutral-800 font-bold">{selectedItem.data.nombre_lugar}</span>
                            </p>
                          )}
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            {selectedItem.data.barrio ? `Barrio: ${selectedItem.data.barrio}` : ''}
                            {selectedItem.data.localidad ? ` | Localidad: ${selectedItem.data.localidad}` : ''}
                          </p>
                          <p className="text-[10px] text-neutral-400">
                            Bogotá, Colombia
                          </p>
                        </div>
                      </div>

                      {selectedItem.data.punto_referencia && (
                        <div className="bg-neutral-50 p-3 rounded-xl text-xs border border-neutral-100">
                          <span className="font-bold text-neutral-700 block mb-0.5">Punto de referencia:</span>
                          <span className="text-neutral-600">{selectedItem.data.punto_referencia}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded p-6 text-center text-xs text-neutral-400">
              Selecciona un marcador en el mapa para consultar su ficha detallada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
