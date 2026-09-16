import React from 'react';
import { View, Text } from 'react-native';
import { authHeaderStyles } from './AuthHeader.styles';

export const AuthHeader: React.FC = () => {
  return (
    <View style={authHeaderStyles.container}>
      <View style={authHeaderStyles.logoBox}>
        <Text style={authHeaderStyles.logoText}>G</Text>
      </View>
      <Text style={authHeaderStyles.brandTitle}>Give&Go</Text>
      <Text style={authHeaderStyles.brandSubtitle}>Solidaridad comunitaria en acción</Text>
    </View>
  );
};

export default AuthHeader;
