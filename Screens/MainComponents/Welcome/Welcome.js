import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { primaryColor, whiteColor, yellowColor } from '../../../utility/colors';
import { AppLogo } from '../../../Images/index';
import LoginButton from '../../CommonComponents/LoginButton';
import { fonts } from '../../../utility/GlobalStyles';

const Welcome = props => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={AppLogo} style={styles.logo} />
      </View>
      <View style={{ marginTop: '50%' }}>
        <LoginButton
          title="SIGN IN AS SALES PERSON"
          BgColor={primaryColor}
          onPress={() =>
            props.navigation.navigate('Login', { Role: 'SalesPerson' })
          }
        />
        <Text
          style={{
            marginTop: 10,
            marginBottom: 10,
            textAlign: 'center',
            fontFamily: fonts.Font_Medium,
            fontSize: 18,
          }}
        >
          OR
        </Text>
        <LoginButton
          title="SIGN IN AS DRIVER"
          BgColor={yellowColor}
          onPress={() => props.navigation.navigate('Login', { Role: 'Driver' })}
        />
      </View>
    </View>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: whiteColor,
  },
  logo: {
    width: 150,
    height: 150,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: '40%',
  },
});
