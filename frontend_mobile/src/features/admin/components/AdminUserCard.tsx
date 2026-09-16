import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../../../config/theme';
import { AdminUserItem } from '../models/admin.models';

interface AdminUserCardProps {
  user: AdminUserItem;
}

export const AdminUserCard: React.FC<AdminUserCardProps> = ({ user }) => {
  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{user.nombre1} {user.apellido1}</Text>
        <Text style={styles.email}>{user.correo}</Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{user.rol}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  email: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.text,
  },
});

export default AdminUserCard;
