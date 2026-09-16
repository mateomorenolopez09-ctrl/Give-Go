import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, StyleProp, ViewStyle } from 'react-native';
import { inputStyles } from './AppInput.styles';
import { colors } from '../../../config/theme';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperStyle?: StyleProp<ViewStyle>;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  wrapperStyle,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[inputStyles.wrapper, wrapperStyle]}>
      {label && <Text style={inputStyles.label}>{label}</Text>}
      <View
        style={[
          inputStyles.container,
          isFocused && inputStyles.containerFocused,
          Boolean(error) && inputStyles.containerError,
        ]}
      >
        {leftIcon}
        <TextInput
          placeholderTextColor={colors.textMuted}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          style={inputStyles.input}
          {...props}
        />
        {rightIcon}
      </View>
      {error ? <Text style={inputStyles.errorText}>{error}</Text> : null}
    </View>
  );
};

export default AppInput;
