import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { Home, Calendar, HeartHandshake, ClipboardList, Bell, User } from 'lucide-react-native';
import { BottomTabParamList } from './types';
import { colors } from '../config/theme';
import { useAuth } from '../store/auth/AuthContext';

// Views
import { Home as HomeScreen } from '../features/home/views/Home';
import { EventsListView } from '../features/events/views/EventsListView';
import { DonationsListView } from '../features/donations/views/DonationsListView';
import { BeneficiaryRequestsView } from '../features/beneficiary/views/BeneficiaryRequestsView';
import { NotificationsView } from '../features/notifications/views/NotificationsView';
import { ProfileView } from '../features/profile/views/ProfileView';

const Tab = createBottomTabNavigator<BottomTabParamList>();

const TabIcon = ({ name, focused, color }: { name: string; focused: boolean; color: string }) => {
  const iconSize = focused ? 22 : 20;
  const strokeWidth = focused ? 2.5 : 2;

  let IconComponent = Home;
  if (name === 'Eventos') IconComponent = Calendar;
  if (name === 'Donaciones') IconComponent = HeartHandshake;
  if (name === 'Solicitudes') IconComponent = ClipboardList;
  if (name === 'Notificaciones') IconComponent = Bell;
  if (name === 'Perfil') IconComponent = User;

  return (
    <View style={[styles.iconBox, focused && styles.iconBoxActive]}>
      <IconComponent size={iconSize} color={color} strokeWidth={strokeWidth} />
    </View>
  );
};

export const BottomTabNavigator = () => {
  const { user } = useAuth();
  const isBeneficiary = user?.rol === 'Beneficiario' || (user?.rol as string) === 'beneficiario';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted || '#94A3B8',
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color }) => (
          <TabIcon name={route.name} focused={focused} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Eventos" component={EventsListView} />
      <Tab.Screen name="Donaciones" component={DonationsListView} />
      {isBeneficiary ? (
        <Tab.Screen name="Solicitudes" component={BeneficiaryRequestsView} />
      ) : null}
      <Tab.Screen name="Notificaciones" component={NotificationsView} />
      <Tab.Screen name="Perfil" component={ProfileView} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxActive: {
    transform: [{ scale: 1.08 }],
  },
});

export default BottomTabNavigator;
