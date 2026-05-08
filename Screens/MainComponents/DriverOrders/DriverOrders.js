// DriverOrders.js
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { BlackColor, whiteColor } from "../../../utility/colors";
import DriverOrderList from "./DriverOrderList";
import DriverOrdersPastList from "./DriverOrdersPastList";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import HeaderComponent from "../../CommonComponents/Header";
import {
  logoutUser,
  SyncSendOrderSignature,
} from "../../../utility/ApiHelpers/StagingApis";
import NetInfo from "@react-native-community/netinfo";
import { getSettledDriverOrders } from "../../db/driverOrders/crud";
import SuccessErrorModal from "../../CommonComponents/Success_Error_Modal";
import LoaderComponent from "../../CommonComponents/LoaderComponent";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const DriverOrders = (props) => {
  const { navigation } = props;

  const Tab = createMaterialTopTabNavigator();
  const [InternetStatus, setInternetStatus] = useState(true);
  const [UserToken, setUserToken] = useState("");
  const [syncloading, setSyncloading] = useState(false);
  const [modalText, setModalText] = useState({
    type: "error",
    text: "Sync Failed",
  });
  const [successErrorModal, setSuccessErrorModal] = useState(false);

  //Effect
  useEffect(() => {
    NetInfo.addEventListener((state) => {
      // console.log('Connection type', state.type);
      console.log("Is connected?", state.isConnected);
      setInternetStatus(state.isConnected);
    });
  }, []);
  const styles = StyleSheet.create({
    container: { flex: 1 },
  });

  useFocusEffect(
    React.useCallback(() => {
      if (InternetStatus) {
        getData();
      }
    }, [])
  );

  //Function
  const getData = async () => {
    try {
      const UserToken = await AsyncStorage.getItem("access_token");
      if (UserToken !== null) {
        setUserToken(UserToken);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const LogoutCallback = async (response) => {
    await AsyncStorage.removeItem("UserMPIN");
    await AsyncStorage.removeItem("userinfo");
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("UserType");
    await AsyncStorage.removeItem("password");
    await AsyncStorage.getAllKeys().then((keys) =>
      AsyncStorage.multiRemove(keys)
    );
    props.navigation.navigate("Login");
  };

  const OnClickLogout = () => {
    Alert.alert("Hold on!", "Are you sure you want to Logout from App?", [
      {
        text: "Cancel",
        onPress: () => null,
        style: "cancel",
      },
      {
        text: "YES",
        onPress: () => InternetStatus && logoutUser(UserToken, LogoutCallback),
      },
    ]);
  };

  const onSyncOrder = () => {
    setSyncloading(true);
    let settledDriverOrders = getSettledDriverOrders();
    settledDriverOrders.forEach((item) => {
      SyncSendOrderSignature(item, setSuccessErrorModal, setModalText);
    });
    setSyncloading(false);
    setSuccessErrorModal(true);
    setModalText({ type: "success", text: "Sync Successful" });
  };

  const onSyncPress = () => {
    let settledDriverOrders = getSettledDriverOrders().length;
    Alert.alert(
      "SYNC!",
      `There are ${settledDriverOrders} unsynced signatures in this device. Do you want to sync them on server?`,
      [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel",
        },
        {
          text: "YES",
          onPress: () => (settledDriverOrders > 0 ? onSyncOrder() : null),
        },
      ]
    );
  };
  return (
    <View style={styles.container}>
      <HeaderComponent
        DriverHomeHeader={true}
        Title={"Orders To Deliver"}
        onPressRight={OnClickLogout}
        onSyncPress={onSyncPress}
        sync={true}
        InternetStatus={InternetStatus}
      />
      {successErrorModal && (
        <SuccessErrorModal
          visible={successErrorModal}
          setVisible={setSuccessErrorModal}
          modalText={modalText}
        />
      )}
      {syncloading && (
        <LoaderComponent
          isVisible={syncloading}
          displayText={"Sync in progress..."}
        />
      )}
      <Tab.Navigator
        initialRouteName="DriverOrderList"
        screenOptions={{
          tabBarLabelStyle: {
            fontSize: 14,
            color: BlackColor,
            fontWeight: "bold",
          },
          tabBarStyle: { backgroundColor: whiteColor },
        }}
      >
        <Tab.Screen
          name="DriverOrderList"
          component={DriverOrderList}
          options={{ tabBarLabel: "Today" }}
        />
        <Tab.Screen
          name="DriverOrdersPastList"
          component={DriverOrdersPastList}
          options={{ tabBarLabel: "Past" }}
        />
      </Tab.Navigator>
    </View>
  );
};

export default DriverOrders;
