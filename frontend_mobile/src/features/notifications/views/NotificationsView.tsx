import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { notificationsStyles } from '../styles/notifications.styles';
import { useNotificationsController } from '../controllers/useNotificationsController';
import { formatDate } from '../../../shared/utils/formatters';
import { AppLoader } from '../../../shared/components/loaders/AppLoader';

export const NotificationsView: React.FC = () => {
  const { notifications, isLoading } = useNotificationsController();

  return (
    <SafeAreaView style={notificationsStyles.container}>
      <View style={notificationsStyles.header}>
        <Text style={notificationsStyles.title}>Notificaciones</Text>
      </View>

      {isLoading ? (
        <AppLoader text="Cargando alertas..." />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={notificationsStyles.listContent}
          renderItem={({ item }) => (
            <View
              style={[
                notificationsStyles.itemCard,
                !item.leida && notificationsStyles.itemCardUnread,
              ]}
            >
              <View style={notificationsStyles.itemHeader}>
                <Text style={notificationsStyles.itemTitle}>{item.titulo}</Text>
                <Text style={notificationsStyles.itemDate}>{formatDate(item.fecha)}</Text>
              </View>
              <Text style={notificationsStyles.itemMessage}>{item.mensaje}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default NotificationsView;
