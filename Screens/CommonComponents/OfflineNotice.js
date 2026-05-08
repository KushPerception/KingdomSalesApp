import React from "react";
import { View, Text, StyleSheet, Modal, Keyboard } from "react-native";

import NetInfo from "@react-native-community/netinfo";
import { useDeviceDimensions } from "../../utility/Dimensions";
import { successColor } from "../../utility/colors";
import Button from "./Button";

const OfflineNotice = (props) => {
  //Props
  const { isConnected, setIsConnected } = props;

  //Device Dimensions
  const { HEIGHT, WIDTH } = useDeviceDimensions();

  const styles = StyleSheet.create({
    pageContainer: {
      flex: 1,
      backgroundColor: "rgba(51,51,51,0.6)",
      justifyContent: "center",
      alignItems: "center",
    },
    addNoteModalContainer: {
      flexDirection: "column",
      width: "90%",
      backgroundColor: "rgb(255,255,255)",
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.8,
      shadowRadius: 1,
      alignSelf: "center",
      justifyContent: "center",
      margin: 20,
    },
    modelnoteAddNoteBtn: {
      backgroundColor: successColor,
      height: HEIGHT / 16,
      width: WIDTH / 4.2,
      marginVertical: 0,
      borderRadius: 0,
      marginHorizontal: 0,
      alignSelf: "center",
      marginTop: 40,
      marginBottom: 40,
    },
    txtRed: {
      color: "red",
      fontSize: 20,
      marginTop: 40,
      textAlign: "center",
    },
  });

  if (!isConnected) {
    return (
      <Modal
        visible={!isConnected}
        transparent={true}
        animationType="slide"
        supportedOrientations="landscape"
      >
        <View style={styles.pageContainer}>
          <View style={styles.addNoteModalContainer}>
            <Text style={styles.txtRed}>
              {"Network Error. "}
              <Text style={{ color: "grey" }}>
                {"Please check your internet connection."}
              </Text>
            </Text>
            <Button
              title={"try again"}
              buttonContainer={styles.modelnoteAddNoteBtn}
              textStyle={{ fontSize: 15 }}
              onPress={() => {
                NetInfo.addEventListener((state) => {
                  if (state.isConnected === true) {
                    setIsConnected(true);
                  } else {
                    setIsConnected(false);
                  }
                  Keyboard.dismiss();
                });
              }}
            />
          </View>
        </View>
      </Modal>
    );
  }
  return null;
};

export default OfflineNotice;
