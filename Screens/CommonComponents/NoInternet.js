import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { whiteColor } from "../../utility/colors";
const NoInternet = () => {
  return (
    <View style={styles.container}>
      <Text>No Internet Connection</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: whiteColor,
    justifyContent: "center",
    alignItems: "center",
  },
});
export default NoInternet;
