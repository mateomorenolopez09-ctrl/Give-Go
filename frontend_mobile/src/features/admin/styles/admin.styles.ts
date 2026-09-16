import { StyleSheet } from 'react-native';
import { THEME } from '../../../config/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: THEME.colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.text,
    marginBottom: 12,
  },
  userCard: {
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
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  userEmail: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.text,
  },
});

export default styles;
