import React, { useEffect } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { ReactNativeSplashScreen as SplashScreen } from '@onekeyfe/react-native-splash-screen';
import crashlytics from '@react-native-firebase/crashlytics';
import AppNavigation from './Navigation/AppNavigation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const App = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    crashlytics().log('App mounted.');
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="dark-content"
        />
        <AppNavigation />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
