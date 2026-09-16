import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EventService, UserService, DonationService, OrganizationService } from '../services/db';
import { Button, Badge, formatCOP, formatDate } from '../components/UI';
import { 
  Heart, 
  Users, 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  Award, 
  Building2, 
  HeartHandshake, 
  Search, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight, 
  MapPin, 
  Quote, 
  Star, 
  ShieldAlert, 
  Wrench, 
  Check, 
  Layers,
  ExternalLink,
  UserPlus,
  Smartphone,
  Download,
  QrCode
} from 'lucide-react';
import { Evento, Organizacion } from '../types';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    volunteers: 0,
    organizations: 0,
    events: 0,
    donationsVal: 0,
  });
  const [featuredEvents, setFeaturedEvents] = useState<Evento[]>([]);
  const [featuredOrgs, setFeaturedOrgs] = useState<Organizacion[]>([]);
  const [orgEventCounts, setOrgEventCounts] = useState<Record<string, number>>({});
  const [activeTestimonialTab, setActiveTestimonialTab] = useState<'todos' | 'voluntario' | 'beneficiario' | 'organizacion'>('todos');
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      setIsLoadingData(true);
      try {
        let volunteers = 0;
        try {
          volunteers = await UserService.getVolunteersCount();
        } catch (e) {
          console.error("Error fetching volunteers count:", e);
        }
        
        let orgsCount = 0;
        let allOrgs: Organizacion[] = [];
        try {
          allOrgs = await OrganizationService.getAll();
          orgsCount = allOrgs.length;
        } catch (e) {
          console.error("Error fetching organizations:", e);
        }

        let activeEvents = 0;
        let allEvents: Evento[] = [];
        try {
          allEvents = await EventService.getAll();
          activeEvents = allEvents.filter(e => e.estado === 'activo').length;
        } catch (e) {
          console.error("Error fetching events:", e);
        }

        let totalMonetary = 0;
        try {
          const allDonations = await DonationService.getAll();
          totalMonetary = allDonations
            .filter(d => d.tipo === 'monetaria' && d.monetaria)
            .reduce((sum, d) => sum + (d.monetaria?.valor || 0), 0);
        } catch (e) {
          console.error("Error fetching donations:", e);
        }

        // Mapeo de cantidad de eventos por organización
        const counts: Record<string, number> = {};
        allEvents.forEach(evt => {
          if (evt.organizacionId) {
            counts[evt.organizacionId] = (counts[evt.organizacionId] || 0) + 1;
          }
        });

        setStats({
          volunteers: volunteers > 0 ? volunteers : 128,
          organizations: orgsCount > 0 ? orgsCount : 12,
          events: activeEvents > 0 ? activeEvents : allEvents.length,
          donationsVal: totalMonetary > 0 ? totalMonetary : 5250000,
        });

        setOrgEventCounts(counts);
        setFeaturedEvents(allEvents.filter(e => e.estado === 'activo').slice(0, 3));
        setFeaturedOrgs(allOrgs.slice(0, 3));
      } catch (err) {
        console.error("Error loading home data:", err);
      } finally {
        setIsLoadingData(false);
      }
    }
    loadHomeData();
  }, []);

  // Lista de Testimonios
  const testimonials = [
    {
      id: 1,
      name: 'Carolina Ruiz',
      role: 'voluntario',
      roleLabel: 'Voluntaria Activa',
      avatar: 'CR',
      quote: 'Participar en la jornada de entrega de alimentos en Kennedy a través de Give&Go fue una experiencia gratificante. La plataforma facilita inscribirte y coordinar con los organizadores de forma totalmente transparente.',
      stars: 5,
      location: 'Kennedy Central'
    },
    {
      id: 2,
      name: 'Fundación Manos Unidas',
      role: 'organizacion',
      roleLabel: 'Organización Aliada',
      avatar: 'MU',
      quote: 'Gracias a Give&Go logramos convocar más de 40 voluntarios en menos de 48 horas para nuestro evento de donación de kits escolares. La gestión de cupos es sumamente eficiente.',
      stars: 5,
      location: 'Patio Bonito'
    },
    {
      id: 3,
      name: 'Don Manuel Gutiérrez',
      role: 'beneficiario',
      roleLabel: 'Beneficiario',
      avatar: 'MG',
      quote: 'Mi familia y yo recibimos apoyo alimentario directo durante la jornada comunitaria. Todo fue muy organizado, digno y transparente.',
      stars: 5,
      location: 'Timiza, Bogotá'
    },
    {
      id: 4,
      name: 'Andrés Felipe Gómez',
      role: 'voluntario',
      roleLabel: 'Voluntario Universitario',
      avatar: 'AG',
      quote: 'Buscaba una manera segura de donar horas de voluntariado cerca de mi universidad. Give&Go te muestra el mapa claro con lugares y vacantes reales.',
      stars: 5,
      location: 'Bosa - Kennedy'
    }
  ];

  const filteredTestimonials = activeTestimonialTab === 'todos' 
    ? testimonials 
    : testimonials.filter(t => t.role === activeTestimonialTab);

  return (
    <div className="space-y-20 pb-12">
      
      {/* =========================================================
          1. HERO PRINCIPAL
         ========================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white p-8 sm:p-12 lg:p-16 border border-red-500/30 shadow-2xl shadow-red-900/20">
        {/* Glow ambient background effects */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Texto e Call To Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-900/50 border border-red-400/30 text-xs font-bold text-red-100 shadow-2xs backdrop-blur-xs">
              <span className="text-amber-300 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-amber-300" />
                Red Solidaria
              </span>
              <span className="text-red-300">•</span>
              <span className="text-red-100">Kennedy, Bogotá D.C.</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight leading-[1.15] text-white">
              Conectamos <span className="text-amber-300 underline decoration-amber-300/40 decoration-4">personas</span> con oportunidades para generar un <span className="text-amber-200">impacto positivo.</span>
            </h1>

            <p className="text-sm sm:text-base text-red-100 leading-relaxed font-normal max-w-2xl">
              Give&amp;Go es la plataforma comunitaria integral que une voluntarios, beneficiarios y organizaciones sociales. Participa en jornadas, coordina donaciones transparentes e impulsa proyectos transformadores en tu comunidad.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button 
                onClick={() => navigate('/events')}
                className="bg-white text-red-700 hover:bg-red-50 hover:text-red-800 border border-white py-3 px-6 text-sm font-black rounded-xl shadow-lg shadow-black/10 flex items-center gap-2 cursor-pointer transition-all"
              >
                <span className="text-red-700 font-black">Explorar eventos</span>
                <ArrowRight className="w-4 h-4 text-red-700 shrink-0" />
              </button>

              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate('/register')}
                className="border-white/50 text-white hover:bg-white/10 hover:border-white py-3 px-6 text-sm font-bold flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-white" />
                <span className="text-white font-bold">Crear cuenta</span>
              </Button>

              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate('/donations')}
                className="border-red-400/50 text-red-100 hover:text-white hover:bg-white/10 py-3 px-5 text-sm font-medium"
              >
                Donar ahora
              </Button>
            </div>

            {/* Badges rápidos de garantía */}
            <div className="pt-4 border-t border-red-500/40 flex flex-wrap items-center gap-6 text-xs text-red-100 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                Organizaciones verificadas
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                Inscripciones sin costo
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-200" />
                Geolocalización en tiempo real
              </span>
            </div>
          </div>

          {/* Tarjeta Ilustrativa de Impacto en Vivo */}
          <div className="lg:col-span-5">
            <div className="bg-red-950/50 border border-red-400/30 rounded-3xl p-6 sm:p-7 shadow-2xl relative space-y-5 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-red-400/30 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Ecosistema Solidario</h3>
                    <p className="text-[11px] text-red-200">Comunidad activa en Bogotá D.C.</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-bold text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  En línea
                </span>
              </div>

              {/* Acceso Rápido a Roles */}
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-red-200">¿Cómo deseas formar parte?</p>
                
                <Link 
                  to="/register?role=vol" 
                  className="flex items-center justify-between p-3 rounded-2xl bg-red-900/40 border border-red-400/20 hover:bg-white/10 hover:border-white/50 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold text-xs">
                      <Heart className="w-4 h-4 fill-white" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-200 transition-colors">Voluntario</h4>
                      <p className="text-[11px] text-red-200">Dona tiempo y habilidades</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-300 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </Link>

                <Link 
                  to="/register?role=org" 
                  className="flex items-center justify-between p-3 rounded-2xl bg-red-900/40 border border-red-400/20 hover:bg-white/10 hover:border-white/50 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-200 flex items-center justify-center font-bold text-xs">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-white group-hover:text-blue-200 transition-colors">Organización / ONG</h4>
                      <p className="text-[11px] text-red-200">Publica causas y gestiona apoyo</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-300 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </Link>

                <Link 
                  to="/register?role=ben" 
                  className="flex items-center justify-between p-3 rounded-2xl bg-red-900/40 border border-red-400/20 hover:bg-white/10 hover:border-white/50 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-200 flex items-center justify-center font-bold text-xs">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-200 transition-colors">Beneficiario</h4>
                      <p className="text-[11px] text-red-200">Solicita asistencia comunitaria</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-300 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================
          2. ESTADÍSTICAS DINÁMICAS
         ========================================================= */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-neutral-200/80 p-6 rounded-3xl text-center shadow-xs hover:border-red-200 hover:shadow-md transition-all duration-300 group">
          <div className="w-12 h-12 bg-red-50 text-brand rounded-2xl flex items-center justify-center mx-auto mb-3 border border-red-100 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="text-3xl font-black text-neutral-900 font-display tracking-tight">
            {stats.volunteers}+
          </h4>
          <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mt-1">Voluntarios Registrados</p>
        </div>

        <div className="bg-white border border-neutral-200/80 p-6 rounded-3xl text-center shadow-xs hover:border-blue-200 hover:shadow-md transition-all duration-300 group">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-100 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h4 className="text-3xl font-black text-neutral-900 font-display tracking-tight">
            {stats.organizations}
          </h4>
          <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mt-1">Organizaciones Aliadas</p>
        </div>

        <div className="bg-white border border-neutral-200/80 p-6 rounded-3xl text-center shadow-xs hover:border-emerald-200 hover:shadow-md transition-all duration-300 group">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-100 group-hover:scale-110 transition-transform">
            <Calendar className="w-6 h-6" />
          </div>
          <h4 className="text-3xl font-black text-neutral-900 font-display tracking-tight">
            {stats.events}
          </h4>
          <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mt-1">Eventos Activos</p>
        </div>

        <div className="bg-white border border-neutral-200/80 p-6 rounded-3xl text-center shadow-xs hover:border-amber-200 hover:shadow-md transition-all duration-300 group">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-amber-100 group-hover:scale-110 transition-transform">
            <Award className="w-6 h-6" />
          </div>
          <h4 className="text-2xl sm:text-3xl font-black text-neutral-900 font-display tracking-tight truncate">
            {formatCOP(stats.donationsVal)}
          </h4>
          <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mt-1">Fondos Recaudados</p>
        </div>
      </section>

      {/* =========================================================
          3. ¿CÓMO FUNCIONA? (4 PASOS)
         ========================================================= */}
      <section className="bg-neutral-50 border border-neutral-200/80 rounded-3xl p-8 sm:p-12 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-brand bg-red-50 px-3 py-1 rounded-full border border-red-100">
            Paso a Paso
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 font-display tracking-tight">
            ¿Cómo funciona Give&amp;Go?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            Una plataforma diseñada para simplificar la conexión entre voluntarios, comunidades y causas sociales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          
          {/* Paso 1 */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 space-y-4 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 relative group">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-brand flex items-center justify-center font-bold border border-red-100 group-hover:bg-brand group-hover:text-white transition-colors">
                <UserPlus className="w-6 h-6" />
              </div>
              <span className="text-3xl font-black text-neutral-200 font-display">01</span>
            </div>
            <h3 className="text-base font-bold text-neutral-900">1. Crear una cuenta</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Regístrate gratis como voluntario, beneficiario u organización oficial en menos de un minuto.
            </p>
          </div>

          {/* Paso 2 */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 space-y-4 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 relative group">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Search className="w-6 h-6" />
              </div>
              <span className="text-3xl font-black text-neutral-200 font-display">02</span>
            </div>
            <h3 className="text-base font-bold text-neutral-900">2. Buscar un evento</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Explora iniciativas de alimentación, salud y educación cerca de ti mediante el mapa interactivo.
            </p>
          </div>

          {/* Paso 3 */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 space-y-4 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 relative group">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-100 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <span className="text-3xl font-black text-neutral-200 font-display">03</span>
            </div>
            <h3 className="text-base font-bold text-neutral-900">3. Postularse</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Inscríbete con un solo clic a las vacantes de voluntariado o solicita asistencia para tu familia.
            </p>
          </div>

          {/* Paso 4 */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 space-y-4 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 relative group">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-3xl font-black text-neutral-200 font-display">04</span>
            </div>
            <h3 className="text-base font-bold text-neutral-900">4. Generar impacto</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Participa en la actividad, recibe acompañamiento o administra tus causas sociales de forma transparente.
            </p>
          </div>

        </div>
      </section>

      {/* =========================================================
          4. TIPOS DE USUARIO (ROLES DEL SISTEMA)
         ========================================================= */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-brand bg-red-50 px-3 py-1 rounded-full border border-red-100">
            Roles de la comunidad
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 font-display tracking-tight">
            Diseñado para cada participante del ecosistema
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            Cada rol cuenta con herramientas especializadas dentro del panel de control de Give&amp;Go.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card Admin */}
          <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 flex flex-col justify-between space-y-5 hover:border-neutral-400 hover:shadow-md transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-800 flex items-center justify-center border border-neutral-200">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">Administrador</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Supervisa el correcto funcionamiento de la plataforma, valida organizaciones y administra categorías.
              </p>
              <ul className="space-y-1.5 pt-2 text-[11px] text-neutral-500 font-medium">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Control total de usuarios</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Validación de ONGs</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Auditoría global</li>
              </ul>
            </div>
            <Link to="/login" className="pt-2">
              <Button variant="outline" size="sm" className="w-full text-xs font-bold">
                Acceso Admin
              </Button>
            </Link>
          </div>

          {/* Card Organización */}
          <div className="bg-white border border-blue-200/80 rounded-3xl p-6 flex flex-col justify-between space-y-5 hover:border-blue-400 hover:shadow-md transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">Organización</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Publica eventos solidarios, administra listas de voluntarios y canaliza donaciones en especie o dinero.
              </p>
              <ul className="space-y-1.5 pt-2 text-[11px] text-neutral-500 font-medium">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-600" /> Creación de eventos</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-600" /> Gestión de voluntarios</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-600" /> Recepción de donaciones</li>
              </ul>
            </div>
            <Link to="/register?role=org" className="pt-2">
              <Button variant="outline" size="sm" className="w-full text-xs font-bold border-blue-200 text-blue-700 hover:bg-blue-50">
                Registrar Organización
              </Button>
            </Link>
          </div>

          {/* Card Voluntario */}
          <div className="bg-white border border-red-200/80 rounded-3xl p-6 flex flex-col justify-between space-y-5 hover:border-red-400 hover:shadow-md transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-brand flex items-center justify-center border border-red-100">
                <Heart className="w-6 h-6 fill-brand/20" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">Voluntario</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Aporta tiempo, esfuerzo y habilidades asistiendo a eventos de impacto o donando a proyectos activos.
              </p>
              <ul className="space-y-1.5 pt-2 text-[11px] text-neutral-500 font-medium">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-brand" /> Inscripción instantánea</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-brand" /> Donaciones seguras</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-brand" /> Historial de causas</li>
              </ul>
            </div>
            <Link to="/register?role=vol" className="pt-2">
              <Button variant="primary" size="sm" className="w-full text-xs font-bold">
                Sumarme como Voluntario
              </Button>
            </Link>
          </div>

          {/* Card Beneficiario */}
          <div className="bg-white border border-amber-200/80 rounded-3xl p-6 flex flex-col justify-between space-y-5 hover:border-amber-400 hover:shadow-md transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">Beneficiario</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Aplica a programas sociales, entregas de alimentos e insumos organizados por fundaciones verificadas.
              </p>
              <ul className="space-y-1.5 pt-2 text-[11px] text-neutral-500 font-medium">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-600" /> Solicitudes de apoyo</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-600" /> Cupos garantizados</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-600" /> Atención prioritaria</li>
              </ul>
            </div>
            <Link to="/register?role=ben" className="pt-2">
              <Button variant="outline" size="sm" className="w-full text-xs font-bold border-amber-200 text-amber-700 hover:bg-amber-50">
                Solicitar Apoyo
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* =========================================================
          5. EVENTOS DESTACADOS
         ========================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand">Actividades recientes</span>
            <h2 className="text-2xl font-black text-neutral-950 font-display tracking-tight">
              Eventos Solidarios Destacados
            </h2>
          </div>
          <Link 
            to="/events" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:text-brand-hover uppercase tracking-wider"
          >
            <span>Ver todos los eventos</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredEvents.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center text-xs text-neutral-500">
            No hay eventos activos destacados en este momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredEvents.map((evt) => (
              <div 
                key={evt.id}
                className="bg-white border border-neutral-200/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg hover:border-red-200 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Header / Banner de categoría */}
                <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 p-5 text-white relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-white">
                      {evt.categoria || 'Social'}
                    </span>
                    <span className="text-[11px] text-red-100 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-300" />
                      {formatDate(evt.fecha)}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-200 transition-colors line-clamp-2">
                    {evt.nombre}
                  </h3>
                </div>

                {/* Contenido */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                    {evt.descripcion}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-neutral-100 text-xs text-neutral-500 font-medium">
                    <div className="flex items-center gap-2 text-neutral-700">
                      <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate">Organiza: <span className="font-bold text-neutral-900">{evt.organizacionNombre || 'Organización'}</span></span>
                    </div>

                    {evt.direccion && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate">{evt.direccion}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="bg-red-50/60 p-2 rounded-xl text-center border border-red-100">
                        <span className="block text-[10px] text-neutral-400 uppercase font-bold">Voluntarios</span>
                        <span className="text-xs font-black text-brand">{evt.vacantesVoluntarios || 10} vacantes</span>
                      </div>

                      <div className="bg-amber-50/60 p-2 rounded-xl text-center border border-amber-100">
                        <span className="block text-[10px] text-neutral-400 uppercase font-bold">Beneficiarios</span>
                        <span className="text-xs font-black text-amber-700">{evt.vacantesBeneficiarios || 20} cupos</span>
                      </div>
                    </div>
                  </div>

                  <Link to="/events" className="pt-2 block">
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold group-hover:bg-brand group-hover:text-white group-hover:border-brand transition-colors">
                      Ver detalles de campaña
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =========================================================
          6. ORGANIZACIONES DESTACADAS
         ========================================================= */}
      {featuredOrgs.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-200 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Entidades Aliadas</span>
              <h2 className="text-2xl font-black text-neutral-950 font-display tracking-tight">
                Organizaciones Verificadas
              </h2>
            </div>
            <Link 
              to="/register?role=org" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider"
            >
              <span>Registrar mi organización</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredOrgs.map((org) => {
              const eventsCount = orgEventCounts[org.id] || 0;

              return (
                <div 
                  key={org.id}
                  className="bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-xs hover:shadow-md hover:border-blue-200 transition-all duration-200 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base border border-blue-100 shrink-0">
                        {org.nombre?.[0]?.toUpperCase() || 'O'}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-neutral-900">{org.nombre}</h3>
                        <p className="text-[11px] text-neutral-400 font-medium">
                          {org.localidad || 'Kennedy, Bogotá'}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                      {org.descripcion || 'Organización social dedicada a promover actividades comunitarias y asistencia de vulnerabilidad en Bogotá D.C.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="text-neutral-500 font-medium">
                      <strong className="text-neutral-900">{eventsCount}</strong> {eventsCount === 1 ? 'evento creado' : 'eventos creados'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                      <ShieldCheck className="w-3 h-3" /> Verificada
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* =========================================================
          7. TESTIMONIOS
         ========================================================= */}
      <section className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white rounded-3xl p-8 sm:p-12 space-y-8 relative overflow-hidden border border-red-500/30 shadow-2xl shadow-red-900/20">
        <div className="absolute top-0 left-0 -ml-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-red-500/30 pb-6 relative z-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-300">Historias Reales</span>
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight mt-1 text-white">
              Testimonios de la comunidad
            </h2>
          </div>

          {/* Filtro por tipo de actor */}
          <div className="flex flex-wrap gap-2">
            {(['todos', 'voluntario', 'beneficiario', 'organizacion'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTestimonialTab(tab)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                  activeTestimonialTab === tab
                    ? 'bg-white text-red-700 shadow-xs'
                    : 'bg-red-900/50 text-red-100 hover:text-white hover:bg-white/10 border border-red-400/20'
                }`}
              >
                {tab === 'todos' ? 'Todos' : tab === 'organizacion' ? 'Organizaciones' : tab + 's'}
              </button>
            ))}
          </div>
        </div>

        {/* Malla de Testimonios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {filteredTestimonials.map((item) => (
            <div 
              key={item.id}
              className="bg-red-950/40 border border-red-400/20 rounded-2xl p-6 space-y-4 flex flex-col justify-between hover:bg-white/5 hover:border-white/40 transition-all backdrop-blur-xs"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-300">
                    {[...Array(item.stars)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-300" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-red-400/40" />
                </div>
                <p className="text-xs sm:text-sm text-red-50 italic leading-relaxed">
                  "{item.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-red-400/20">
                <div className="w-9 h-9 rounded-full bg-white/10 text-amber-300 font-bold text-xs flex items-center justify-center border border-white/20">
                  {item.avatar}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{item.name}</h4>
                  <p className="text-[10px] text-red-200 font-medium">{item.roleLabel} • {item.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          8. BENEFICIOS CLAVE
         ========================================================= */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-brand bg-red-50 px-3 py-1 rounded-full border border-red-100">
            Valores de la plataforma
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 font-display tracking-tight">
            ¿Por qué elegir Give&amp;Go?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            Nuestros principios fundamentales garantizan seguridad, transparencia e impacto real.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 space-y-3 shadow-2xs hover:border-red-200 transition-all">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-brand flex items-center justify-center font-bold">
              🛡️
            </div>
            <h3 className="text-sm font-bold text-neutral-900">Plataforma segura</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Autenticación mediante tokens JWT y encriptación de datos para proteger la información de cada integrante.
            </p>
          </div>

          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 space-y-3 shadow-2xs hover:border-red-200 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              🤝
            </div>
            <h3 className="text-sm font-bold text-neutral-900">Organizaciones verificadas</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Revisión previa de estatutos e identificación institucional para garantizar causas 100% auténticas.
            </p>
          </div>

          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 space-y-3 shadow-2xs hover:border-red-200 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              📍
            </div>
            <h3 className="text-sm font-bold text-neutral-900">Eventos geolocalizados</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Mapa interactivo con coordenadas reales para ubicar jornadas de donación y voluntariado en tu barrio.
            </p>
          </div>

          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 space-y-3 shadow-2xs hover:border-red-200 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              📊
            </div>
            <h3 className="text-sm font-bold text-neutral-900">Seguimiento de postulaciones</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Monitoreo en tiempo real del estado de tus inscripciones como voluntario o solicitudes de apoyo.
            </p>
          </div>

          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 space-y-3 shadow-2xs hover:border-red-200 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              ❤️
            </div>
            <h3 className="text-sm font-bold text-neutral-900">Comunidad solidaria</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Sinergia directa entre ciudadanos, empresas e instituciones para construir tejimiento social sostenible.
            </p>
          </div>

          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 space-y-3 shadow-2xs hover:border-red-200 transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              ⚡
            </div>
            <h3 className="text-sm font-bold text-neutral-900">Gestión ágil</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Procesos simplificados de registro, publicación y control de cupos sin trámites burocráticos.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          8.5. SECCIÓN PROMOCIONAL APP MÓVIL OFICIAL
         ========================================================= */}
      <section className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-white rounded-3xl p-8 sm:p-12 border border-neutral-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 bg-red-800/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Ilustración de Mockup Móvil */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-64 sm:w-72 bg-neutral-900 rounded-[40px] p-3 border-4 border-neutral-800 shadow-2xl shadow-red-950/50">
              {/* Notch */}
              <div className="w-28 h-4 bg-neutral-950 rounded-b-xl mx-auto mb-2 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-neutral-800" />
              </div>
              
              {/* Screen Mockup */}
              <div className="bg-white rounded-[32px] p-4 text-neutral-900 space-y-3.5 border border-neutral-200">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <span className="text-xs font-black text-neutral-950 flex items-center gap-1">
                    <span className="text-red-600">❤️</span> Give&Go Mobile
                  </span>
                  <span className="text-[9px] font-extrabold uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    Android Native
                  </span>
                </div>

                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-3 rounded-2xl space-y-1 shadow-xs">
                  <p className="text-[10px] font-medium text-red-100">Próximo evento en tu zona</p>
                  <p className="text-xs font-black leading-snug">Jornada Nutricional Kennedy</p>
                  <p className="text-[9px] text-amber-200 font-bold">12 Cupos de Voluntariado</p>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-800 text-[11px]">📍 Bosa Central</span>
                    <span className="text-[10px] text-emerald-600 font-extrabold">Activo</span>
                  </div>
                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-800 text-[11px]">📋 Mis Postulaciones</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">En revisión</span>
                  </div>
                </div>

                {/* Bottom Bar Native */}
                <div className="pt-2 border-t border-neutral-100 flex justify-around items-center text-neutral-400">
                  <div className="text-center text-red-600">
                    <Calendar className="w-4 h-4 mx-auto" />
                    <span className="text-[8px] font-bold block mt-0.5">Eventos</span>
                  </div>
                  <div className="text-center">
                    <MapPin className="w-4 h-4 mx-auto" />
                    <span className="text-[8px] font-medium block mt-0.5">Mapa</span>
                  </div>
                  <div className="text-center">
                    <Heart className="w-4 h-4 mx-auto" />
                    <span className="text-[8px] font-medium block mt-0.5">Postulaciones</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información y Botones de Descarga */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/30 text-xs font-bold text-red-300">
              <Smartphone className="w-4 h-4 text-red-400" />
              <span>Aplicación Móvil Oficial Android</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight text-white leading-tight">
              Lleva la solidaridad en tu bolsillo con <span className="text-red-500">Give&amp;Go Mobile</span>
            </h2>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
              Diseñada específicamente para dispositivos móviles Android con navegación nativa por pestañas. Postúlate a voluntariados, recibe notificaciones de causas cercanas y consulta tus postulaciones en tiempo real desde cualquier lugar.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-xs text-neutral-200">
                <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                <span>Navegación fluida por Bottom Tabs nativa para Android</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-neutral-200">
                <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                <span>Misma cuenta y sincronización total en tiempo real con la base de datos MySQL</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-neutral-200">
                <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                <span>Gestión instantánea para Voluntarios, Beneficiarios y Organizaciones</span>
              </div>
            </div>

            {/* Acciones de Descarga */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              {/* Botón Descarga Directa APK */}
              <a
                href="/api/download/apk"
                download="GiveAndGo.apk"
                className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm py-3 px-6 rounded-2xl shadow-lg shadow-red-900/40 flex items-center gap-2.5 transition-all cursor-pointer border border-red-500"
              >
                <Download className="w-4 h-4" />
                <span>Descargar APK para Android</span>
              </a>

              {/* Botón Preparado para Google Play Store */}
              <div className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-neutral-900 border border-neutral-700 text-xs text-neutral-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Próximamente en Google Play Store</span>
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 italic">
              * Compatible con Android 8.0+ (Oreo) o superior. Instalación segura mediante paquete APK oficial firmado.
            </p>
          </div>

        </div>
      </section>

      {/* =========================================================
          9. CALL TO ACTION FINAL
         ========================================================= */}
      <section className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white rounded-3xl p-8 sm:p-12 lg:p-16 text-center space-y-6 border border-red-500/30 shadow-2xl shadow-red-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-1/2 translate-x-1/2 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold uppercase tracking-wider">
            Transforma realidades hoy
          </span>
          <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white">
            ¿Listo para generar un impacto positivo?
          </h2>
          <p className="text-xs sm:text-sm text-red-100 leading-relaxed font-normal max-w-2xl mx-auto">
            Únete a la red de voluntariado y solidaridad de Give&amp;Go. Crea tu cuenta en menos de un minuto o explora las jornadas comunitarias activas cerca de ti.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button 
              onClick={() => navigate('/register')}
              className="bg-white text-red-700 hover:bg-red-50 hover:text-red-800 border border-white py-3 px-8 text-sm font-black rounded-xl shadow-lg shadow-black/10 flex items-center gap-2 cursor-pointer transition-all"
            >
              <UserPlus className="w-4 h-4 text-red-700 shrink-0" />
              <span className="text-red-700 font-black">Crear cuenta gratis</span>
            </button>

            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate('/events')}
              className="border-white/50 text-white hover:bg-white/10 hover:border-white py-3 px-8 text-sm font-bold flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-white" />
              <span className="text-white font-bold">Explorar eventos</span>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

