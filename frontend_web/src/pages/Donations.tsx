import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { DonationService, OrganizationService, CategoryService, DonacionCompleta } from '../services/db';
import { Organizacion, Categoria } from '../types';
import { Button, Input, Select, Card, Alert, ConfirmDialog, Textarea, EmptyState } from '../components/UI';
import { Heart, CreditCard, Box, Download, ArrowRight, ShieldCheck, CheckCircle2, History, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { generateDonationPDF, DonationDetailsModal } from '../components/DonationDetailsModal';
import { OrgDonationCard } from '../components/OrgDonationCard';

interface DonationFormData {
  organizacionId: string;
  categoria: string;
  tipo: 'monetaria' | 'objeto';
  // Monetario
  metodo?: string;
  cuenta?: string;
  valor?: number;
  // Objeto
  objetoCategoria?: string;
  objetoDescripcion?: string;
  objetoCantidad?: number;
}

export const Donations: React.FC = () => {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organizacion[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [donations, setDonations] = useState<DonacionCompleta[]>([]);
  
  // Modal & success state
  const [selectedDonation, setSelectedDonation] = useState<DonacionCompleta | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [latestDonation, setLatestDonation] = useState<DonacionCompleta | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [tempFormData, setTempFormData] = useState<DonationFormData | null>(null);

  // Selected organization state & Category Filter state
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('todos');

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<DonationFormData>({
    defaultValues: {
      tipo: 'monetaria',
      metodo: 'tarjeta',
    }
  });

  const selectedTipo = watch('tipo');
  const watchedOrgId = watch('organizacionId');

  // Sync selected card state when the dropdown in the form is changed manually
  useEffect(() => {
    if (watchedOrgId) {
      setSelectedOrgId(watchedOrgId);
    } else {
      setSelectedOrgId('');
    }
  }, [watchedOrgId]);

  const loadResourcesAndDonations = async () => {
    try {
      const orgs = await OrganizationService.getAll();
      setOrganizations(orgs);

      const cats = await CategoryService.getAll();
      setCategories(cats.filter(c => c.estado === 'activo'));

      const dons = await DonationService.getAll();
      setDonations(dons);
    } catch (err) {
      console.error('Error cargando recursos en página de donaciones:', err);
    }
  };

  useEffect(() => {
    loadResourcesAndDonations();
  }, []);

  // Pre-select organization destination if user is logged in as an organization
  useEffect(() => {
    if (user?.rol === 'organizacion' && organizations.length > 0) {
      const matchedOrg = organizations.find(o => o.id === user.id);
      if (matchedOrg) {
        setValue('organizacionId', matchedOrg.id);
      }
    }
  }, [user, organizations, setValue]);

  // Beneficiaries are restricted from donating
  if (user?.rol === 'beneficiario') {
    return (
      <div className="max-w-xl mx-auto text-center space-y-6 py-12 px-4 select-none">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-100">
          <Heart className="w-8 h-8 text-brand" />
        </div>
        <div className="space-y-3">
          <h1 className="text-2xl font-black text-neutral-900 uppercase tracking-wide">Acción No Permitida</h1>
          <p className="text-xs text-neutral-500 leading-relaxed max-w-sm mx-auto font-medium">
            Hola, <strong className="text-neutral-800">{user.nombre1}</strong>. Como usuario registrado con el rol de <strong className="text-neutral-900">Beneficiario</strong>, no tienes permitido realizar donaciones. Tu cuenta está destinada para solicitar y recibir ayuda humanitaria.
          </p>
        </div>
        <div className="pt-4">
          <Link id="btn-back-dashboard" to="/beneficiary/dashboard">
            <Button variant="primary" size="md">
              Ir a mi Panel de Solicitudes
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handlePreSubmit = (data: DonationFormData) => {
    const selectedOrg = organizations.find(o => o.id === data.organizacionId);
    const resolvedCategory = selectedOrg?.categoria || 'General';
    setTempFormData({
      ...data,
      categoria: resolvedCategory
    });
    setIsConfirmOpen(true);
  };

  const handleConfirmDonation = async () => {
    if (!tempFormData) return;
    setIsLoading(true);
    setIsSuccess(false);

    try {
      const donorId = user ? user.id : 'anonimo';
      let resultDonation: DonacionCompleta;

      if (tempFormData.tipo === 'monetaria') {
        resultDonation = await DonationService.createMonetary(
          {
            categoria: tempFormData.categoria,
            usuarioId: donorId,
            organizacionId: tempFormData.organizacionId,
          },
          {
            metodo: tempFormData.metodo || 'tarjeta',
            cuenta: tempFormData.cuenta || 'Anonimo',
            valor: Number(tempFormData.valor || 0),
          }
        );
      } else {
        resultDonation = await DonationService.createObject(
          {
            categoria: tempFormData.categoria,
            usuarioId: donorId,
            organizacionId: tempFormData.organizacionId,
          },
          {
            categoria: tempFormData.objetoCategoria || tempFormData.categoria,
            descripcion: tempFormData.objetoDescripcion || '',
            shadow_category: tempFormData.objetoCategoria || tempFormData.categoria,
            amount_shadow: Number(tempFormData.objetoCantidad || 1),
            cantidad: Number(tempFormData.objetoCantidad || 1),
          } as any
        );
      }

      setLatestDonation(resultDonation);
      setIsSuccess(true);
      reset();
      
      // Refresh the local public donations list
      const updatedDons = await DonationService.getAll();
      setDonations(updatedDons);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsConfirmOpen(false);
      setTempFormData(null);
    }
  };

  const handleSelectOrg = (org: Organizacion) => {
    setSelectedOrgId(org.id);
    setValue('organizacionId', org.id);
    
    // Auto-select category if matches organization principal category
    if (org.categoria) {
      const matchedCat = categories.find(c => c.nombre.toLowerCase() === org.categoria?.toLowerCase());
      if (matchedCat) {
        setValue('categoria', matchedCat.nombre);
      }
    }

    // Scroll smoothly to form
    const formElement = document.getElementById('donation-form-card');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const filteredOrganizations = organizations.filter(org => {
    if (selectedCategoryFilter === 'todos') return true;
    return org.categoria?.toLowerCase() === selectedCategoryFilter.toLowerCase();
  });

  // Modern success landing section with a verification badge and receipt download
  if (isSuccess && latestDonation) {
    const isMonetary = latestDonation.tipo === 'monetaria';
    return (
      <div id="success-donation-screen" className="max-w-xl mx-auto space-y-8 py-8 px-4 select-none animate-fadeIn">
        <div className="bg-white border border-neutral-200 rounded-3xl p-8 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-100">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-neutral-900 uppercase tracking-wider">¡Aporte Confirmado!</h1>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
              Muchas gracias por tu generosa contribución. Tu soporte ya está registrado de forma segura y fue notificado a la organización destinataria.
            </p>
          </div>

          {/* Quick Invoice Summary Inside Success Card */}
          <div className="bg-neutral-50 border border-neutral-150 rounded-2xl p-5 text-left text-xs space-y-3">
            <div className="flex justify-between border-b border-neutral-200/60 pb-2">
              <span className="text-neutral-500 font-semibold">Identificador de Registro:</span>
              <span className="font-mono text-neutral-800 font-bold">{latestDonation.id}</span>
            </div>
            <div className="flex justify-between border-b border-neutral-200/60 pb-2">
              <span className="text-neutral-500 font-semibold">Destinatario (ONG):</span>
              <span className="text-neutral-900 font-bold">{latestDonation.organizacionNombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 font-semibold">Aporte:</span>
              {isMonetary ? (
                <span className="text-rose-600 font-extrabold">
                  {latestDonation.monetaria?.valor ? `$ ${latestDonation.monetaria.valor.toLocaleString('es-CO')}` : 'Monto'} COP
                </span>
              ) : (
                <span className="text-neutral-900 font-bold">
                  {latestDonation.objeto?.cantidad} unidades de {latestDonation.objeto?.categoria}
                </span>
              )}
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <Button 
              variant="primary" 
              onClick={() => generateDonationPDF(latestDonation)}
              className="w-full flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Descargar Comprobante en PDF
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setIsSuccess(false);
                setLatestDonation(null);
              }}
              className="w-full"
            >
              Realizar otra Donación
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto select-none px-4 md:px-0">
      <div>
        <h1 className="text-3xl font-black text-neutral-900 uppercase tracking-wider">Centro de Donaciones</h1>
        <p className="text-xs text-neutral-500 mt-1">
          Apoya de forma segura a nuestras organizaciones. Tu aportación directa es vital para mantener activos los proyectos sociales.
        </p>
      </div>

      {/* Main Grid: Form on left/top, beautiful list on right/bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5/12 width) - Registration Form */}
        <div id="donation-form-card" className="lg:col-span-5 space-y-6">
          <Card
            title="Formulario de Aportación Solidaria"
            subtitle={
              user 
                ? `Registrado como donante (${user.rol}): ${user.nombre1} ${user.apellido1}` 
                : 'Hacer una donación anónima (sin iniciar sesión)'
            }
          >
            {selectedOrgId && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs flex justify-between items-center animate-fadeIn">
                <span className="font-semibold text-rose-800">
                  Destinatario seleccionado: <strong className="text-rose-950">{organizations.find(o => o.id === selectedOrgId)?.nombre}</strong>
                </span>
                <button 
                  type="button" 
                  onClick={() => setValue('organizacionId', '')}
                  className="text-rose-500 hover:text-rose-700 font-bold text-xs cursor-pointer px-1.5"
                >
                  Cambiar
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit(handlePreSubmit)} className="space-y-5">
              <div className="space-y-4">
                {/* Destino */}
                <Select
                  label="Organización Destino"
                  error={errors.organizacionId?.message}
                  options={[
                    { value: '', label: 'Seleccionar Organización' },
                    ...organizations.map(o => ({ value: o.id, label: o.nombre }))
                  ]}
                  {...register('organizacionId', { required: 'Debe seleccionar una organización de destino' })}
                />
              </div>

              {/* Tipo de donación */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <span className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2.5">Tipo de Donación</span>
                <div className="flex gap-6">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="monetaria"
                      className="w-4 h-4 text-rose-600 border-neutral-300 focus:ring-rose-500"
                      {...register('tipo')}
                    />
                    <span className="ml-2 text-xs text-neutral-800 font-bold flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-neutral-500" />
                      Monetaria
                    </span>
                  </label>

                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="objeto"
                      className="w-4 h-4 text-rose-600 border-neutral-300 focus:ring-rose-500"
                      {...register('tipo')}
                    />
                    <span className="ml-2 text-xs text-neutral-800 font-bold flex items-center gap-1">
                      <Box className="w-3.5 h-3.5 text-neutral-500" />
                      Objetos
                    </span>
                  </label>
                </div>
              </div>

              {/* Secciones Dinámicas */}
              {selectedTipo === 'monetaria' ? (
                <div className="border border-neutral-200 p-4 rounded-2xl bg-white space-y-4">
                  <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wide border-b border-neutral-100 pb-1.5">Detalle Económico</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <Select
                      label="Método de Pago"
                      options={[
                        { value: 'nequi', label: 'Nequi' },
                        { value: 'daviplata', label: 'Daviplata' },
                        { value: 'pse', label: 'PSE / Transferencia Bancaria' },
                        { value: 'tarjeta', label: 'Tarjeta de Crédito / Débito' }
                      ]}
                      {...register('metodo')}
                    />

                    <Input
                      type="number"
                      label="Valor (COP $)"
                      placeholder="Ej: 150000"
                      error={errors.valor?.message}
                      {...register('valor', { 
                        required: selectedTipo === 'monetaria' ? 'El valor es requerido' : false,
                        min: { value: 10000, message: 'La donación mínima es de $ 10.000' }
                      })}
                    />
                  </div>

                  <Input
                    label="Referencia / Identificador de Cuenta"
                    placeholder="Celular o número de cuenta de depósito"
                    error={errors.cuenta?.message}
                    {...register('cuenta', { 
                      required: selectedTipo === 'monetaria' ? 'La referencia identificativa es requerida' : false,
                      minLength: { value: 4, message: 'Formato demasiado corto' }
                    })}
                  />
                </div>
              ) : (
                <div className="border border-neutral-200 p-4 rounded-2xl bg-white space-y-4">
                  <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wide border-b border-neutral-100 pb-1.5">Detalle de Objetos / Materiales</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <Select
                      label="Categoría del Objeto"
                      options={[
                        { value: 'Alimentos no perecederos', label: 'Alimentos no perecederos' },
                        { value: 'Material Escolar', label: 'Material Escolar' },
                        { value: 'Ropa y Calzado', label: 'Ropa y Calzado' },
                        { value: 'Medicamentos e Higiene', label: 'Medicamentos e Higiene' },
                        { value: 'Juguetes', label: 'Juguetes' },
                      ]}
                      {...register('objetoCategoria')}
                    />

                    <Input
                      type="number"
                      label="Cantidad Registrada"
                      placeholder="Ej: 10"
                      error={errors.objetoCantidad?.message}
                      {...register('objetoCantidad', {
                        required: selectedTipo === 'objeto' ? 'Especifique la cantidad' : false,
                        min: { value: 1, message: 'La cantidad mínima es de 1 unidad' }
                      })}
                    />
                  </div>

                  <Textarea
                    label="Descripción de los insumos"
                    placeholder="Marca, estado o especificaciones particulares..."
                    error={errors.objetoDescripcion?.message}
                    {...register('objetoDescripcion', { 
                      required: selectedTipo === 'objeto' ? 'Escriba una descripción de los materiales' : false,
                      minLength: { value: 5, message: 'Proporcione más detalles' }
                    })}
                  />
                </div>
              )}

              <Button variant="primary" type="submit" isLoading={isLoading} className="w-full">
                Confirmar y Registrar Donación
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column (7/12 width) - Beautiful active organization causes */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex justify-between items-center bg-white p-4 border border-neutral-200 rounded-2xl">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500/10 animate-pulse" />
              <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wider">Causas y Organizaciones Activas</h2>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-neutral-400" />
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="text-xs font-bold text-neutral-700 bg-neutral-100 px-2.5 py-1.5 rounded-lg border-0 focus:ring-2 focus:ring-rose-500 cursor-pointer text-ellipsis max-w-[150px]"
              >
                <option value="todos">Todas las Causas</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.nombre}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredOrganizations.length === 0 ? (
            <EmptyState
              title="Sin causas disponibles"
              description="No encontramos organizaciones activas en esta categoría en este momento."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredOrganizations.map((org) => (
                <OrgDonationCard
                  key={org.id}
                  organization={org}
                  onSelect={handleSelectOrg}
                  isSelected={selectedOrgId === org.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDonation}
        title="Confirmar Donación Solidaria"
        message={`¿Está seguro de registrar esta donación? Al confirmar, los fondos o los materiales descritos se registrarán a nombre de la organización beneficiaria.`}
        confirmText="Confirmar Donación"
        cancelText="Revisar Datos"
        type="primary"
      />

      <DonationDetailsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDonation(null);
        }}
        donation={selectedDonation}
      />
    </div>
  );
};
