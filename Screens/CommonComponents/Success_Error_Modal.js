import React from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";
import {
  BlackColor,
  lightTextColor,
  modalBackgroundColor,
  redColor,
  successColor,
  whiteColor,
} from "../../utility/colors";
import { useDeviceDimensions } from "../../utility/Dimensions";
import { fonts } from "../../utility/GlobalStyles";

const SuccessErrorModal = (props) => {
  //Props
  const { visible, setVisible, modalText, onButtonPress } = props;
  //Hook
  const { HEIGHT, WIDTH, isTablet } = useDeviceDimensions();
  //Styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: modalBackgroundColor,
      justifyContent: "center",
      alignItems: "center",
    },
    card: {
      height: HEIGHT / 3.8,
      width: isTablet() ? WIDTH / 2.5 : WIDTH / 1.2,
      backgroundColor: lightTextColor,
      borderRadius: 5,
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      fontSize: HEIGHT / 40,
      textAlign: "center",
      marginVertical: 12,
      marginHorizontal: 20,
      color: BlackColor,
    },
    iconStyle: {
      alignSelf: "center",
    },
    button: {
      backgroundColor: modalText?.type === "error" ? redColor : successColor,
      height: HEIGHT / 20,
      width: WIDTH / 2,
      marginVertical: 10,
      justifyContent: "center",
    },
  });
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}> {modalText.text}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setVisible(false);
              onButtonPress ? onButtonPress() : null;
            }}
          >
            <Text
              style={{
                color: whiteColor,
                fontFamily: fonts.Font_Medium,
                fontSize: 16,
                textAlign: "center",
              }}
            >
              {modalText.type === "error" ? "Try Again" : "Ok"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SuccessErrorModal;
