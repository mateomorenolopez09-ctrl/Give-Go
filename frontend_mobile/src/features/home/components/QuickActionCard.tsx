import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { THEME } from '../../../config/theme';
import { HomeQuickAction } from '../models/home.models';

interface QuickActionCardProps {
  action: HomeQuickAction;
  onPress: (action: HomeQuickAction) => void;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({ action, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(action)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: `${action.color}15` }]}>
        <View style={[styles.dot, { backgroundColor: action.color }]} />
      </View>
      <Text style={styles.title}>{action.title}</Text>
      <Text style={styles.subtitle}>{action.subtitle}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '47%',
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: THEME.colors.textMuted,
    marginTop: 4,
    lineHeight: 15,
  },
});

export default QuickActionCard;
