import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../store/auth/AuthContext';
import { RootStackParamList } from './types';

// Navigators
import { AuthNavigator } from './AuthNavigator';
import { BottomTabNavigator } from './BottomTabNavigator';

// Modals / Secondary Screens
import { EventDetailView } from '../features/events/views/EventDetailView';
import { CreateEventView } from '../features/events/views/CreateEventView';
import { EditEventView } from '../features/events/views/EditEventView';
import { CreateDonationView } from '../features/donations/views/CreateDonationView';
import { CreateRequestView } from '../features/beneficiary/views/CreateRequestView';
import { EditProfileView } from '../features/profile/views/EditProfileView';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <Stack.Group>
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
            <Stack.Screen name="EventDetail" component={EventDetailView} />
            <Stack.Screen name="CreateEvent" component={CreateEventView} />
            <Stack.Screen name="EditEvent" component={EditEventView} />
            <Stack.Screen name="CreateDonation" component={CreateDonationView} />
            <Stack.Screen name="CreateRequest" component={CreateRequestView} />
            <Stack.Screen name="EditProfile" component={EditProfileView} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
