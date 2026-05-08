import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Platform } from 'react-native';
import { SplashLogoIcon } from '../../../Images/index';
import { whiteColor } from '../../../utility/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Splash = props => {
  // Effect
  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const Userinfo = await AsyncStorage.getItem('userinfo');
      console.log('Userinfo', Userinfo);
      if (Userinfo === null) {
        setTimeout(
          () => {
            props.navigation.navigate('Login');
          },
          Platform.OS === 'ios' ? 100 : 1000,
        );
      } else if (Userinfo?.SLNO !== null || '' || undefined) {
        setTimeout(
          () => {
            props.navigation.navigate('MPinOtp');
          },
          Platform.OS === 'ios' ? 100 : 1000,
        );
      } else {
        setTimeout(
          () => {
            props.navigation.navigate('Login');
          },
          Platform.OS === 'ios' ? 100 : 1000,
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={SplashLogoIcon} style={styles.logo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: whiteColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: 400,
  },
});
export default Splash;
