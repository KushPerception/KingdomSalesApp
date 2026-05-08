import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useRef, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  BottomLogoIcon,
  EyeGreyIcon,
  EyePurpleIcon,
  LoginGradientIcon,
  MailIcon,
  PasswordIcon,
} from '../../../Images/index';
import { loginUser } from '../../../utility/ApiHelpers/StagingApis';
import { W, fonts } from '../../../utility/GlobalStyles';
import {
  darkGreyTextColor,
  lightGreyTextColor,
  whiteColor,
} from '../../../utility/colors';
import Strings from '../../../utility/strings';
import LoaderComponent from '../../CommonComponents/LoaderComponent';
import LoginButton from '../../CommonComponents/LoginButton';

const Login = props => {
  const ResetPin = props.route.params?.ResetPin;

  const input1Ref = useRef(null);
  const input2Ref = useRef(null);

  const [UserName, setUserName] = useState('');
  const [Password, setPassword] = useState('');
  const [ShowPassword, setShowPassword] = useState(true);
  const [UserNameError, setUserNameError] = useState('');
  const [PasswordError, setPasswordError] = useState('');
  const [loading, setloading] = useState(false);

  const ValidateLogin = (uname, pwd) => {
    var isValidate = 0;
    if (uname === '') {
      isValidate -= 1;
      setUserNameError('User Name should not be empty.');
    } else {
      isValidate += 1;
      setUserName(uname);
    }
    if (pwd === '') {
      isValidate -= 1;
      setPasswordError('Password should not be empty.');
    } else {
      isValidate += 1;
      setPassword(pwd);
    }
    if (isValidate === 2) {
      OnClickSignIn();
    }
  };

  const LoginCallback = response => {
    setUserName('');
    setPassword('');
    AsyncStorage.setItem('userinfo', JSON.stringify(response?.user));
    AsyncStorage.setItem('access_token', response?.access_token);
    AsyncStorage.setItem('access_invoices', `${response?.access_invoices}`);
    AsyncStorage.setItem('UserType', response?.user?.USERTYPE);
    AsyncStorage.setItem('password', Password);
    if (ResetPin) {
      props.navigation.navigate('ResetMPIN', {
        UserType: response?.user?.USERTYPE,
      });
    } else {
      props.navigation.navigate('MPinOtp', {
        UserType: response?.user?.USERTYPE,
      });
    }
  };

  const OnClickSignIn = () => {
    setloading(true);
    loginUser({ UserName, Password }, LoginCallback, setloading);
  };

  return (
    <View style={styles.container}>
      <Image source={LoginGradientIcon} style={styles.LogoHeaderImage} />
      <View style={styles.SignInTextView}>
        <Text style={styles.SignText}>{Strings.SIGNIN}</Text>
      </View>

      {loading ? (
        <View style={styles.LoaderContainer}>
          <LoaderComponent />
        </View>
      ) : (
        <View>
          <View style={styles.CenterTopMargin}>
            <View style={styles.TextInputWidth}>
              <View style={styles.inputRow}>
                <Image source={MailIcon} style={styles.ImageIcon} />
                <TextInput
                  ref={input1Ref}
                  style={styles.textInput}
                  placeholder={Strings.UserName}
                  value={UserName}
                  returnKeyType="done"
                  placeholderTextColor={lightGreyTextColor}
                  autoCapitalize="none"
                  onChangeText={t => {
                    setUserName(t);
                    setUserNameError('');
                  }}
                  onSubmitEditing={() => input2Ref.current?.focus()}
                />
              </View>
              {UserNameError !== '' && (
                <Text style={styles.InputErrorText}>{UserNameError}</Text>
              )}
            </View>

            <View style={styles.TextInputWidth}>
              <View style={styles.inputRow}>
                <Image source={PasswordIcon} style={styles.PasswordImageIcon} />
                <TextInput
                  ref={input2Ref}
                  style={styles.textInput}
                  placeholder={Strings.Password}
                  value={Password}
                  placeholderTextColor={lightGreyTextColor}
                  secureTextEntry={ShowPassword}
                  returnKeyType="done"
                  onChangeText={t => {
                    setPassword(t);
                    setPasswordError('');
                  }}
                />
                <TouchableOpacity
                  style={{ marginRight: 10 }}
                  onPress={() => setShowPassword(!ShowPassword)}
                >
                  <Image
                    source={ShowPassword ? EyeGreyIcon : EyePurpleIcon}
                    style={styles.passwordEyeIcon}
                  />
                </TouchableOpacity>
              </View>
              {PasswordError !== '' && (
                <Text style={styles.InputErrorText}>{PasswordError}</Text>
              )}
            </View>
          </View>
          <View style={{ marginTop: 20 }}>
            <LoginButton
              title="Sign In"
              onPress={() => ValidateLogin(UserName, Password)}
            />
          </View>
        </View>
      )}
      <View style={styles.BottomLogoView}>
        <Image
          resizeMode="contain"
          source={BottomLogoIcon}
          style={styles.BottomLogo}
        />
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: whiteColor,
  },
  LoaderContainer: {
    width: '100%',
    height: '70%',
  },
  LogoHeaderImage: {
    width: '100%',
    height: 150,
  },
  SignInTextView: {
    marginTop: -50,
    marginLeft: 40,
  },
  SignText: {
    fontFamily: fonts.Lato_Regular,
    fontSize: 24,
    color: darkGreyTextColor,
  },
  CenterTopMargin: {
    alignItems: 'center',
    marginTop: '25%',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#c0c0c0',
    paddingBottom: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    color: darkGreyTextColor,
    paddingVertical: 6,
  },
  ImageIcon: {
    width: 22,
    height: 18,
    marginRight: 12,
  },
  PasswordImageIcon: {
    width: 22,
    height: 22,
    marginRight: 12,
  },
  passwordEyeIcon: {
    width: 24,
    height: 24,
  },
  BottomLogoView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 40,
  },
  BottomLogo: {
    width: 80,
    height: 80,
  },
  TextInputWidth: {
    width: W(320),
    marginBottom: 16,
  },
  InputErrorText: {
    marginLeft: 35,
    fontSize: 12,
    fontFamily: fonts.Lato_Regular,
    color: 'red',
  },
});
