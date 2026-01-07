import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';

// Import the actual screens
import UserScreen from './user';
import DriverScreen from './driver';

export default function TabIndexScreen() {
  const { userProfile, isLoading, user } = useAuth();

  // Show loading indicator while auth state is being resolved,
  // or if the user is authenticated but the profile is still being fetched.
  if (isLoading || (user && !userProfile)) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <ThemedText>Loading profile...</ThemedText>
      </ThemedView>
    );
  }

  // This case should ideally be handled by _layout.tsx redirecting to /signup.
  if (!user) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Not authenticated. Redirecting...</ThemedText>
      </ThemedView>
    );
  }

  // After loading, if there's a user but still no profile, it's a genuine issue.
  // This might happen if the Firestore document creation failed or is delayed.
  // We show a generic error and allow signing out.
  if (!userProfile) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>
          Could not load user profile. Please try signing out and back in.
        </ThemedText>
        {/* A sign-out button could be placed here as a fallback, handled by a separate component */}
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
});
