import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import { LoginView } from '../features/auth/views/LoginView';
import { RegisterVolunteerView } from '../features/auth/views/RegisterVolunteerView';
import { RegisterBeneficiaryView } from '../features/auth/views/RegisterBeneficiaryView';
import { ForgotPasswordView } from '../features/auth/views/ForgotPasswordView';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginView} />
      <Stack.Screen name="RegisterVolunteer" component={RegisterVolunteerView} />
      <Stack.Screen name="RegisterBeneficiary" component={RegisterBeneficiaryView} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordView} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
