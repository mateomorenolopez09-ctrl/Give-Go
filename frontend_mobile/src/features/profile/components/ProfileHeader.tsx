import React from 'react';
import { View, Text } from 'react-native';
import { profileStyles } from '../styles/profile.styles';
import { UserProfile } from '../models/profile.models';

export const ProfileHeader: React.FC<{ user: UserProfile | null }> = ({ user }) => {
  const initial = user?.nombre1?.charAt(0).toUpperCase() || 'U';

  return (
    <View style={profileStyles.headerCard}>
      <View style={profileStyles.avatar}>
        <Text style={profileStyles.avatarText}>{initial}</Text>
      </View>
      <Text style={profileStyles.name}>
        {user?.nombre1} {user?.apellido1}
      </Text>
      <Text style={profileStyles.email}>{user?.correo}</Text>
      <View style={profileStyles.roleBadge}>
        <Text style={profileStyles.roleText}>{user?.rol || 'Voluntario'}</Text>
      </View>
    </View>
  );
};

export default ProfileHeader;
