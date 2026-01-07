import { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TextInput,
  Pressable,
  Text,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { auth } from '../../config/firebase';
import { ThemedView } from '../../components/themed-view';
import { ThemedText } from '../../components/themed-text';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (email === '' || password === '') {
      Alert.alert('Login Error', 'Email and password cannot be empty.');
      return;
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Login successful, AuthProvider will handle the user state and redirection
      router.replace('/(tabs)');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Login Failed', error.message);
      } else {
        Alert.alert('Login Failed', 'An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Welcome Back!
      </ThemedText>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Pressable
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Logging In...' : 'Log In'}
        </Text>
      </Pressable>

      <Pressable
        style={styles.signUpLink}
        onPress={() => router.push('/(auth)/signup')}
        accessibilityRole="link">
        <ThemedText style={styles.signUpText}>
          Don't have an account? Sign Up
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    height: 50,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#a9a9a9',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpLink: {
    marginTop: 20,
    alignSelf: 'center',
  },
  signUpText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
