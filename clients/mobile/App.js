import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import Login from './src/screens/Login';
import Dashboard from './src/screens/Dashboard';
import AppShell from './src/components/AppShell';

const Stack = createNativeStackNavigator();

const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';

function MainStack() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#a1a1aa" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0f0f12' } }}
    >
      {!user ? (
        <Stack.Screen name="Login" component={Login} />
      ) : (
        <Stack.Screen name="Main">
          {() => (
            <AppShell>
              <Dashboard />
            </AppShell>
          )}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0f0f12',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function App() {
  useEffect(() => {
    if (GOOGLE_WEB_CLIENT_ID) {
      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
      });
    }
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <MainStack />
      </NavigationContainer>
    </AuthProvider>
  );
}
