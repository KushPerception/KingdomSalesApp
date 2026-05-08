// Universal Button Component
import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { lightTextColor, primaryColor } from "../../utility/colors";
import { useDeviceDimensions } from "../../utility/Dimensions";

const Button = (props) => {
  //Props
  const { title, buttonContainer, textStyle, onPress, disabled } = props;

  //Hook
  const { HEIGHT, WIDTH } = useDeviceDimensions();

  //Styles
  const styles = StyleSheet.create({
    container: {
      height: HEIGHT / 16,
      width: WIDTH / 4.5,
      borderRadius: 2,
      backgroundColor: primaryColor,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      marginHorizontal: WIDTH / 7,
      padding: 5,
    },
    text: {
      color: lightTextColor,
      fontSize: 14,
      textAlign: "center",
      fontWeight: "normal",
    },
  });

  return (
    <TouchableOpacity
      key={title}
      style={[styles.container, { ...buttonContainer }]}
      activeOpacity={0.5}
      onPress={onPress && !disabled ? onPress : null}
    >
      <Text numberOfLines={2} style={[styles.text, { ...textStyle }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;
