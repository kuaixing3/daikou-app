import { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TextInput,
  Text,
  Pressable,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { auth, db } from '../../config/firebase';
import type { UserRole } from '../../types';
import { ThemedView } from '../../components/themed-view';
import { ThemedText } from '../../components/themed-text';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    const finalEmail = email.trim(); // Trim whitespace from email

    if (finalEmail === '' || password === '') {
      Alert.alert('Sign Up Error', 'Email and password cannot be empty.');
      return;
    }
    
    // Simple regex for email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(finalEmail)) {
        Alert.alert('Sign Up Error', 'Please enter a valid email address.');
        return;
    }

    if (password.length < 6) {
      Alert.alert('Sign Up Error', 'Password must be at least 6 characters long.');
      return;
    }

    console.log('Attempting to sign up with:', { email: finalEmail, password, role }); // Debugging line
    
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        finalEmail,
        password
      );
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDocData: {
        role: UserRole;
        isOnline?: boolean;
        createdAt: ReturnType<typeof serverTimestamp>;
        updatedAt: ReturnType<typeof serverTimestamp>;
      } = {
        role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (role === 'driver') {
        userDocData.isOnline = false;
      }

      await setDoc(userDocRef, userDocData);

      // Navigate to the main app screen after sign-up.
      // The root layout will handle redirecting to the correct screen.
      router.replace('/(tabs)');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Sign Up Failed', error.message);
      } else {
        Alert.alert('Sign Up Failed', 'An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Create Account
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
      <View style={styles.roleContainer}>
        <ThemedText style={styles.roleLabel}>I am a:</ThemedText>
        <View style={styles.roleButtons}>
          <Pressable
            style={[styles.roleButton, role === 'user' && styles.selectedRole]}
            onPress={() => setRole('user')}
          >
            <Text
              style={[
                styles.roleButtonText,
                role === 'user' && styles.selectedRoleText,
              ]}
            >
              User
            </Text>
          </Pressable>
          <Pressable
            style={[styles.roleButton, role === 'driver' && styles.selectedRole]}
            onPress={() => setRole('driver')}
          >
            <Text
              style={[
                styles.roleButtonText,
                role === 'driver' && styles.selectedRoleText,
              ]}
            >
              Driver
            </Text>
          </Pressable>
        </View>
      </View>
      <Pressable
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSignUp}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </Text>
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
  roleContainer: {
    marginBottom: 24,
  },
  roleLabel: {
    fontSize: 16,
    marginBottom: 12,
    color: '#666',
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  selectedRole: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectedRoleText: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#a9a9a9',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
