import React from 'react';
import { View, Text, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import { loaderStyles } from './AppLoader.styles';
import { colors } from '../../../config/theme';

interface AppLoaderProps {
  text?: string;
  message?: string;
  fullScreen?: boolean;
  size?: 'small' | 'large';
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const AppLoader: React.FC<AppLoaderProps> = ({
  text,
  message,
  fullScreen = false,
  size = 'large',
  color = colors.primary,
  style,
}) => {
  const displayText = text || message;
  return (
    <View style={[fullScreen ? loaderStyles.fullScreen : loaderStyles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {displayText ? <Text style={loaderStyles.text}>{displayText}</Text> : null}
    </View>
  );
};

export default AppLoader;
