import React from "react";
import { View, Modal, Text, StyleSheet, ActivityIndicator } from "react-native";
import { primaryColor, BlackColor, modalBackgroundColor, successColor } from "../../utility/colors";
import { useDeviceDimensions } from "../../utility/Dimensions";

const LoaderComponent = (props) => {
  const { isVisible, displayText, onlyLoader } = props;
  const { HEIGHT, WIDTH, isTablet } = useDeviceDimensions();

  if (isVisible !== undefined) {
    return (
      <Modal transparent visible={isVisible}>
        <View style={styles.overlay}>
          {onlyLoader ? (
            <ActivityIndicator color="white" size="large" />
          ) : (
            <View
              style={[
                styles.progressCard,
                { height: HEIGHT / 7, width: isTablet() ? WIDTH / 3.0 : WIDTH / 1.2 },
              ]}
            >
              <View style={styles.progressRow}>
                <ActivityIndicator size="large" color={successColor} />
                <Text style={styles.progressText}>{displayText}</Text>
              </View>
            </View>
          )}
        </View>
      </Modal>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator color={primaryColor} size={35} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  overlay: {
    flex: 1,
    backgroundColor: modalBackgroundColor,
    justifyContent: "center",
    alignItems: "center",
  },
  progressCard: {
    backgroundColor: "rgb(255,255,255)",
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  progressText: {
    marginLeft: 20,
    fontSize: 14,
    color: BlackColor,
  },
});

export default LoaderComponent;
