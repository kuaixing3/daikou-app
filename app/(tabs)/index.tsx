import React from 'react';
import { View, ActivityIndicator, StyleSheet, Pressable } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useRouter } from 'expo-router';

// Import the actual screens
import UserScreen from './user';
import DriverScreen from './driver';

export default function TabIndexScreen() {
  const { userProfile, isLoading, user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace('/(auth)/signup'); // Redirect to signup/login after sign out
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Sign Out Failed', 'Could not sign out. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <ThemedText>Loading profile...</ThemedText>
      </ThemedView>
    );
  }

  // If user is null, it means AuthProvider has finished loading and found no authenticated user.
  // This case should ideally be handled by _layout.tsx redirecting to /signup.
  if (!user) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Not authenticated. Redirecting...</ThemedText>
      </ThemedView>
    );
  }

  // If userProfile is null even if user is authenticated, it means
  // the profile data does not exist in Firestore for some reason.
  // This could happen if a user is created via Firebase Auth but their profile
  // is not yet written to Firestore.
  if (!userProfile) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>
          Your user profile could not be loaded. Please ensure your account is set up correctly.
        </ThemedText>
        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <ThemedText style={styles.signOutButtonText}>Sign Out</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  if (userProfile.role === 'user') {
    return <UserScreen />;
  } else if (userProfile.role === 'driver') {
    return <DriverScreen />;
  } else {
    // Fallback for unknown role
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Unknown user role.</ThemedText>
        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <ThemedText style={styles.signOutButtonText}>Sign Out</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  signOutButton: {
    marginTop: 20,
    backgroundColor: '#FF3B30', // Red color for sign out
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  signOutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
