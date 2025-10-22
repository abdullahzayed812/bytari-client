import { StyleSheet, Text, View, TouchableOpacity, Platform, FlatList, TextInput } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { Stack, router } from 'expo-router';
import { COLORS } from "../constants/colors";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MapPin, Search, Filter, Navigation, Phone } from 'lucide-react-native';
import { mockClinics, mockVetStores } from "../mocks/data";
import { Clinic, VetStore } from "../types";

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface MapLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  type: 'clinic' | 'store';
  coordinates: LocationCoords;
  rating: number;
}

export default function AllLocationsMapScreen() {
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'clinic' | 'store'>('all');
  const [showList, setShowList] = useState<boolean>(false);

  // Convert clinics and stores to map locations
  const allLocations: MapLocation[] = [
    ...mockClinics.map((clinic: Clinic) => ({
      id: clinic.id,
      name: clinic.name,
      address: clinic.address,
      phone: clinic.phone,
      type: 'clinic' as const,
      coordinates: clinic.location ? {
        latitude: clinic.location.latitude,
        longitude: clinic.location.longitude
      } : {
        latitude: 24.7136 + (Math.random() - 0.5) * 0.1, // Random coordinates around Riyadh if no location
        longitude: 46.6753 + (Math.random() - 0.5) * 0.1
      },
      rating: clinic.rating
    })),
    ...mockVetStores.map((store: VetStore) => ({
      id: store.id,
      name: store.name,
      address: store.address,
      phone: store.phone,
      type: 'store' as const,
      coordinates: {
        latitude: 24.7136 + (Math.random() - 0.5) * 0.2, // Random coordinates around Riyadh
        longitude: 46.6753 + (Math.random() - 0.5) * 0.2
      },
      rating: store.rating
    }))
  ];

  const getCurrentLocation = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              setCurrentLocation(location);
            },
            (error) => {
              console.log('Error getting location:', error);
              // Default to Riyadh if location access is denied
              const defaultLocation = { latitude: 24.7136, longitude: 46.6753 };
              setCurrentLocation(defaultLocation);
            }
          );
        }
      } else {
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Location permission denied');
          // Default to Riyadh if permission denied
          const defaultLocation = { latitude: 24.7136, longitude: 46.6753 };
          setCurrentLocation(defaultLocation);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const currentLoc = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setCurrentLocation(currentLoc);
      }
    } catch (error) {
      console.log('Error getting location:', error);
      // Default to Riyadh
      const defaultLocation = { latitude: 24.7136, longitude: 46.6753 };
      setCurrentLocation(defaultLocation);
    }
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Filter locations based on search and type
  const filteredLocations = allLocations.filter(location => {
    const matchesSearch = searchQuery.trim() === '' || 
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || location.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getInitialRegion = () => {
    if (currentLocation) {
      return {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }
    
    // Default to Riyadh
    return {
      latitude: 24.7136,
      longitude: 46.6753,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  };

  const handleMarkerPress = (location: MapLocation) => {
    setSelectedLocation(location);
  };

  const handleGetDirections = (location: MapLocation) => {
    router.push({
      pathname: '/map-location',
      params: {
        mode: 'directions',
        name: location.name,
        address: location.address,
        latitude: location.coordinates.latitude.toString(),
        longitude: location.coordinates.longitude.toString()
      }
    });
  };

  const handleViewDetails = (location: MapLocation) => {
    if (location.type === 'clinic') {
      router.push({ pathname: '/clinic-profile', params: { id: location.id } });
    } else {
      router.push({ pathname: '/store-details', params: { id: location.id } });
    }
  };

  const RealMapView = () => {
    if (Platform.OS === 'web') {
      // Fallback for web
      return (
        <View style={styles.mapContainer}>
          <View style={styles.webMapPlaceholder}>
            <MapPin size={40} color={COLORS.primary} />
            <Text style={styles.mapPlaceholderText}>خريطة المواقع</Text>
            <Text style={styles.webMapNote}>
              الخرائط التفاعلية متوفرة على الهاتف المحمول
            </Text>
            <Text style={styles.locationsCount}>
              {filteredLocations.length} موقع متاح
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={getInitialRegion()}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          mapType="standard"
        >
          {filteredLocations.map((location) => (
            <Marker
              key={location.id}
              coordinate={location.coordinates}
              title={location.name}
              description={location.address}
              pinColor={location.type === 'clinic' ? COLORS.primary : COLORS.success}
              onPress={() => handleMarkerPress(location)}
            />
          ))}
        </MapView>
        
        {/* Selected location info card */}
        {selectedLocation && (
          <View style={styles.selectedLocationCard}>
            <View style={styles.selectedLocationHeader}>
              <Text style={styles.selectedLocationName}>{selectedLocation.name}</Text>
              <View style={[styles.typeBadge, { 
                backgroundColor: selectedLocation.type === 'clinic' ? COLORS.primary : COLORS.success 
              }]}>
                <Text style={styles.typeBadgeText}>
                  {selectedLocation.type === 'clinic' ? 'عيادة' : 'مذخر'}
                </Text>
              </View>
            </View>
            <Text style={styles.selectedLocationAddress}>{selectedLocation.address}</Text>
            <Text style={styles.selectedLocationPhone}>{selectedLocation.phone}</Text>
            
            <View style={styles.selectedLocationActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.primaryActionButton]}
                onPress={() => handleGetDirections(selectedLocation)}
              >
                <Navigation size={16} color={COLORS.white} />
                <Text style={styles.primaryActionButtonText}>الاتجاهات</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleViewDetails(selectedLocation)}
              >
                <Text style={styles.actionButtonText}>التفاصيل</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderLocationItem = ({ item }: { item: MapLocation }) => (
    <TouchableOpacity 
      style={styles.locationItem}
      onPress={() => handleViewDetails(item)}
    >
      <View style={styles.locationItemHeader}>
        <Text style={styles.locationItemName}>{item.name}</Text>
        <View style={[styles.typeBadge, { 
          backgroundColor: item.type === 'clinic' ? COLORS.primary : COLORS.success 
        }]}>
          <Text style={styles.typeBadgeText}>
            {item.type === 'clinic' ? 'عيادة' : 'مذخر'}
          </Text>
        </View>
      </View>
      <Text style={styles.locationItemAddress}>{item.address}</Text>
      <Text style={styles.locationItemPhone}>{item.phone}</Text>
      
      <View style={styles.locationItemActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.primaryActionButton]}
          onPress={() => handleGetDirections(item)}
        >
          <Navigation size={16} color={COLORS.white} />
          <Text style={styles.primaryActionButtonText}>الاتجاهات</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            console.log(`Call ${item.name}: ${item.phone}`);
            // TODO: Implement phone call functionality
          }}
        >
          <Phone size={16} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>اتصال</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'خريطة المواقع',
          headerShown: true,
        }} 
      />

      {/* Search and Filter Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={COLORS.darkGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="البحث في المواقع..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
        </View>
        
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterButtonText, filterType === 'all' && styles.filterButtonTextActive]}>
              الكل
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'clinic' && styles.filterButtonActive]}
            onPress={() => setFilterType('clinic')}
          >
            <Text style={[styles.filterButtonText, filterType === 'clinic' && styles.filterButtonTextActive]}>
              العيادات
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'store' && styles.filterButtonActive]}
            onPress={() => setFilterType('store')}
          >
            <Text style={[styles.filterButtonText, filterType === 'store' && styles.filterButtonTextActive]}>
              المذاخر
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.viewToggleButton}
          onPress={() => setShowList(!showList)}
        >
          <Text style={styles.viewToggleButtonText}>
            {showList ? 'عرض الخريطة' : 'عرض القائمة'}
          </Text>
        </TouchableOpacity>
      </View>

      {showList ? (
        <FlatList
          data={filteredLocations}
          renderItem={renderLocationItem}
          keyExtractor={(item) => item.id}
          style={styles.locationsList}
          contentContainerStyle={styles.locationsListContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {searchQuery.trim() ? 'لا توجد مواقع تطابق البحث' : 'لا توجد مواقع متاحة'}
              </Text>
            </View>
          )}
        />
      ) : (
        <RealMapView />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    marginRight: 8,
  },
  filterContainer: {
    flexDirection: 'row-reverse',
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: '500',
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  viewToggleButton: {
    backgroundColor: COLORS.info,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewToggleButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  webMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
    margin: 16,
    borderRadius: 12,
    padding: 20,
  },
  mapPlaceholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginTop: 16,
    marginBottom: 8,
  },
  webMapNote: {
    fontSize: 12,
    color: COLORS.info,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  locationsCount: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 8,
  },
  selectedLocationCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedLocationHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedLocationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    flex: 1,
    textAlign: 'right',
  },
  selectedLocationAddress: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
    textAlign: 'right',
  },
  selectedLocationPhone: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 12,
    textAlign: 'right',
  },
  selectedLocationActions: {
    flexDirection: 'row-reverse',
    gap: 12,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  primaryActionButton: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  primaryActionButtonText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '600',
  },
  locationsList: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  locationsListContent: {
    padding: 16,
  },
  locationItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationItemHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    flex: 1,
    textAlign: 'right',
  },
  locationItemAddress: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
    textAlign: 'right',
  },
  locationItemPhone: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 12,
    textAlign: 'right',
  },
  locationItemActions: {
    flexDirection: 'row-reverse',
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
});