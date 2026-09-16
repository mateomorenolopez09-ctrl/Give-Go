import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Plus, Inbox } from 'lucide-react-native';
import { eventsListStyles } from '../styles/eventsList.styles';
import { EventItemCard } from '../components/EventItemCard';
import { AppLoader } from '../../../shared/components/loaders/AppLoader';
import { useEventsController } from '../controllers/useEventsController';

interface EventsListViewProps {
  navigation: any;
}

export const EventsListView: React.FC<EventsListViewProps> = ({ navigation }) => {
  const {
    user,
    events,
    categories,
    selectedCategory,
    isLoading,
    isRefreshing,
    handleRefresh,
    handleSelectCategory,
    navigateToDetail,
    navigateToCreateEvent,
  } = useEventsController(navigation);

  const isOrg = user?.rol === 'Organizacion' || (user?.rol as string) === 'organizacion';

  return (
    <SafeAreaView style={eventsListStyles.container}>
      <View style={eventsListStyles.header}>
        <View style={eventsListStyles.topRow}>
          <View>
            <Text style={eventsListStyles.title}>Convocatorias</Text>
            <Text style={eventsListStyles.greeting}>
              {user ? `Hola, ${user.nombre1}` : 'Impacto social en Bogotá'}
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={eventsListStyles.categoriesContainer}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleSelectCategory(null)}
            style={[
              eventsListStyles.categoryChip,
              selectedCategory === null && eventsListStyles.categoryChipActive,
            ]}
          >
            <Text
              style={[
                eventsListStyles.categoryText,
                selectedCategory === null && eventsListStyles.categoryTextActive,
              ]}
            >
              Todas
            </Text>
          </TouchableOpacity>

          {categories.map((cat, index) => {
            const catId = cat.id_categoria ?? (cat.id ? parseInt(String(cat.id).replace('cat_', ''), 10) : index + 1);
            return (
              <TouchableOpacity
                key={`cat_${catId}_${index}`}
                activeOpacity={0.7}
                onPress={() => handleSelectCategory(catId)}
                style={[
                  eventsListStyles.categoryChip,
                  selectedCategory === catId && eventsListStyles.categoryChipActive,
                ]}
              >
                <Text
                  style={[
                    eventsListStyles.categoryText,
                    selectedCategory === catId && eventsListStyles.categoryTextActive,
                  ]}
                >
                  {cat.nombre || cat.nombre_categoria || 'Categoría'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {isLoading && !isRefreshing ? (
        <AppLoader text="Cargando convocatorias activas..." />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item, index) => (item.id_evento || item.id || `evt_${index}`).toString()}
          renderItem={({ item }) => (
            <EventItemCard event={item} onPress={() => navigateToDetail(item)} />
          )}
          contentContainerStyle={eventsListStyles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={eventsListStyles.emptyContainer}>
              <Inbox size={48} color="#94A3B8" strokeWidth={1.5} />
              <Text style={eventsListStyles.emptyTitle}>No hay convocatorias disponibles</Text>
              <Text style={eventsListStyles.emptySubtitle}>
                Sé el primero en crear una jornada de apoyo o voluntariado en tu zona.
              </Text>
            </View>
          }
        />
      )}

      {isOrg && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={navigateToCreateEvent}
          style={eventsListStyles.fab}
        >
          <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={eventsListStyles.fabText}>Nueva Jornada</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default EventsListView;

