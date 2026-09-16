import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../../../config/theme';

export const donationCardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  typeBadgeMonetary: {
    backgroundColor: colors.successLight,
  },
  typeBadgeSpecies: {
    backgroundColor: colors.infoLight,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginVertical: spacing.xs,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.success,
    marginBottom: spacing.xs,
  },
  descriptionText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  donorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  donorText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
