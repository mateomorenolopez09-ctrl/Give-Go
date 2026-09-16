import React from 'react';
import { DonacionCompleta } from '../services/db';
import { Modal, Button, Badge, formatCOP, formatDate } from './UI';
import { jsPDF } from 'jspdf';
import { FileText, Download, Heart, ArrowUpRight, ShieldCheck } from 'lucide-react';

interface DonationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  donation: DonacionCompleta | null;
}

export const generateDonationPDF = (don: DonacionCompleta) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Colors based on brand styling
  const primaryColor = '#E11D48'; // rose-600 / brand color
  const darkNeutral = '#171717'; // neutral-900
  const lightBg = '#FAFAFA'; // neutral-50
  const borderColor = '#E5E5E5'; // neutral-200
  const grayText = '#737373'; // neutral-500

  // Draw Header Background
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 40, 'F');

  // Brand Name
  doc.setTextColor('#FFFFFF');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('❤️ GIVE & GO', 15, 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Solidaridad y Compromiso Social - Kennedy, Bogotá D.C.', 15, 30);

  // Document Title (Right-aligned representation)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('COMPROBANTE DE DONACIÓN', 125, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`ID Registro: ${don.id}`, 125, 26);
  doc.text(`Fecha: ${formatDate(don.fecha)}`, 125, 31);

  // Content Starting Point
  let y = 55;

  // Gratitude Greeting
  doc.setTextColor(darkNeutral);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('¡Muchas gracias por tu invaluable apoyo!', 15, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(grayText);
  doc.text('A través del presente documento, certificamos la recepción y el registro oficial', 15, y);
  y += 5;
  doc.text('de la siguiente aportación solidaria en nuestra plataforma digital:', 15, y);
  y += 10;

  // Outer Border Box
  doc.setDrawColor(borderColor);
  doc.setLineWidth(0.4);
  doc.setFillColor(lightBg);
  doc.rect(15, y, 180, 85, 'FD');

  let rowY = y + 10;

  // Helper row drawer inside the receipt block
  const drawReceiptRow = (label: string, val: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkNeutral);
    doc.setFontSize(10);
    doc.text(label, 22, rowY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkNeutral);
    doc.setFontSize(10);
    doc.text(val, 80, rowY);
    rowY += 11;
  };

  const donorName = don.usuarioNombre && don.usuarioNombre !== 'Donante Anónimo' ? don.usuarioNombre : 'Donante Anónimo';
  drawReceiptRow('Donante Registrado:', donorName);
  drawReceiptRow('Organización Destino:', don.organizacionNombre);
  drawReceiptRow('Causa de Apoyo:', don.categoria);
  drawReceiptRow('Tipo de Donación:', don.tipo === 'monetaria' ? 'Monetaria / Económica' : 'En Especie / Objeto');

  if (don.tipo === 'monetaria') {
    drawReceiptRow('Monto de la Donación:', formatCOP(don.monetaria?.valor || 0));
    drawReceiptRow('Método de Transferencia:', don.monetaria?.metodo?.toUpperCase() || 'TARJETA');
    drawReceiptRow('Cuenta / Referencia:', don.monetaria?.cuenta || 'No especificado');
  } else {
    drawReceiptRow('Categoría del Elemento:', don.objeto?.categoria || 'Insumo');
    drawReceiptRow('Cantidad Aportada:', `${don.objeto?.cantidad || 1} unidades`);
    drawReceiptRow('Detalle / Observación:', don.objeto?.descripcion || 'Sin comentarios adicionales');
  }

  y += 95;

  // Verification & Thank You text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(grayText);
  doc.text('La transparencia es nuestra prioridad. Cada recurso se registra de forma directa en el libro contable de la', 15, y);
  y += 5;
  doc.text('organización correspondiente para asegurar que llegue de forma inmediata a los beneficiarios de la comunidad.', 15, y);

  y += 20;

  // Signature Block
  doc.setDrawColor('#D4D4D4');
  doc.setLineWidth(0.25);
  doc.line(15, y, 80, y);
  doc.line(130, y, 195, y);

  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(darkNeutral);
  doc.text('Fecha de Emisión', 38, y);
  doc.text('Firma Digital Autorizada', 146, y);

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(formatDate(don.fecha), 42, y);
  doc.text('GIVE & GO VERIFIED', 148, y);

  // Save with clean file name
  doc.save(`comprobante_giveandgo_${don.id}.pdf`);
};

export const DonationDetailsModal: React.FC<DonationDetailsModalProps> = ({
  isOpen,
  onClose,
  donation,
}) => {
  if (!donation) return null;

  const donorName = donation.usuarioNombre && donation.usuarioNombre !== 'Donante Anónimo' 
    ? donation.usuarioNombre 
    : 'Donante Anónimo';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Soporte Oficial de Donación">
      <div className="space-y-6">
        
        {/* Recipient Aesthetic Header */}
        <div className="bg-neutral-900 text-white rounded-2xl p-5 border border-neutral-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">Comprobante Oficial</span>
            <h3 className="text-lg font-black font-display text-white flex items-center gap-1.5">
              <Heart className="w-5 h-5 text-brand fill-brand shrink-0" />
              Give&amp;Go Solidario
            </h3>
          </div>
          <Badge variant={donation.tipo === 'monetaria' ? 'danger' : 'info'}>
            {donation.tipo.toUpperCase()}
          </Badge>
        </div>

        {/* Voucher Fields */}
        <div className="bg-neutral-50 border border-neutral-150 rounded-2xl p-5 text-xs space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-neutral-100">
            <span className="text-neutral-500 font-semibold">Identificador:</span>
            <span className="font-mono text-neutral-800 font-bold">{donation.id}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-neutral-100">
            <span className="text-neutral-500 font-semibold">Donante:</span>
            <span className="text-neutral-950 font-bold">{donorName}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-neutral-100">
            <span className="text-neutral-500 font-semibold">Destinatario (ONG):</span>
            <span className="text-neutral-950 font-bold">{donation.organizacionNombre}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-neutral-100">
            <span className="text-neutral-500 font-semibold">Causa General:</span>
            <span className="text-neutral-800 font-medium">{donation.categoria}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-neutral-100">
            <span className="text-neutral-500 font-semibold">Fecha de Registro:</span>
            <span className="text-neutral-800 font-medium">{formatDate(donation.fecha)}</span>
          </div>

          {donation.tipo === 'monetaria' ? (
            <>
              <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                <span className="text-neutral-500 font-semibold">Monto Aportado:</span>
                <span className="text-brand text-sm font-black">{formatCOP(donation.monetaria?.valor || 0)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                <span className="text-neutral-500 font-semibold">Método de Transferencia:</span>
                <span className="text-neutral-800 font-bold uppercase">{donation.monetaria?.metodo || 'Tarjeta'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-neutral-500 font-semibold">Cuenta / Referencia:</span>
                <span className="text-neutral-800 font-mono">{donation.monetaria?.cuenta || 'Sin registrar'}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                <span className="text-neutral-500 font-semibold">Insumo / Categoría:</span>
                <span className="text-neutral-950 font-bold">{donation.objeto?.categoria}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                <span className="text-neutral-500 font-semibold">Cantidad Registrada:</span>
                <span className="text-neutral-800 font-bold">{donation.objeto?.cantidad} unidades</span>
              </div>
              <div className="flex flex-col gap-1 py-2">
                <span className="text-neutral-500 font-semibold">Descripción del Insumo:</span>
                <p className="text-neutral-700 font-medium bg-white p-2.5 rounded-lg border border-neutral-200 mt-1">
                  {donation.objeto?.descripcion || 'Sin comentarios adicionales.'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Action Button to download PDF */}
        <div className="flex justify-end gap-2.5 pt-4 border-t border-neutral-150">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar Detalle
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => generateDonationPDF(donation)}
            className="flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Descargar Comprobante (PDF)
          </Button>
        </div>
      </div>
    </Modal>
  );
};
