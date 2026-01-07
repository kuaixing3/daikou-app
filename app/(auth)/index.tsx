import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Welcome to Daikou App!
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Your personal ride-sharing service.
      </ThemedText>

      <Pressable
        style={styles.button}
        onPress={() => router.push('/(auth)/login')}
        accessibilityRole="link">
        <ThemedText style={styles.buttonText}>Log In</ThemedText>
      </Pressable>

      <Pressable
        style={[styles.button, styles.signUpButton]}
        onPress={() => router.push('/(auth)/signup')}
        accessibilityRole="link">
        <ThemedText style={[styles.buttonText, styles.signUpButtonText]}>
          Sign Up
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 60,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpButton: {
    backgroundColor: '#EFEFEF',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  signUpButtonText: {
    color: '#007AFF',
  },
});
