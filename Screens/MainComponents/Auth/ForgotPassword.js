import React, { useState } from 'react';
import { Image, StyleSheet, TextInput, View } from 'react-native';
import { AppLogo } from '../../../Images/index';
import LoginButton from '../../CommonComponents/LoginButton';
import { primaryColor } from '../../../utility/colors';
import { W } from '../../../utility/GlobalStyles';

const ForgotPassword = props => {
  const [Email, setEmail] = useState('');

  const OnClickSubmit = () => {
    props.navigation.navigate('ChangePassword');
  };

  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'center', marginTop: '30%' }}>
        <Image source={AppLogo} style={styles.AppLogoImage} />
      </View>
      <View style={styles.TextInPutContainer}>
        <View style={styles.TextInputWidth}>
          <TextInput
            style={styles.textInputStyle}
            placeholder="Email Address"
            placeholderTextColor="#c0c0c0"
            keyboardType="email-address"
            returnKeyType="done"
            autoCapitalize="none"
            value={Email}
            onChangeText={setEmail}
          />
        </View>
        <LoginButton title="SEND" onPress={OnClickSubmit} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  AppLogoImage: { width: 200, height: 200 },
  TextInPutContainer: { width: '100%', alignItems: 'center' },
  TextInputWidth: { width: W(300), marginTop: 10 },
  textInputStyle: {
    width: '100%',
    height: 48,
    borderColor: primaryColor,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 14,
  },
});

export default ForgotPassword;
