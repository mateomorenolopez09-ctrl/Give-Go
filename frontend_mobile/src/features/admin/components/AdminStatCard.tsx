import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../../../config/theme';

interface AdminStatCardProps {
  label: string;
  value: number | string;
  color?: string;
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({ label, value, color = THEME.colors.primary }) => {
  return (
    <View style={styles.card}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: THEME.colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
});

export default AdminStatCard;
