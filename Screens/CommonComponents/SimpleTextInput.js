import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import {
  lightGreyTextColor,
  saperatorColor,
  whiteColor,
} from '../../utility/colors';
import { W, H } from '../../utility/GlobalStyles';
const SimpleTextInput = props => {
  let {
    placeholder,
    onChangeText,
    value,
    fontSize,
    keyboardType,
    editable = true,
  } = props;
  return (
    <View style={{ alignItems: 'center' }}>
      <TextInput
        style={styles.TextInputWidth}
        placeholder={placeholder}
        placeholderTextColor={lightGreyTextColor}
        editable={editable}
        value={value}
        keyboardType={keyboardType ? keyboardType : 'default'}
        returnKeyType="done"
        fontSize={fontSize ? fontSize : 14}
        onChangeText={onChangeText}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  TextInputWidth: {
    width: W(320),
    borderWidth: 0.5,
    borderColor: whiteColor,
    borderBottomColor: lightGreyTextColor,
    paddingBottom: 10,
    paddingLeft: 10,
    marginTop: 30,
    color: lightGreyTextColor,
  },
});
export default SimpleTextInput;
