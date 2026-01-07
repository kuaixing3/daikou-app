import React, { useState } from 'react';
import { View, StyleSheet, Button, ActivityIndicator, Alert } from 'react-native';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { Location, RideRequestStatus } from '../../types';
import MapView, { Marker } from '../../components/ConditionalMapView'; // Import MapView and Marker

export default function UserScreen() {
  const { user } = useAuth();
  const [currentStatus, setCurrentStatus] = useState<RideRequestStatus | 'idle'>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null); // State to hold pickup location

  const initialRegion = {
    latitude: 34.052235, // Example: Los Angeles
    longitude: -118.243683,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const handleRequestRide = async () => {
    if (!user || !user.uid) {
      Alert.alert('Error', 'You must be logged in to request a ride.');
      return;
    }

    setIsLoading(true);
    setCurrentStatus('searching'); // Immediately update status for UI
    try {
      // For MVP, we'll use a dummy location.
      // In a real app, this would come from GPS.
      const selectedPickupLocation: Location = { // Use a local variable for clarity
        latitude: initialRegion.latitude + (Math.random() * 0.01 - 0.005), // Slightly vary for testing
        longitude: initialRegion.longitude + (Math.random() * 0.01 - 0.005),
      };
      setPickupLocation(selectedPickupLocation); // Set the pickup location for the marker

      await addDoc(collection(db, 'rideRequests'), {
        userId: user.uid,
        status: 'searching',
        pickupLocation: selectedPickupLocation,
        createdAt: serverTimestamp(),
      });
      Alert.alert('Success', 'Ride requested! Searching for a driver...');
    } catch (error) {
      console.error('Error requesting ride:', error);
      Alert.alert('Error', 'Failed to request ride. Please try again.');
      setCurrentStatus('idle'); // Revert status on error
      setPickupLocation(null); // Clear pickup location on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        User Dashboard
      </ThemedText>

      <MapView
        style={styles.mapView} // Use a dedicated style for MapView
        initialRegion={initialRegion}
        showsUserLocation={true} // Requires location permissions (handled in AndroidManifest/Info.plist)
      >
        {pickupLocation && (
          <Marker
            coordinate={pickupLocation}
            title="Pickup Location"
            description="Your requested pickup point"
          />
        )}
      </MapView>

      <ThemedText style={styles.statusText}>
        Current Status: {currentStatus === 'idle' ? 'Ready' : currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
      </ThemedText>

      {currentStatus === 'idle' && (
        <Button
          title={isLoading ? 'Requesting...' : 'Request Ride'}
          onPress={handleRequestRide}
          disabled={isLoading}
        />
      )}

      {currentStatus === 'searching' && (
        <ThemedView style={styles.searchingContainer}>
          <ActivityIndicator size="large" />
          <ThemedText style={styles.searchingText}>Searching for a driver...</ThemedText>
        </ThemedView>
      )}

      {/* Add UI for 'matched' state later */}
      {/* {currentStatus === 'matched' && (
        <ThemedView style={styles.matchedContainer}>
          <ThemedText style={styles.matchedText}>Driver found! Details here.</ThemedText>
        </ThemedView>
      )} */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: 20,
  },
  mapView: { // Updated style for MapView
    width: '100%',
    height: 300,
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statusText: {
    fontSize: 18,
    marginBottom: 20,
  },
  searchingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  searchingText: {
    fontSize: 16,
  },
  // matchedContainer: { ... },
  // matchedText: { ... },
});
