import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './src/navigation/navigationRef';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AppHeader from './src/components/AppHeader';
import Landing from './src/screens/Landing';
import Login from './src/screens/Login';
import Home from './src/screens/Home';
import Settings from './src/screens/Settings';
import JoinGroup from './src/screens/JoinGroup';
import CreateGroup from './src/screens/CreateGroup';
import GroupScreen from './src/screens/GroupScreen';
import EventScreen from './src/screens/EventScreen';
import { theme } from './src/theme';
import { usePushNotifications } from './src/hooks/usePushNotifications';

const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';

const linking = {
  prefixes: [Linking.createURL('/'), 'schedulite://'],
  config: {
    screens: {
      Home: '',
      Event: 'event/:eventId',
    },
  },
};

function LoadingView() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={theme.accent} />
    </View>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      initialRouteName="Landing"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.bg },
      }}
    >
      <AuthStack.Screen name="Landing" component={Landing} />
      <AuthStack.Screen name="Login" component={Login} />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <AppStack.Navigator
      initialRouteName="Home"
      screenOptions={{
        header: (props) => <AppHeader {...props} />,
        contentStyle: { backgroundColor: theme.bg },
      }}
    >
      <AppStack.Screen name="Home" component={Home} />
      <AppStack.Screen name="Settings" component={Settings} />
      <AppStack.Screen name="JoinGroup" component={JoinGroup} />
      <AppStack.Screen name="CreateGroup" component={CreateGroup} />
      <AppStack.Screen name="Group" component={GroupScreen} />
      <AppStack.Screen name="Event" component={EventScreen} />
    </AppStack.Navigator>
  );
}

function Root() {
  const { user, loading } = useAuth();
  usePushNotifications(user);
  if (loading) return <LoadingView />;
  return user ? <AppNavigator /> : <AuthNavigator />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: theme.bg,
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
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer ref={navigationRef}>
          <StatusBar style="dark" />
          <Root />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
