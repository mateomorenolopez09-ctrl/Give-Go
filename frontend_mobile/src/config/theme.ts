export const colors = {
  primary: '#DC2626',
  primaryDark: '#B91C1C',
  primaryLight: '#FEF2F2',
  primaryBorder: '#FCA5A5',

  secondary: '#2563EB',
  secondaryLight: '#EFF6FF',

  background: '#F9FAFB',
  surface: '#FFFFFF',

  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',

  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  success: '#10B981',
  successLight: '#D1FAE5',

  warning: '#F59E0B',
  warningLight: '#FEF3C7',

  info: '#3B82F6',
  infoLight: '#DBEAFE',

  danger: '#EF4444',
  dangerLight: '#FEE2E2',

  shadow: 'rgba(0, 0, 0, 0.06)',
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    title: 28,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const THEME = {
  colors,
  typography,
  spacing,
  borderRadius,
};

export const theme = THEME;

export default THEME;
