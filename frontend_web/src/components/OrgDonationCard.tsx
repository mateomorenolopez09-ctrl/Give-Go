import React from 'react';
import { Organizacion } from '../types';
import { Badge } from './UI';
import { 
  Heart, 
  Box, 
  BookOpen, 
  Activity, 
  Leaf, 
  Coins, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface OrgDonationCardProps {
  organization: Organizacion;
  onSelect: (org: Organizacion) => void;
  isSelected: boolean;
}

export const OrgDonationCard: React.FC<OrgDonationCardProps> = ({
  organization,
  onSelect,
  isSelected,
}) => {
  // Map categories to appropriate icons and colors
  const getCategoryDetails = (cat?: string) => {
    const category = cat?.toLowerCase() || '';
    if (category.includes('aliment')) {
      return {
        icon: <Box className="w-5 h-5 text-amber-600" />,
        bgColor: 'bg-amber-50 border-amber-100',
        text: 'Alimentos e Insumos'
      };
    }
    if (category.includes('educa')) {
      return {
        icon: <BookOpen className="w-5 h-5 text-blue-600" />,
        bgColor: 'bg-blue-50 border-blue-100',
        text: 'Educación y Desarrollo'
      };
    }
    if (category.includes('salud')) {
      return {
        icon: <Activity className="w-5 h-5 text-emerald-600" />,
        bgColor: 'bg-emerald-50 border-emerald-100',
        text: 'Salud y Asistencia'
      };
    }
    if (category.includes('ambiente') || category.includes('medio')) {
      return {
        icon: <Leaf className="w-5 h-5 text-green-600" />,
        bgColor: 'bg-green-50 border-green-100',
        text: 'Medio Ambiente'
      };
    }
    return {
      icon: <Coins className="w-5 h-5 text-rose-600" />,
      bgColor: 'bg-rose-50 border-rose-100',
      text: 'Apoyo Económico / General'
    };
  };

  const catDetails = getCategoryDetails(organization.categoria);

  return (
    <div 
      id={`org-donation-card-${organization.id}`}
      className={`bg-white border rounded-2xl p-5 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full group ${
        isSelected 
          ? 'ring-2 ring-rose-500 border-rose-200 bg-rose-50/10' 
          : 'border-neutral-200 hover:border-neutral-300'
      }`}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border shrink-0 ${catDetails.bgColor}`}>
              {catDetails.icon}
            </div>
            <div>
              <h3 className="font-extrabold text-neutral-900 text-sm group-hover:text-rose-600 transition-colors line-clamp-1">
                {organization.nombre}
              </h3>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">
                Causa Principal
              </p>
            </div>
          </div>
          <Badge variant={isSelected ? 'danger' : 'outline'}>
            {isSelected ? 'Seleccionado' : organization.categoria || 'General'}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-xs text-neutral-600 leading-relaxed font-medium line-clamp-3 min-h-[4rem]">
          {organization.descripcion || 'Esta organización trabaja activamente en el desarrollo de programas de bienestar social para las comunidades locales.'}
        </p>

        {/* Details & Location */}
        <div className="space-y-2 border-t border-neutral-100 pt-3.5 text-xs text-neutral-500 font-medium">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">
              {organization.direccion || 'Kennedy, Bogotá D.C.'}
              {organization.barrio && <span className="text-neutral-400 text-[11px] block">Barrio: {organization.barrio}</span>}
            </span>
          </div>

          {organization.telefono && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
              <span>{organization.telefono}</span>
            </div>
          )}

          {organization.correo && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
              <span className="truncate">{organization.correo}</span>
            </div>
          )}
        </div>
      </div>

      {/* Select button */}
      <div className="mt-5 pt-3.5 border-t border-neutral-100">
        <button
          type="button"
          onClick={() => onSelect(organization)}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
            isSelected
              ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm'
              : 'bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-800'
          }`}
        >
          {isSelected ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Seleccionado para Donar</span>
            </>
          ) : (
            <>
              <span>Aportar a esta Organización</span>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
