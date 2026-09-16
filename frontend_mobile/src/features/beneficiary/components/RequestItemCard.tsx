import React from 'react';
import { View, Text } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { SolicitudAyuda } from '../models/beneficiary.models';
import { requestCardStyles } from './RequestItemCard.styles';
import { formatDate } from '../../../shared/utils/formatters';

export const RequestItemCard: React.FC<{ request: SolicitudAyuda }> = ({ request }) => {
  const isHigh = request.urgencia === 'alta';
  const isMedium = request.urgencia === 'media';

  const badgeStyle = isHigh
    ? requestCardStyles.urgencyHigh
    : isMedium
    ? requestCardStyles.urgencyMedium
    : requestCardStyles.urgencyLow;

  const badgeTextColor = isHigh ? '#B91C1C' : isMedium ? '#D97706' : '#2563EB';

  return (
    <View style={requestCardStyles.card}>
      <View style={requestCardStyles.header}>
        <View style={[requestCardStyles.urgencyBadge, badgeStyle]}>
          <Text style={[requestCardStyles.urgencyText, { color: badgeTextColor }]}>
            Urgencia: {request.urgencia}
          </Text>
        </View>
        <Text style={requestCardStyles.statusText}>
          Estado: {request.estado ? request.estado.replace('_', ' ') : 'pendiente'}
        </Text>
      </View>

      <Text style={requestCardStyles.title}>{request.titulo}</Text>
      <Text style={requestCardStyles.description}>{request.descripcion}</Text>

      <View style={requestCardStyles.footer}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MapPin size={13} color="#64748B" strokeWidth={2} style={{ marginRight: 3 }} />
          <Text style={requestCardStyles.location}>
            {request.localidad || 'Bogotá'} {request.barrio ? `• ${request.barrio}` : ''}
          </Text>
        </View>
        <Text style={requestCardStyles.date}>{formatDate(request.fecha_solicitud)}</Text>
      </View>
    </View>
  );
};

export default RequestItemCard;

