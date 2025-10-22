import { StyleSheet, Text, View, TouchableOpacity, Alert, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { COLORS } from "../constants/colors";

import Button from "../components/Button";
import { MapPin, Navigation, Check } from 'lucide-react-native';

interface Location {
  latitude: number;
  longitude: number;
}

export default function MapLocationScreen() {
  const params = useLocalSearchParams();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  
  // Check if this is directions mode
  const isDirectionsMode = params.mode === 'directions';
  const clinicName = params.name as string;
  const clinicAddress = params.address as string;

  useEffect(() => {
    const initializeLocation = () => {
      const clinic = params.latitude && params.longitude ? {
        latitude: parseFloat(params.latitude as string),
        longitude: parseFloat(params.longitude as string)
      } : null;
      
      if (isDirectionsMode && clinic) {
        // In directions mode, set the clinic location as the target
        setSelectedLocation(clinic);
      }
    };
    
    initializeLocation();
    getCurrentLocation();
  }, [isDirectionsMode, params.latitude, params.longitude]);

  const getCurrentLocation = async () => {
    if (Platform.OS === 'web') {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setCurrentLocation(location);
            setSelectedLocation(location);
          },
          (error) => {
            console.log('Error getting location:', error);
            // Default to Riyadh if location access is denied
            const defaultLocation = { latitude: 24.7136, longitude: 46.6753 };
            setCurrentLocation(defaultLocation);
            setSelectedLocation(defaultLocation);
          }
        );
      }
    } else {
      // For mobile, we would use expo-location here
      // For now, use default location
      const defaultLocation = { latitude: 24.7136, longitude: 46.6753 };
      setCurrentLocation(defaultLocation);
      setSelectedLocation(defaultLocation);
    }
  };

  const handleUseCurrentLocation = () => {
    if (currentLocation) {
      setSelectedLocation(currentLocation);
    } else {
      getCurrentLocation();
    }
  };

  const calculateDistance = (loc1: Location, loc2: Location): string => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (loc2.latitude - loc1.latitude) * Math.PI / 180;
    const dLon = (loc2.longitude - loc1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(loc1.latitude * Math.PI / 180) * Math.cos(loc2.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance.toFixed(1);
  };

  const handleConfirmLocation = () => {
    if (!selectedLocation) {
      Alert.alert('خطأ', 'يرجى اختيار موقع على الخريطة');
      return;
    }

    // Return the selected location to the previous screen
    if (params.returnTo) {
      router.back();
      // In a real app, you would pass the location data back
      console.log('Selected location:', selectedLocation);
    } else {
      router.back();
    }
  };

  const openInMapsApp = () => {
    if (!selectedLocation) return;
    
    // In a real app, this would open the device's maps app
    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.latitude},${selectedLocation.longitude}`;
    console.log('Opening maps app with URL:', url);
    Alert.alert(
      'فتح في تطبيق الخرائط',
      'سيتم فتح تطبيق الخرائط لعرض الاتجاهات',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'فتح', onPress: () => console.log('Opening maps app') }
      ]
    );
  };

  const handleMapPress = (latitude: number, longitude: number) => {
    setSelectedLocation({ latitude, longitude });
  };

  // Mock map component since we can't use real maps in this environment
  const MockMapView = () => (
    <View style={styles.mapContainer}>
      <View style={styles.mapPlaceholder}>
        <MapPin size={40} color={COLORS.primary} />
        <Text style={styles.mapPlaceholderText}>
          {isDirectionsMode ? 'خريطة الاتجاهات' : 'خريطة تفاعلية'}
        </Text>
        
        {isDirectionsMode && clinicName ? (
          <View style={styles.clinicInfo}>
            <Text style={styles.clinicNameText}>{clinicName}</Text>
            <Text style={styles.clinicAddressText}>{clinicAddress}</Text>
            <Text style={styles.mapInstructions}>
              في التطبيق الحقيقي، ستظهر هنا خريطة تفاعلية مع الاتجاهات
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.mapInstructions}>
              في التطبيق الحقيقي، ستظهر هنا خريطة تفاعلية
            </Text>
            <Text style={styles.mapInstructions}>
              يمكنك النقر على أي مكان لتحديد الموقع
            </Text>
          </>
        )}
        
        {selectedLocation && (
          <View style={styles.selectedLocationInfo}>
            <Text style={styles.selectedLocationText}>
              {isDirectionsMode ? 'موقع العيادة:' : 'الموقع المحدد:'}
            </Text>
            <Text style={styles.coordinatesText}>
              {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
            </Text>
            {currentLocation && isDirectionsMode && (
              <Text style={styles.distanceText}>
                المسافة التقريبية: {calculateDistance(currentLocation, selectedLocation)} كم
              </Text>
            )}
          </View>
        )}

        {!isDirectionsMode && (
          <TouchableOpacity
            style={styles.mockClickArea}
            onPress={() => handleMapPress(24.7136 + (Math.random() - 0.5) * 0.01, 46.6753 + (Math.random() - 0.5) * 0.01)}
          >
            <Text style={styles.mockClickText}>انقر هنا لتحديد موقع عشوائي</Text>
          </TouchableOpacity>
        )}
        
        {isDirectionsMode && (
          <TouchableOpacity
            style={styles.mockClickArea}
            onPress={() => {
              // Simulate opening external maps app
              console.log('Opening external maps app for directions');
            }}
          >
            <Text style={styles.mockClickText}>فتح في تطبيق الخرائط</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: isDirectionsMode ? 'الاتجاهات إلى العيادة' : 'تحديد الموقع',
          headerShown: true,
        }} 
      />

      <MockMapView />

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleUseCurrentLocation}
        >
          <Navigation size={20} color={COLORS.white} />
          <Text style={styles.currentLocationText}>
            استخدام موقعي الحالي
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          {isDirectionsMode ? (
            <Button
              title="فتح في تطبيق الخرائط"
              onPress={openInMapsApp}
              type="primary"
              style={styles.confirmButton}
              icon={<Navigation size={20} color={COLORS.white} />}
              disabled={!selectedLocation}
            />
          ) : (
            <Button
              title="تأكيد الموقع"
              onPress={handleConfirmLocation}
              type="primary"
              style={styles.confirmButton}
              icon={<Check size={20} color={COLORS.white} />}
              disabled={!selectedLocation}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  mapContainer: {
    flex: 1,
  },
  mapPlaceholder: {
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
  mapInstructions: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 4,
  },
  selectedLocationInfo: {
    marginTop: 20,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedLocationText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: 'monospace',
  },
  clinicInfo: {
    marginTop: 16,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    alignItems: 'center',
  },
  clinicNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 4,
  },
  clinicAddressText: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  distanceText: {
    fontSize: 12,
    color: COLORS.info,
    marginTop: 4,
    fontWeight: '600',
  },
  mockClickArea: {
    marginTop: 20,
    padding: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  mockClickText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  controls: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.info,
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  currentLocationText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    padding: 16,
  },
  confirmButton: {
    width: '100%',
  },
});