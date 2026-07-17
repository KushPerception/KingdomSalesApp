import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BottomLogoIcon, LoginGradientIcon } from '../../../Images/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginButton from '../../CommonComponents/LoginButton';
import {
  darkGreyTextColor,
  lightGreyTextColor,
  primaryColor,
  whiteColor,
} from '../../../utility/colors';
import { W, fonts } from '../../../utility/GlobalStyles';
import Strings from '../../../utility/strings';

const MPinOtp = props => {
  const input1 = useRef(null);
  const input2 = useRef(null);
  const input3 = useRef(null);
  const input4 = useRef(null);

  const [digit1, setdigit1] = useState('');
  const [digit2, setdigit2] = useState('');
  const [digit3, setdigit3] = useState('');
  const [digit4, setdigit4] = useState('');
  const [UserAsyncMPin, setUserAsyncMPin] = useState(null);
  const [UserRoleType, setUserRoleType] = useState(null);

  useEffect(() => {
    getAsyncData();
  }, []);

  const getAsyncData = async () => {
    const response = await AsyncStorage.multiGet(['UserMPIN', 'UserType']);
    setUserAsyncMPin(response[0][1]);
    setUserRoleType(response[1][1]);
  };

  const onClickDigit1 = val => {
    setdigit1(val);
    if (val !== '') {
      input2.current?.focus();
    }
  };

  const onClickDigit2 = val => {
    setdigit2(val);
    if (val !== '') {
      input3.current?.focus();
    } else {
      input1.current?.focus();
    }
  };

  const onClickDigit3 = val => {
    setdigit3(val);
    if (val !== '') {
      input4.current?.focus();
    } else {
      input2.current?.focus();
    }
  };

  const onClickDigit4 = val => {
    setdigit4(val);
    if (val === '') {
      input3.current?.focus();
    }
  };

  const OnClickSubmit = (d1, d2, d3, d4) => {
    const MPin = d1 + d2 + d3 + d4;
    // clear fields
    setdigit1('');
    setdigit2('');
    setdigit3('');
    setdigit4('');

    if (
      MPin.length === 4 &&
      (MPin === UserAsyncMPin || UserAsyncMPin === null)
    ) {
      AsyncStorage.setItem('UserMPIN', MPin);
      if (UserRoleType === 'Driver') {
        props.navigation.navigate('DriverOrders');
      } else if (UserRoleType === 'REQUESTER') {
        props.navigation.navigate('MaterialRequestList');
      }
      else if (UserRoleType === 'PURCHASEMANAGER') {
        props.navigation.navigate('PurchaseManager');
      }
      else if (UserRoleType === 'CEO' || UserRoleType === 'MD') {
        props.navigation.navigate('PurchaseOrderScreen',);
      }
      else {
        props.navigation.navigate('Home');
      }
    } else {
      Alert.alert('Invalid MPIN');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={LoginGradientIcon} style={styles.LogoHeaderImage} />
      <View
        style={[styles.SignInTextView, { marginLeft: UserAsyncMPin ? 30 : 40 }]}
      >
        <Text style={styles.SignText}>
          {UserAsyncMPin ? 'Enter MPIN' : Strings.SETMPIN}
        </Text>
      </View>
      <View
        style={{
          marginLeft: UserAsyncMPin ? 30 : 40,
          width: '80%',
          marginTop: 20,
        }}
      >
        <Text style={styles.MessageTextStyle}>
          {UserAsyncMPin ? Strings.EnterPinMessage : Strings.SetPinMessage}
        </Text>
      </View>

      <View style={{ alignItems: 'center', marginTop: 10 }}>
        <View style={styles.TextInPutContainer}>
          {[
            { ref: input1, val: digit1, fn: onClickDigit1 },
            { ref: input2, val: digit2, fn: onClickDigit2 },
            { ref: input3, val: digit3, fn: onClickDigit3 },
            { ref: input4, val: digit4, fn: onClickDigit4 },
          ].map((item, i) => (
            <View key={i} style={styles.TextInputWidth}>
              <TextInput
                ref={item.ref}
                style={styles.pinInput}
                keyboardType="number-pad"
                returnKeyType="done"
                maxLength={1}
                value={item.val}
                onChangeText={item.fn}
                secureTextEntry
                textAlign="center"
              />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.loginButtonMargin}>
        <LoginButton
          title="Next"
          onPress={() => OnClickSubmit(digit1, digit2, digit3, digit4)}
        />
      </View>

      {UserAsyncMPin ? (
        <View style={styles.ResetMPinView}>
          <TouchableOpacity
            onPress={() =>
              props.navigation.navigate('Login', { ResetPin: true })
            }
            style={styles.ResetMPinTouch}
          >
            <Text style={styles.ResetMPinTextStyle}>{Strings.ResetMPin}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: whiteColor },
  LogoHeaderImage: { width: '100%', height: 150 },
  TextInPutContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '75%',
  },
  TextInputWidth: { width: W(50), marginTop: 10 },
  pinInput: {
    fontSize: 40,
    fontFamily: fonts.Lato_Regular,
    color: darkGreyTextColor,
    borderBottomWidth: 2,
    borderBottomColor: primaryColor,
    paddingBottom: 4,
    width: '100%',
  },
  loginButtonMargin: { marginTop: 20 },
  SignInTextView: { marginTop: -50 },
  SignText: { fontFamily: fonts.Lato_Regular, fontSize: 24 },
  MessageTextStyle: {
    color: lightGreyTextColor,
    marginTop: 5,
    fontFamily: fonts.Lato_Regular,
    lineHeight: 24,
  },
  BottomLogoView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 40,
  },
  BottomLogo: { width: 80, height: 80 },
  ResetMPinView: { flexDirection: 'row', justifyContent: 'flex-end' },
  ResetMPinTouch: {
    width: 200,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  ResetMPinTextStyle: { color: 'red', fontFamily: fonts.Lato_Regular },
});

export default MPinOtp;
