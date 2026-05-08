import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { primaryColor, whiteColor } from "../../utility/colors";
import { W, H, fonts } from "../../utility/GlobalStyles";

const { width, height } = Dimensions.get("window");

const LoginButton = (props) => {
  //Props
  const { title, onPress, fullWidth, BgColor, small } = props;

  return fullWidth ? (
    <TouchableOpacity
      style={[
        styles.fullWidthButtonStyle,
        { backgroundColor: BgColor ? BgColor : primaryColor },
        // styles.ButtonStyle,
      ]}
      onPress={onPress}
    >
      <Text style={styles.TitleText}>{title}</Text>
    </TouchableOpacity>
  ) : (
    <View style={styles.ButtonView}>
      <TouchableOpacity
        style={[
          styles.ButtonStyle,
          ,
          {
            backgroundColor: BgColor ? BgColor : primaryColor,
            width: small ? W(80) : W(280),
            height: small ? 30 : 60,
          },
        ]}
        onPress={onPress}
      >
        <Text style={[styles.TitleText, { fontSize: small ? 14 : 18 }]}>
          {title}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  ButtonStyle: {
    width: W(280),
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  TitleText: {
    color: whiteColor,
    fontFamily: fonts.Lato_Regular,
    fontSize: 18,
  },
  ButtonView: {
    alignItems: "center",
    marginTop: 10,
  },
  fullWidthButtonStyle: {
    width: "100%",
    height: 48,
    backgroundColor: primaryColor,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
});
export default LoginButton;
