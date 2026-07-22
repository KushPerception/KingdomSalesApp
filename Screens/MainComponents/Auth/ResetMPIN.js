import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BottomLogoIcon, LoginGradientIcon } from '../../../Images/index';
import LoginButton from '../../CommonComponents/LoginButton';
import {
  darkGreyTextColor,
  lightGreyTextColor,
  primaryColor,
  RedTextColor,
  veryLightGreyColor,
  whiteColor,
} from '../../../utility/colors';
import { W, fonts } from '../../../utility/GlobalStyles';
import Strings from '../../../utility/strings';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PIN_LENGTH = 4;
const SCREEN_WIDTH = Dimensions.get('window').width;
const CONTAINER_WIDTH = SCREEN_WIDTH * 0.75;
const PIN_GAP = W(16);
const BOX_SIZE = Math.min(
  W(64),
  (CONTAINER_WIDTH - PIN_GAP * (PIN_LENGTH - 1)) / PIN_LENGTH,
);

const ResetMPIN = props => {
  const inputRef = useRef(null);

  const [pin, setPin] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [hasError, setHasError] = useState(false);
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

  const onChangePin = text => {
    setHasError(false);
    setPin(text.replace(/[^0-9]/g, '').slice(0, PIN_LENGTH));
  };

  const OnClickSubmit = MPin => {
    setPin('');

    if (MPin.length === PIN_LENGTH) {
      setHasError(false);
      AsyncStorage.setItem('UserMPIN', MPin);

      const homeScreen =
        UserRoleType === 'Driver'
          ? 'DriverOrders'
          : UserRoleType === 'REQUESTER'
          ? 'MaterialRequestList'
          : UserRoleType === 'PURCHASEMANAGER'
          ? 'PurchaseManager'
          : UserRoleType === 'CEO' || UserRoleType === 'MD'
          ? 'PurchaseOrderScreen'
          : UserRoleType === 'COSTCONTROLLER'
          ? 'CostController'
          : 'Home';

      props.navigation.reset({
        index: 0,
        routes: [{name: homeScreen}],
      });
    } else {
      setHasError(true);
      Alert.alert('Invalid MPIN');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={LoginGradientIcon} style={styles.LogoHeaderImage} />
      <View style={[styles.SignInTextView, { marginLeft: 40 }]}>
        <Text style={styles.SignText}>{Strings.SETMPIN}</Text>
      </View>
      <View style={{ marginLeft: 40, width: '80%', marginTop: 20 }}>
        <Text style={styles.MessageTextStyle}>{Strings.SetPinMessage}</Text>
      </View>

      <View style={{ alignItems: 'center', marginTop: 10 }}>
        <Pressable
          style={styles.TextInPutContainer}
          onPress={() => inputRef.current?.focus()}
        >
          <TextInput
            ref={inputRef}
            value={pin}
            onChangeText={onChangePin}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmitEditing={() => OnClickSubmit(pin)}
            maxLength={PIN_LENGTH}
            keyboardType="number-pad"
            returnKeyType="done"
            autoFocus
            style={styles.hiddenInput}
          />

          {Array.from({ length: PIN_LENGTH }, (_, index) => {
            const char = pin[index] || '';
            const isFilled = !!char;
            const isActive = isFocused && index === pin.length;

            return (
              <View
                key={index}
                pointerEvents="none"
                style={[
                  styles.pinBox,
                  isFilled && styles.pinBoxFilled,
                  isActive && styles.pinBoxActive,
                  hasError && styles.pinBoxError,
                ]}
              >
                <Text style={styles.pinDigit}>{char}</Text>
              </View>
            );
          })}
        </Pressable>
      </View>

      <View style={styles.loginButtonMargin}>
        <LoginButton title="Next" onPress={() => OnClickSubmit(pin)} />
      </View>

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

export default ResetMPIN;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: whiteColor },
  LogoHeaderImage: { width: '100%', height: 150 },
  TextInPutContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '75%',
    gap: PIN_GAP,
  },
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
  },
  pinBox: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: 12,
    backgroundColor: veryLightGreyColor,
    borderWidth: 1,
    borderColor: lightGreyTextColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinBoxFilled: {
    backgroundColor: whiteColor,
    borderColor: primaryColor,
    borderWidth: 2,
  },
  pinBoxActive: {
    backgroundColor: whiteColor,
    borderColor: primaryColor,
    borderWidth: 2,
  },
  pinBoxError: {
    borderColor: RedTextColor,
    borderWidth: 2,
  },
  pinDigit: {
    fontSize: 28,
    fontFamily: fonts.Lato_Bold,
    color: darkGreyTextColor,
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
});
