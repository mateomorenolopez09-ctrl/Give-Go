import React from 'react';
import { View, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { cardStyles } from './AppCard.styles';

interface AppCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const AppCard: React.FC<AppCardProps> = ({ children, onPress, style }) => {
  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[cardStyles.container, style]}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[cardStyles.container, style]}>{children}</View>;
};

export default AppCard;
