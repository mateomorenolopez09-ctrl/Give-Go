import React, { useEffect, useState } from 'react';
import { EventService, CategoryService, OrganizationService, PostulacionService } from '../services/db';
import { Evento, Categoria, Organizacion, Postulacion } from '../types';
import { Card, Button, SearchBar, Select, Badge, Alert, EmptyState, formatDate, Modal } from '../components/UI';
import { UserLink } from '../components/UserLink';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { Calendar, Building2, Tag, CheckCircle2, MapPin, Info, Users, HelpCircle, HeartHandshake } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { EventLocationMap } from '../components/EventLocationMap';

const getCategoryBanner = (category: string) => {
  const normalized = category.toLowerCase();
  if (normalized.includes('aliment') || normalized.includes('comid') || normalized.includes('nutric')) {
    return 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop';
  }
  if (normalized.includes('educa') || normalized.includes('escuel') || normalized.includes('niñ') || normalized.includes('aprend')) {
    return 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format&fit=crop';
  }
  if (normalized.includes('salud') || normalized.includes('medic') || normalized.includes('hospital') || normalized.includes('bienest')) {
    return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=600&auto=format&fit=crop';
  }
  if (normalized.includes('medio') || normalized.includes('ambient') || normalized.includes('arbol') || normalized.includes('reforest') || normalized.includes('ecolog')) {
    return 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=600&auto=format&fit=crop';
  }
  if (normalized.includes('animal') || normalized.includes('perr') || normalized.includes('gato') || normalized.includes('mascot')) {
    return 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=600&auto=format&fit=crop';
  }
  // Default general volunteering
  return 'https://images.unsplash.com/photo-1559027615-cd9995a0c950?q=80&w=600&auto=format&fit=crop';
};

export const Events: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Evento[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [organizations, setOrganizations] = useState<Organizacion[]>([]);
  const [myEventIds, setMyEventIds] = useState<string[]>([]);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('todos');
  const [selectedOrg, setSelectedOrg] = useState('todos');

  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Detail Modal
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    const evts = await EventService.getAll();
    setEvents(evts);

    const cats = await CategoryService.getAll();
    setCategories(cats.filter(c => c.estado === 'activo'));

    const orgs = await OrganizationService.getAll();
    setOrganizations(orgs);

    if (user) {
      if (user.rol === 'voluntario' || user.rol === 'admin') {
        const myEvts = await EventService.getEventsByVolunteer(user.id);
        setMyEventIds(myEvts.map(e => e.id));
      } else if (user.rol === 'beneficiario') {
        const myPostulaciones = await PostulacionService.getByUser(user.id, 'beneficiario');
        setMyEventIds(myPostulaciones.map(p => String(p.eventoId)));
      }
    }
  }

  // Filtrado de eventos
  const filteredEvents = events.filter(evt => {
    const matchesSearch = 
      evt.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evt.direccion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evt.barrio || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evt.localidad || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCat = selectedCat === 'todos' || evt.categoria === selectedCat;
    const matchesOrg = selectedOrg === 'todos' || evt.organizacionId === selectedOrg;
    const isActive = evt.estado === 'activo';

    return matchesSearch && matchesCat && matchesOrg && isActive;
  });

  const handleInscribe = async (eventoId: string) => {
    if (!user) {
      setMessage({ type: 'danger', text: 'Debes iniciar sesión para postularte o inscribirte.' });
      return;
    }

    if (user.rol === 'beneficiario') {
      const res = await PostulacionService.create({
        id_evento: eventoId,
        id_usuario: user.id,
        tipo_postulacion: 'beneficiario',
        observaciones: 'Postulación realizada desde la lista de eventos.'
      });

      if (res?.success) {
        setMessage({ type: 'success', text: '¡Te has postulado exitosamente para recibir ayuda en este evento!' });
        setMyEventIds([...myEventIds, eventoId]);
        loadData();
      } else {
        setMessage({ type: 'danger', text: res?.message || 'Ya estás postulado a este evento.' });
      }
      return;
    }

    if (user.rol === 'voluntario' || user.rol === 'admin') {
      const success = await EventService.registerParticipant(eventoId, user.id);
      await PostulacionService.create({
        id_evento: eventoId,
        id_usuario: user.id,
        tipo_postulacion: 'voluntario'
      });

      if (success) {
        setMessage({ type: 'success', text: '¡Te has inscrito exitosamente como voluntario en el evento!' });
        setMyEventIds([...myEventIds, eventoId]);
        loadData();
      } else {
        setMessage({ type: 'danger', text: 'Ya estás inscrito en este evento.' });
      }
      return;
    }

    setMessage({ type: 'danger', text: 'Solo voluntarios o beneficiarios pueden inscribirse o postularse en eventos.' });
  };

  const handleUnsubscribe = async (eventoId: string) => {
    if (!user) return;
    const success = await EventService.unregisterParticipant(eventoId, user.id);
    if (success) {
      setMessage({ type: 'success', text: 'Has cancelado tu inscripción en el evento.' });
      setMyEventIds(myEventIds.filter(id => id !== eventoId));
      loadData(); // Reload
    }
  };

  const getOrgName = (evtOrId: Evento | string) => {
    if (typeof evtOrId === 'object' && evtOrId.organizacionNombre) {
      return evtOrId.organizacionNombre;
    }
    const orgId = typeof evtOrId === 'string' ? evtOrId : evtOrId.organizacionId;
    const cleanId = String(orgId || '').replace('org_', '');
    const found = organizations.find(o => o.id === orgId || o.id === `org_${cleanId}` || o.id === cleanId);
    if (found?.nombre) return found.nombre;
    if (typeof evtOrId === 'object' && evtOrId.organizacionNombre) return evtOrId.organizacionNombre;
    return 'Organización';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-neutral-900 uppercase tracking-wider">Eventos de Voluntariado</h1>
        <p className="text-xs text-neutral-500 mt-1">Busca e inscríbete en causas benéficas creadas por nuestras organizaciones asociadas.</p>
      </div>

      {message && (
        <Alert 
          type={message.type === 'success' ? 'success' : 'danger'} 
          message={message.text} 
          className="mb-4"
        />
      )}

      {/* Panel de Filtros */}
      <div className="bg-white border border-neutral-200 p-5 rounded shadow-xs flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">Buscar por nombre o dirección</label>
          <SearchBar 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Ej: recogida, Kennedy, reforestación..." 
          />
        </div>
        
        <div className="w-full md:w-56">
          <Select
            label="Filtrar Categoría"
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            options={[
              { value: 'todos', label: 'Todas las categorías' },
              ...categories.map(c => ({ value: c.nombre, label: c.nombre }))
            ]}
          />
        </div>

        <div className="w-full md:w-56">
          <Select
            label="Filtrar Organización"
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
            options={[
              { value: 'todos', label: 'Todas las organizaciones' },
              ...organizations.map(o => ({ value: o.id, label: o.nombre }))
            ]}
          />
        </div>
      </div>

      {/* Grid de Eventos */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          title="Sin Eventos"
          description="No se encontraron eventos activos que coincidan con los criterios de búsqueda establecidos."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => {
            const isRegistered = myEventIds.includes(evt.id);
            const eventImg = evt.imagen || getCategoryBanner(evt.categoria);
            return (
              <div
                key={evt.id}
                className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white hover:border-neutral-350 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
              >
                {/* Imagen del Evento */}
                <div className="relative w-full h-48 overflow-hidden bg-neutral-100">
                  <img
                    src={eventImg}
                    alt={evt.nombre}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                  
                  {/* Badge de Categoría */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white shadow-sm">
                      <Tag className="w-3 h-3 mr-1" />
                      {evt.categoria}
                    </span>
                  </div>
                  
                  {/* Badges de Vacantes (Beneficiarios y Voluntarios) */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-extrabold bg-emerald-900/90 backdrop-blur-xs text-white shadow-sm border border-emerald-400/30">
                      <HeartHandshake className="w-3 h-3 mr-1 text-emerald-300" />
                      Vacantes Beneficiarios: {evt.vacantesBeneficiarios ?? 20}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-neutral-900/80 backdrop-blur-xs text-white shadow-sm">
                      <Users className="w-3 h-3 mr-1 text-neutral-300" />
                      Vacantes Voluntarios: {evt.vacantesVoluntarios ?? evt.cupo ?? 0}
                    </span>
                  </div>
                </div>

                {/* Contenido del Evento */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-sm font-extrabold text-neutral-950 leading-snug group-hover:text-red-600 transition-colors line-clamp-1">
                      {evt.nombre}
                    </h3>
                    
                    <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3 min-h-[3.375rem]">
                      {evt.descripcion}
                    </p>
                    
                    {evt.ayudaOfrecida && (
                      <div className="bg-emerald-50/90 border border-emerald-200 p-2.5 rounded-xl text-xs text-emerald-950">
                        <span className="font-extrabold block text-[11px] text-emerald-900 mb-0.5">
                          🎁 Beneficio / Ayuda Ofrecida:
                        </span>
                        <p className="text-[11px] leading-snug text-emerald-800 line-clamp-2">{evt.ayudaOfrecida}</p>
                      </div>
                    )}

                    <div className="pt-3 border-t border-neutral-100 space-y-2 text-xs text-neutral-500 font-semibold">
                      <div className="flex items-center text-neutral-700">
                        <Building2 className="w-4 h-4 mr-2 text-neutral-400 shrink-0" />
                        <span className="truncate flex items-center gap-1">
                          Organiza: 
                          <UserLink 
                            userId={evt.organizacionId.startsWith('org_') ? evt.organizacionId : `org_${evt.organizacionId}`} 
                            name={getOrgName(evt)} 
                            role="organizacion" 
                            verificada={Boolean(organizations.find(o => o.id === evt.organizacionId || `org_${o.id}` === evt.organizacionId || o.id === evt.organizacionId.replace('org_', ''))?.verificada)}
                            size="sm" 
                            showAvatar={false} 
                          />
                        </span>
                      </div>
                      <div className="flex items-center text-neutral-700">
                        <Calendar className="w-4 h-4 mr-2.5 text-neutral-400 shrink-0" />
                        <span>Fecha: <span className="text-neutral-950 font-bold">{formatDate(evt.fecha)}</span></span>
                      </div>
                      <div className="flex items-center text-neutral-700">
                        <MapPin className="w-4 h-4 mr-2.5 text-neutral-400 shrink-0" />
                        <span className="truncate">Lugar: <span className="text-neutral-900 font-bold">{evt.direccion || 'No especificada'}</span></span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-neutral-600 pt-1 border-t border-neutral-100">
                        <span className="font-bold text-emerald-800">
                          🟢 Vacantes Beneficiario: <strong>{evt.vacantesBeneficiarios ?? 20}</strong>
                        </span>
                        <span className="font-semibold text-neutral-700">
                          👥 Vacantes Voluntarios: <strong>{evt.vacantesVoluntarios ?? evt.cupo ?? 0}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2">
                    {isRegistered && (
                      <div className="bg-green-50 border border-green-200 p-2.5 rounded-xl flex items-center gap-2 mb-1.5 animate-pulse">
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        <span className="text-xs text-green-800 font-bold">
                          {user?.rol === 'beneficiario' ? '¡Ya estás postulado para recibir ayuda!' : '¡Estás inscrito en este evento!'}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        className="w-full text-xs font-bold rounded-xl py-2.5" 
                        size="sm" 
                        onClick={() => setSelectedEvent(evt)}
                      >
                        <Info className="w-3.5 h-3.5 mr-1" />
                        Ver Detalles y Mapa
                      </Button>

                      {user?.rol === 'voluntario' || user?.rol === 'admin' ? (
                        isRegistered ? (
                          <Button 
                            variant="outline" 
                            className="w-full border-red-200 hover:bg-red-50/50 text-red-600 rounded-xl py-2.5" 
                            size="sm" 
                            onClick={() => handleUnsubscribe(evt.id)}
                          >
                            Cancelar Inscripción
                          </Button>
                        ) : (
                          <Button 
                            variant="primary" 
                            className="w-full rounded-xl py-2.5" 
                            size="sm" 
                            onClick={() => handleInscribe(evt.id)}
                          >
                            Inscribirme como Voluntario
                          </Button>
                        )
                      ) : user?.rol === 'beneficiario' ? (
                        isRegistered ? (
                          <Button
                            variant="outline"
                            className="w-full border-emerald-300 text-emerald-800 hover:bg-emerald-50 rounded-xl py-2.5 font-bold"
                            size="sm"
                            disabled
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                            Postulación Registrada
                          </Button>
                        ) : (
                          <Button 
                            variant="primary" 
                            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl py-2.5 font-bold" 
                            size="sm" 
                            onClick={() => handleInscribe(evt.id)}
                          >
                            <HeartHandshake className="w-3.5 h-3.5 mr-1.5" />
                            Postularme para Recibir Ayuda
                          </Button>
                        )
                      ) : (
                        <Button 
                          variant="primary" 
                          className="w-full rounded-xl py-2.5 font-bold" 
                          size="sm" 
                          onClick={() => handleInscribe(evt.id)}
                        >
                          Inscribirme / Postularme (Requiere Login)
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title=""
          size="lg"
        >
          <div className="space-y-5 text-neutral-700">
            {/* Header Hero Image Banner */}
            <div className="w-full h-48 md:h-60 rounded-2xl overflow-hidden relative shadow-sm">
              <img 
                src={selectedEvent.imagen || getCategoryBanner(selectedEvent.categoria)} 
                alt={selectedEvent.nombre} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-left">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-600 text-white mb-2 shadow-xs">
                  <Tag className="w-2.5 h-2.5 mr-1" />
                  {selectedEvent.categoria}
                </span>
                <h2 className="text-white text-base md:text-lg font-black tracking-wide leading-tight">
                  {selectedEvent.nombre}
                </h2>
              </div>
            </div>

            <div>
              <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-4 rounded-2xl border border-neutral-150 shadow-2xs font-medium">
                {selectedEvent.descripcion}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <span className="block text-[9px] font-extrabold text-neutral-400 uppercase tracking-wider">Detalles de la Organización</span>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-150 flex items-center gap-3 shadow-2xs">
                  <div className="p-2 bg-red-50 text-red-600 rounded-lg shrink-0">
                    <Building2 className="w-4 h-4 shrink-0" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-extrabold text-neutral-900">{getOrgName(selectedEvent.organizacionId)}</p>
                      {Boolean(organizations.find(o => o.id === selectedEvent.organizacionId || `org_${o.id}` === selectedEvent.organizacionId || o.id === selectedEvent.organizacionId.replace('org_', ''))?.verificada) && (
                        <VerifiedBadge size="sm" />
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-400 font-medium">Organización Responsable</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="block text-[9px] font-extrabold text-neutral-400 uppercase tracking-wider">Fecha Programada</span>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-150 flex items-center gap-3 shadow-2xs">
                  <div className="p-2 bg-neutral-100 text-neutral-800 rounded-lg shrink-0">
                    <Calendar className="w-4 h-4 shrink-0" />
                  </div>
                  <div>
                    <p className="font-extrabold text-neutral-900">{formatDate(selectedEvent.fecha)}</p>
                    <p className="text-[10px] text-neutral-400 font-medium">Día de ejecución</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-4 space-y-3">
              <span className="block text-[9px] font-extrabold text-neutral-400 uppercase tracking-wider">Ubicación de Encuentro</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 text-xs bg-neutral-50 p-4 rounded-2xl border border-neutral-150 shadow-2xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider mb-0.5">Dirección completa</span>
                    <strong className="text-neutral-900 text-sm font-black">{selectedEvent.direccion || 'No registrada'}</strong>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-neutral-200">
                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider">Barrio</span>
                      <strong className="text-neutral-800 font-bold">{selectedEvent.barrio || 'No registrado'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider">Localidad</span>
                      <strong className="text-neutral-800 font-bold">{selectedEvent.localidad || 'No registrada'}</strong>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1 pt-1 border-t border-neutral-200">
                    <div>
                      <span className="text-[10px] text-neutral-400 block font-semibold">Ciudad</span>
                      <strong className="text-neutral-700 font-medium text-[11px]">{selectedEvent.ciudad || 'Bogotá'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 block font-semibold">Dpto.</span>
                      <strong className="text-neutral-700 font-medium text-[11px]">{selectedEvent.departamento || 'Bogotá D.C.'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 block font-semibold">País</span>
                      <strong className="text-neutral-700 font-medium text-[11px]">{selectedEvent.pais || 'Colombia'}</strong>
                    </div>
                  </div>
                  {selectedEvent.nombre_lugar && (
                    <div className="pt-1 border-t border-neutral-200">
                      <span className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider">Nombre del lugar</span>
                      <strong className="text-neutral-800 font-bold">{selectedEvent.nombre_lugar}</strong>
                    </div>
                  )}
                  {selectedEvent.punto_referencia && (
                    <div className="pt-1 border-t border-neutral-200">
                      <span className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider">Punto de referencia</span>
                      <strong className="text-neutral-800 font-bold">{selectedEvent.punto_referencia}</strong>
                    </div>
                  )}
                  <div className="pt-2 border-t border-neutral-200 space-y-2">
                    <div>
                      <span className="text-[10px] text-emerald-800 font-extrabold uppercase block tracking-wider">🟢 Vacantes para Beneficiarios</span>
                      <strong className="text-emerald-950 font-black text-sm">{selectedEvent.vacantesBeneficiarios ?? 20} cupos disponibles</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 font-bold uppercase block tracking-wider">👥 Vacantes para Voluntarios</span>
                      <strong className="text-neutral-900 font-extrabold text-sm">{selectedEvent.vacantesVoluntarios ?? selectedEvent.cupo ?? 0} cupos</strong>
                    </div>
                    {selectedEvent.ayudaOfrecida && (
                      <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                        <span className="text-[10px] text-emerald-900 font-extrabold uppercase block tracking-wider">🎁 Beneficio / Ayuda Entregada</span>
                        <p className="text-xs text-emerald-900 font-medium">{selectedEvent.ayudaOfrecida}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Interactive Leaflet Map for the specific event */}
                {selectedEvent.latitud && selectedEvent.longitud ? (
                  <div className="w-full rounded-2xl overflow-hidden border border-neutral-150 shadow-2xs">
                    <EventLocationMap 
                      lat={selectedEvent.latitud} 
                      lng={selectedEvent.longitud} 
                      title={selectedEvent.nombre} 
                    />
                  </div>
                ) : (
                  <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-4 flex flex-col items-center justify-center text-center text-xs text-neutral-400 min-h-[12rem] shadow-2xs">
                    <HelpCircle className="w-8 h-8 mb-2 opacity-60" />
                    <span className="font-semibold">Este evento no posee coordenadas de geolocalización registradas.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-neutral-150">
              <Button type="button" variant="outline" size="sm" className="rounded-xl font-bold" onClick={() => setSelectedEvent(null)}>
                Cerrar Detalle
              </Button>
              {user?.rol === 'beneficiario' && (
                myEventIds.includes(selectedEvent.id) ? (
                  <Button variant="outline" className="border-emerald-300 text-emerald-800 rounded-xl font-bold" size="sm" disabled>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Postulado
                  </Button>
                ) : (
                  <Button variant="primary" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold" onClick={() => { handleInscribe(selectedEvent.id); setSelectedEvent(null); }}>
                    <HeartHandshake className="w-3.5 h-3.5 mr-1.5" /> Postularme para Recibir Ayuda
                  </Button>
                )
              )}
              {(user?.rol === 'voluntario' || user?.rol === 'admin') && (
                myEventIds.includes(selectedEvent.id) ? (
                  <Button variant="outline" className="border-red-200 hover:bg-red-50/50 text-red-600 rounded-xl font-bold" size="sm" onClick={() => { handleUnsubscribe(selectedEvent.id); setSelectedEvent(null); }}>
                    Cancelar Inscripción
                  </Button>
                ) : (
                  <Button variant="primary" size="sm" className="rounded-xl font-bold" onClick={() => { handleInscribe(selectedEvent.id); setSelectedEvent(null); }}>
                    Inscribirme al Evento
                  </Button>
                )
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
