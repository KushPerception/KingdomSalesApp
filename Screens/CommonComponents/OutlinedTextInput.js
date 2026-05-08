import React from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import {W, H} from '../../utility/GlobalStyles';
import {primaryColor} from '../../utility/colors';

// Replaces react-native-material-textfield OutlinedTextField.
// Preserves the same prop surface used across screens.
const OutlinedTextInput = props => {
  const {
    label,
    value,
    onChangeText,
    MultilineLarge,
    keyboardType,
    editable = true,
    secureTextEntry,
  } = props;

  if (MultilineLarge) {
    return (
      <View style={styles.TextInPutContainer}>
        <View style={styles.TextInputWidth}>
          <TextInput
            style={[styles.addressInputStyle, {borderColor: primaryColor}]}
            placeholder={label}
            placeholderTextColor="#c0c0c0"
            autoCapitalize="words"
            fontSize={14}
            multiline
            value={value}
            onChangeText={onChangeText}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.TextInPutContainer}>
      <View style={styles.TextInputWidth}>
        <TextInput
          style={[styles.singleInputStyle, {borderColor: primaryColor}]}
          placeholder={label}
          placeholderTextColor="#c0c0c0"
          autoCapitalize="words"
          keyboardType={keyboardType}
          returnKeyType="done"
          fontSize={14}
          editable={editable}
          secureTextEntry={secureTextEntry || false}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  TextInPutContainer: {
    width: '100%',
    alignItems: 'center',
  },
  TextInputWidth: {
    width: W(340),
    marginTop: 10,
  },
  singleInputStyle: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#333',
  },
  addressInputStyle: {
    width: W(340),
    height: H(120),
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingTop: 10,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
  },
});

export default OutlinedTextInput;
