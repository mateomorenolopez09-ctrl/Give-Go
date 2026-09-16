import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../../../config/theme';

interface HomeHeroProps {
  userName?: string;
  userRole?: string;
}

export const HomeHero: React.FC<HomeHeroProps> = ({ userName, userRole }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>BIENVENIDO DE VUELTA</Text>
      <Text style={styles.name}>{userName || 'Comunidad Give&Go'}</Text>
      {userRole && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{userRole}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  welcome: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.text,
    marginTop: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
    textTransform: 'uppercase',
  },
});

export default HomeHero;
