import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { eventDetailStyles } from '../styles/eventDetail.styles';
import { AppButton } from '../../../shared/components/buttons/AppButton';
import { AppLoader } from '../../../shared/components/loaders/AppLoader';
import { formatDate } from '../../../shared/utils/formatters';
import { useEventDetailController } from '../controllers/useEventDetailController';

interface EventDetailViewProps {
  route: any;
  navigation: any;
}

export const EventDetailView: React.FC<EventDetailViewProps> = ({ route, navigation }) => {
  const { eventId } = route.params;
  const {
    user,
    event,
    isLoading,
    isSubmitting,
    successMessage,
    errorMessage,
    handleRegister,
    goBack,
  } = useEventDetailController(navigation, eventId);

  if (isLoading || !event) {
    return <AppLoader fullScreen message="Cargando detalles de la jornada..." />;
  }

  const isBeneficiary = user?.rol === 'Beneficiario' || (user?.rol as string) === 'beneficiario';

  return (
    <SafeAreaView style={eventDetailStyles.container}>
      <ScrollView contentContainerStyle={eventDetailStyles.scrollContent}>
        <View style={eventDetailStyles.header}>
          <TouchableOpacity onPress={goBack} style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center' }}>
            <ArrowLeft size={18} color="#DC2626" strokeWidth={2.5} style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 14, color: '#DC2626', fontWeight: '700' }}>Volver</Text>
          </TouchableOpacity>

          <View style={eventDetailStyles.categoryBadge}>
            <Text style={eventDetailStyles.categoryText}>{event.nombre_categoria || event.categoria || 'Comunitario'}</Text>
          </View>

          <Text style={eventDetailStyles.title}>{event.titulo || event.nombre}</Text>

          {(event.nombre_organizacion || event.organizacionNombre) ? (
            <View style={[eventDetailStyles.organizationRow, { flexDirection: 'row', alignItems: 'center' }]}>
              <Text style={eventDetailStyles.organizationName}>
                Organizado por: {event.nombre_organizacion || event.organizacionNombre}
              </Text>
              {event.organizacion_verificada && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 6 }}>
                  <CheckCircle2 size={13} color="#16A34A" strokeWidth={2.5} style={{ marginRight: 2 }} />
                  <Text style={eventDetailStyles.verifiedBadge}>Verificada</Text>
                </View>
              )}
            </View>
          ) : null}
        </View>

        {successMessage ? (
          <View style={[eventDetailStyles.card, { backgroundColor: '#D1FAE5', borderColor: '#10B981' }]}>
            <Text style={{ color: '#065F46', fontWeight: '700', textAlign: 'center' }}>
              {successMessage}
            </Text>
          </View>
        ) : null}

        {errorMessage ? (
          <View style={[eventDetailStyles.card, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}>
            <Text style={{ color: '#991B1B', fontWeight: '700', textAlign: 'center' }}>
              {errorMessage}
            </Text>
          </View>
        ) : null}

        <View style={eventDetailStyles.card}>
          <Text style={eventDetailStyles.sectionTitle}>Descripción de la Jornada</Text>
          <Text style={eventDetailStyles.descriptionText}>{event.descripcion}</Text>
        </View>

        <View style={eventDetailStyles.card}>
          <Text style={eventDetailStyles.sectionTitle}>Detalles Logísticos</Text>
          <View style={eventDetailStyles.infoGrid}>
            <View style={eventDetailStyles.infoItem}>
              <Text style={eventDetailStyles.infoLabel}>Fecha</Text>
              <Text style={eventDetailStyles.infoValue}>{formatDate(event.fecha_inicio || event.fecha)}</Text>
            </View>
            <View style={eventDetailStyles.infoItem}>
              <Text style={eventDetailStyles.infoLabel}>Horario</Text>
              <Text style={eventDetailStyles.infoValue}>{event.hora_inicio || '08:00'} - {event.hora_fin || '12:00'}</Text>
            </View>
            <View style={eventDetailStyles.infoItem}>
              <Text style={eventDetailStyles.infoLabel}>Localidad</Text>
              <Text style={eventDetailStyles.infoValue}>{event.localidad || 'Bogotá'}</Text>
            </View>
            <View style={eventDetailStyles.infoItem}>
              <Text style={eventDetailStyles.infoLabel}>Dirección</Text>
              <Text style={eventDetailStyles.infoValue}>{event.direccion || 'Por confirmar'}</Text>
            </View>
            <View style={eventDetailStyles.infoItem}>
              <Text style={eventDetailStyles.infoLabel}>Cupos Disponibles</Text>
              <Text style={eventDetailStyles.infoValue}>{event.cupos_disponibles ?? event.cupo_maximo ?? 25}</Text>
            </View>
            <View style={eventDetailStyles.infoItem}>
              <Text style={eventDetailStyles.infoLabel}>Estado</Text>
              <Text style={[eventDetailStyles.infoValue, { color: '#10B981' }]}>Activo</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={eventDetailStyles.bottomBar}>
        {isBeneficiary ? (
          <AppButton
            title="Solicitar Ayuda en esta Jornada"
            variant="secondary"
            onPress={() => handleRegister('beneficiario')}
            isLoading={isSubmitting}
            style={eventDetailStyles.actionButton}
          />
        ) : (
          <AppButton
            title="Postularme como Voluntario"
            variant="primary"
            onPress={() => handleRegister('voluntario')}
            isLoading={isSubmitting}
            style={eventDetailStyles.actionButton}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default EventDetailView;

