import React from 'react';
import { DonacionCompleta } from '../services/db';
import { Badge, formatCOP, formatDate } from './UI';
import { Heart, Box, Calendar, Building2, Eye, FileText, Download } from 'lucide-react';
import { generateDonationPDF } from './DonationDetailsModal';

interface DonationCardProps {
  donation: DonacionCompleta;
  onViewDetails: (donation: DonacionCompleta) => void;
}

export const DonationCard: React.FC<DonationCardProps> = ({
  donation,
  onViewDetails,
}) => {
  const isMonetary = donation.tipo === 'monetaria';
  const donorName = donation.usuarioNombre && donation.usuarioNombre !== 'Donante Anónimo' 
    ? donation.usuarioNombre 
    : 'Donante Anónimo';

  return (
    <div 
      id={`donation-card-${donation.id}`}
      className="bg-white border border-neutral-200 rounded-2xl p-5 hover:shadow-md hover:border-neutral-300 transition-all duration-200 flex flex-col justify-between h-full group"
    >
      <div className="space-y-4">
        {/* Card Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-xl shrink-0 ${
              isMonetary 
                ? 'bg-rose-50 text-rose-600' 
                : 'bg-blue-50 text-blue-600'
            }`}>
              {isMonetary ? (
                <Heart className="w-5 h-5 fill-rose-600/10" />
              ) : (
                <Box className="w-5 h-5" />
              )}
            </div>
            <div>
              <h4 className="font-bold text-neutral-900 text-sm">
                Donación {isMonetary ? 'Monetaria' : 'de Objeto'}
              </h4>
              <p className="text-[10px] text-neutral-400 font-mono mt-0.5">{donation.id}</p>
            </div>
          </div>
          <Badge variant={isMonetary ? 'danger' : 'info'}>
            {donation.tipo}
          </Badge>
        </div>

        {/* Card Content */}
        <div className="space-y-2.5 border-t border-neutral-100 pt-3 text-xs">
          <div className="flex items-center text-neutral-600 gap-2">
            <Building2 className="w-4 h-4 text-neutral-400 shrink-0" />
            <span className="font-medium truncate">
              Destinatario: <strong className="text-neutral-800">{donation.organizacionNombre}</strong>
            </span>
          </div>

          <div className="flex items-center text-neutral-600 gap-2">
            <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
            <span className="font-medium">
              Fecha: <strong className="text-neutral-800">{formatDate(donation.fecha)}</strong>
            </span>
          </div>

          <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 flex items-center justify-between mt-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Aporte:</span>
            {isMonetary ? (
              <span className="font-black text-rose-600 text-sm">
                {formatCOP(donation.monetaria?.valor || 0)}
              </span>
            ) : (
              <span className="font-bold text-neutral-950">
                {donation.objeto?.cantidad} u. de {donation.objeto?.categoria}
              </span>
            )}
          </div>

          {donation.usuarioNombre && (
            <div className="text-[10px] text-neutral-400 font-medium pt-1 text-right truncate">
              Registrado por: {donorName}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-5 pt-3 border-t border-neutral-100 w-full">
        <button
          onClick={() => onViewDetails(donation)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 rounded-xl transition-all cursor-pointer"
        >
          <Eye className="w-4 h-4 text-neutral-500" />
          <span>Observar</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            generateDonationPDF(donation);
          }}
          className="p-2 text-neutral-500 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-xl transition-all hover:text-rose-600 cursor-pointer"
          title="Descargar Comprobante PDF"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
