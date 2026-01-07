import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, ActivityIndicator, Alert, Switch, Platform, Pressable } from 'react-native';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../../config/firebase'; // Added auth import
import type { RideRequest } from '../../types';
import MapView, { Marker } from '../../components/ConditionalMapView';
import { useRouter } from 'expo-router'; // Added useRouter import
import { signOut } from 'firebase/auth'; // Added signOut import

export default function DriverScreen() {
  const { user, userProfile, isLoading: authLoading } = useAuth();
  const router = useRouter(); // Add this line
  const isDriver = userProfile?.role === 'driver';
  const [isOnline, setIsOnline] = useState(userProfile?.isOnline || false);
  const [currentRideRequest, setCurrentRideRequest] = useState<RideRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const initialRegion = {
    latitude: 34.052235, // Example: Los Angeles
    longitude: -118.243683,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Update driver's online status in Firestore
  useEffect(() => {
    if (user?.uid && isDriver) {
      const driverDocRef = doc(db, 'users', user.uid);
      updateDoc(driverDocRef, { isOnline: isOnline })
        .catch(error => console.error('Error updating online status:', error));
    }
  }, [isOnline, user?.uid, isDriver]);

  // Listen for new ride requests
  useEffect(() => {
    if (user?.uid && isOnline && isDriver) {
      const q = query(
        collection(db, 'rideRequests'),
        where('status', '==', 'searching'),
        where('driverId', '==', null), // requests not yet assigned
        orderBy('createdAt', 'asc'),
        limit(1)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const newRequest = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as RideRequest;
          setCurrentRideRequest(newRequest);
        } else {
          setCurrentRideRequest(null);
        }
      }, (error) => {
        console.error('Error listening to ride requests:', error);
      });

      return () => unsubscribe();
    } else {
      setCurrentRideRequest(null); // Clear request if offline
    }
  }, [user?.uid, isOnline, isDriver]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (userProfile && !isDriver) {
      router.replace('/(tabs)');
    }
  }, [authLoading, userProfile, isDriver, router]);

  if (authLoading || !userProfile || !isDriver) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <ThemedText>Loading profile...</ThemedText>
      </ThemedView>
    );
  }

  const handleAcceptRide = async () => {
    if (!currentRideRequest || !user?.uid) return;
    setIsLoading(true);
    try {
      const requestDocRef = doc(db, 'rideRequests', currentRideRequest.id);
      await updateDoc(requestDocRef, {
        status: 'matched',
        driverId: user.uid,
      });
      Alert.alert('Success', 'Ride accepted!');
      setCurrentRideRequest(null); // Clear the request from driver's view
    } catch (error) {
      console.error('Error accepting ride:', error);
      Alert.alert('Error', 'Failed to accept ride. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectRide = async () => {
    if (!currentRideRequest || !user?.uid) return;
    setIsLoading(true);
    try {
      // For MVP, just clear it. A real system would need more complex state management.
      setCurrentRideRequest(null);
      Alert.alert('Info', 'Ride rejected.');
    } catch (error) {
      console.error('Error rejecting ride:', error);
      Alert.alert('Error', 'Failed to reject ride.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => { // Add this function
    try {
      await signOut(auth);
      // The AuthProvider will handle redirecting to the auth flow.
    } catch (error) {
      console.error('Error signing out: ', error);
      Alert.alert('Error', 'Failed to sign out.');
    }
  };


  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Driver Dashboard</ThemedText>
        <Pressable onPress={handleSignOut}>
          <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
        </Pressable>
      </View>

      <ThemedView style={styles.onlineStatusContainer}>
        <ThemedText>Go Online:</ThemedText>
        <Switch value={isOnline} onValueChange={setIsOnline} disabled={isLoading} />
      </ThemedView>

      <MapView
        style={styles.mapView} // Use a dedicated style for MapView
        initialRegion={initialRegion}
        showsUserLocation={true} // Requires location permissions
      >
        {currentRideRequest?.pickupLocation && (
          <Marker
            coordinate={currentRideRequest.pickupLocation}
            title="Pickup Location"
            description="New ride request from here"
          />
        )}
      </MapView>

      {currentRideRequest ? (
        <ThemedView style={styles.requestCard}>
          <ThemedText type="subtitle">New Ride Request!</ThemedText>
          <ThemedText>
            From: {currentRideRequest.pickupLocation.latitude},{' '}
            {currentRideRequest.pickupLocation.longitude}
          </ThemedText>
          <View style={styles.requestActions}>
            <Button title="Accept" onPress={handleAcceptRide} disabled={isLoading} />
            <Button title="Reject" onPress={handleRejectRide} disabled={isLoading} color="red" />
          </View>
        </ThemedView>
      ) : (
        isOnline && <ThemedText style={styles.noRequestText}>Waiting for requests...</ThemedText>
      )}

      {isLoading && (
        <ThemedView style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
        </ThemedView>
      )}
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
  title: {
    marginBottom: 0, // Adjusted as it's now in a header
  },
  onlineStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  mapView: {
    width: '100%',
    flex: 1,
  },
  requestCard: {
    width: '90%',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
        }),
  },
  requestActions: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  noRequestText: {
    marginTop: 20,
    fontSize: 18,
    color: 'gray',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
