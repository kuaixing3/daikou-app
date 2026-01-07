import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Button,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import type { Location, RideRequestStatus } from '../../types';
import MapView, { Marker } from '../../components/ConditionalMapView';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';

export default function UserScreen() {
  const { user, userProfile, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const isUser = userProfile?.role === 'user';
  const [currentStatus, setCurrentStatus] =
    useState<RideRequestStatus | 'idle'>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);

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
    setCurrentStatus('searching');
    try {
      const selectedPickupLocation: Location = {
        latitude: initialRegion.latitude + (Math.random() * 0.01 - 0.005),
        longitude: initialRegion.longitude + (Math.random() * 0.01 - 0.005),
      };
      setPickupLocation(selectedPickupLocation);

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
      setCurrentStatus('idle');
      setPickupLocation(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // The AuthProvider will handle redirecting to the auth flow.
    } catch (error) {
      console.error('Error signing out: ', error);
      Alert.alert('Error', 'Failed to sign out.');
    }
  };

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (userProfile && !isUser) {
      router.replace('/(tabs)');
    }
  }, [authLoading, userProfile, isUser, router]);

  if (authLoading || !userProfile || !isUser) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <ThemedText>Loading profile...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">User Dashboard</ThemedText>
        <Pressable onPress={handleSignOut}>
          <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
        </Pressable>
      </View>

      <MapView
        style={styles.mapView}
        initialRegion={initialRegion}
        showsUserLocation={true}
      >
        {pickupLocation && (
          <Marker
            coordinate={pickupLocation}
            title="Pickup Location"
            description="Your requested pickup point"
          />
        )}
      </MapView>

      <View style={styles.bottomContainer}>
        <ThemedText style={styles.statusText}>
          Current Status:{' '}
          {currentStatus === 'idle'
            ? 'Ready'
            : currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
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
            <ThemedText style={styles.searchingText}>
              Searching for a driver...
            </ThemedText>
          </ThemedView>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 20,
    paddingTop: 50, // Adjust for status bar
  },
  signOutText: {
    color: '#007AFF',
    fontSize: 16,
  },
  mapView: {
    width: '100%',
    flex: 1,
  },
  bottomContainer: {
    padding: 20,
    width: '100%',
    alignItems: 'center',
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
});
