import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../../../config/theme';

export const notificationsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  listContent: {
    padding: spacing.md,
  },
  itemCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  itemCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  itemDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  itemMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
