import React from 'react';
import { View, Text } from 'react-native';
import { Donacion } from '../models/donation.models';
import { donationCardStyles } from './DonationItemCard.styles';
import { formatCOP, formatDate } from '../../../shared/utils/formatters';

export const DonationItemCard: React.FC<{ donation: Donacion }> = ({ donation }) => {
  const isMonetary = donation.tipo_donacion === 'monetaria';

  return (
    <View style={donationCardStyles.card}>
      <View style={donationCardStyles.header}>
        <View
          style={[
            donationCardStyles.typeBadge,
            isMonetary ? donationCardStyles.typeBadgeMonetary : donationCardStyles.typeBadgeSpecies,
          ]}
        >
          <Text
            style={[
              donationCardStyles.typeText,
              { color: isMonetary ? '#059669' : '#2563EB' },
            ]}
          >
            {isMonetary ? 'Monetaria' : 'En Especie'}
          </Text>
        </View>
        <Text style={donationCardStyles.dateText}>{formatDate(donation.fecha_donacion)}</Text>
      </View>

      {isMonetary ? (
        <Text style={donationCardStyles.amountText}>{formatCOP(donation.monto || 0)}</Text>
      ) : (
        <Text style={donationCardStyles.title}>Donación en Especie</Text>
      )}

      {donation.descripcion_especie ? (
        <Text style={donationCardStyles.descriptionText}>{donation.descripcion_especie}</Text>
      ) : null}

      <View style={donationCardStyles.donorRow}>
        <Text style={donationCardStyles.donorText}>
          Donado por: {donation.anonima ? 'Donante Anónimo' : donation.donante_nombre || 'Comunidad'}
        </Text>
      </View>
    </View>
  );
};

export default DonationItemCard;
