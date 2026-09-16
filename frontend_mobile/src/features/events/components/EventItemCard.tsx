import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { Evento } from '../models/event.models';
import { eventCardStyles } from './EventItemCard.styles';
import { formatDate } from '../../../shared/utils/formatters';

interface EventItemCardProps {
  event: Evento;
  onPress: () => void;
}

export const EventItemCard: React.FC<EventItemCardProps> = ({ event, onPress }) => {
  const slotsText = event.cupos_disponibles !== undefined
    ? `${event.cupos_disponibles} cupos libres`
    : `${event.cupo_maximo || 30} cupos`;

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={eventCardStyles.card}>
      <View style={eventCardStyles.header}>
        <View style={eventCardStyles.categoryBadge}>
          <Text style={eventCardStyles.categoryText}>{event.nombre_categoria || event.categoria || 'Comunitario'}</Text>
        </View>
        <Text style={eventCardStyles.dateBadge}>{formatDate(event.fecha_inicio || event.fecha)}</Text>
      </View>

      <View style={eventCardStyles.content}>
        <Text style={eventCardStyles.title} numberOfLines={2}>{event.titulo || event.nombre}</Text>
        <Text style={eventCardStyles.description} numberOfLines={2}>{event.descripcion}</Text>
      </View>

      <View style={eventCardStyles.footer}>
        <View style={[eventCardStyles.locationRow, { flexDirection: 'row', alignItems: 'center' }]}>
          <MapPin size={14} color="#64748B" strokeWidth={2} style={{ marginRight: 4 }} />
          <Text style={eventCardStyles.locationText} numberOfLines={1}>
            {event.localidad || 'Bogotá'} {event.barrio ? `• ${event.barrio}` : ''}
          </Text>
        </View>
        <View style={eventCardStyles.slotsBadge}>
          <Text style={eventCardStyles.slotsText}>{slotsText}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default EventItemCard;

