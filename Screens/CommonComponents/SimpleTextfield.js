import React, { forwardRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { PurpleColor } from '../../utility/colors';
import { W } from '../../utility/GlobalStyles';

// Replaces react-native-material-textfield TextField.
// Preserves the same prop surface used across screens.
const SimpleTextfield = forwardRef((props, ref) => {
  const {
    placeholder,
    value,
    onChangeText,
    keyboardType,
    editable = true,
    secureTextEntry,
    baseColor,
    fontSize,
    placeholderTextColor,
    autoCapitalize,
    maxLength,
  } = props;

  return (
    <View style={styles.TextInPutContainer}>
      <View style={styles.TextInputWidth}>
        <TextInput
          ref={ref}
          style={[
            styles.input,
            {
              fontSize: fontSize || 16,
              color: baseColor || '#333333',
              borderBottomColor: PurpleColor,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor || '#c0c0c0'}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize || 'none'}
          editable={editable}
          secureTextEntry={secureTextEntry || false}
          maxLength={maxLength}
          returnKeyType="done"
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  TextInPutContainer: {
    width: '100%',
    alignItems: 'center',
  },
  TextInputWidth: {
    width: W(320),
  },
  input: {
    paddingLeft: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    width: '100%',
  },
});

export default SimpleTextfield;
