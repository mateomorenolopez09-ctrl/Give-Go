import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { buttonStyles } from './AppButton.styles';
import { colors } from '../../../config/theme';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const isActionDisabled = disabled || isLoading;

  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return buttonStyles.secondary;
      case 'outline':
        return buttonStyles.outline;
      case 'ghost':
        return buttonStyles.ghost;
      default:
        return buttonStyles.primary;
    }
  };

  const getVariantTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return buttonStyles.textSecondary;
      case 'outline':
        return buttonStyles.textOutline;
      case 'ghost':
        return buttonStyles.textGhost;
      default:
        return buttonStyles.textPrimary;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isActionDisabled}
      style={[
        buttonStyles.base,
        getVariantStyle(),
        isActionDisabled && buttonStyles.disabled,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.surface} />
      ) : (
        <>
          {icon}
          <Text style={[buttonStyles.textBase, getVariantTextStyle(), textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default AppButton;
