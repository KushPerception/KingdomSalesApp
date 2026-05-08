import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import OutlinedTextInput from '../../CommonComponents/OutlinedTextInput';
import { AppLogo } from '../../../Images/index';
import LoginButton from '../../CommonComponents/LoginButton';
import { primaryColor } from '../../../utility/colors';

const ChangePassword = props => {
  const [TemporaryPassword, setTemporaryPassword] = useState('');
  const [NewPassword, setNewPassword] = useState('');
  const [ConfirmPassword, setConfirmPassword] = useState('');
  const [HideTempPassword, setHideTempPassword] = useState(true);
  const [HideNewPassword, setHideNewPassword] = useState(true);
  const [HideConfirmPassword, setHideConfirmPassword] = useState(true);

  return (
    <View style={styles.container}>
      <View>
        <View style={{ alignItems: 'center', marginTop: '30%' }}>
          <Image source={AppLogo} style={styles.AppLogoImage} />
        </View>
        <OutlinedTextInput
          label="Temporary Password"
          secureTextEntry={HideTempPassword}
          value={TemporaryPassword}
          onChangeText={() => setHideTempPassword(TemporaryPassword)}
        />

        <OutlinedTextInput
          label="New Password"
          secureTextEntry={HideNewPassword}
          value={NewPassword}
          onChangeText={() => setNewPassword(NewPassword)}
        />
        <OutlinedTextInput
          label="Confirm Password"
          secureTextEntry={HideConfirmPassword}
          value={ConfirmPassword}
          onChangeText={() => setConfirmPassword(ConfirmPassword)}
        />
      </View>
      <LoginButton
        title="SUBMIT"
        onPress={() => props.navigation.navigate('MPinOtp')}
      />
    </View>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  AppLogoImage: {
    width: 200,
    height: 200,
  },
  ForgotPasswordText: {
    color: primaryColor,
    fontSize: 16,
  },
});
