import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { PurpleColor, primaryColor, whiteColor } from "../../../utility/colors";
import LoaderComponent from "../../CommonComponents/LoaderComponent";
import DriverOrderListCard from "./DriverOrderListCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GetDriverOrdersPagination } from "../../../utility/ApiHelpers/StagingApis";
import { syncTodayDriverOrders } from "../../db/driverOrders/sync";
import NetInfo from "@react-native-community/netinfo";
import { getTodayDriverOrdersList } from "../../db/driverOrders/crud";
import moment from "moment";
import { useFocusEffect } from "@react-navigation/native";

/* driver order list */
const DriverOrderList = (props) => {
  //States
  const [AllOrderList, setAllOrderList] = useState([]);
  const [loading, setloading] = useState(true);

  const [UserToken, setUserToken] = useState("");
  const [Page, setPage] = useState(1);
  const [NextPageUrl, setNextPageUrl] = useState("");
  const [orderCount, setOrderCount] = useState("");
  const [syncOrderCount, setSyncOrderCount] = useState("");
  const [InternetStatus, setInternetStatus] = useState(true);

  //Effect
  useEffect(() => {
    NetInfo.addEventListener((state) => {
      setInternetStatus(state.isConnected);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = props.navigation.addListener("focus", () => {
      // The screen is focused
      // Call any action
      //getData();
      setPage(1);
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [props.navigation]);

  useFocusEffect(
    React.useCallback(() => {
      if (InternetStatus) {
        if (Page === 1) {
          getData();
        }
      } else {
        var orderList = getTodayDriverOrdersList();
        setAllOrderList(orderList);
      }
    }, [Page, InternetStatus])
  );

  const getData = async () => {
    try {
      const UserToken = await AsyncStorage.getItem("access_token");
      setloading(true);
      if (UserToken !== null) {
        setUserToken(UserToken);
        GetAllOrdersList(UserToken, Page);
      }
    } catch (e) {
      console.error(e);
    }
  };

  //Function

  const OrderListCallback = (response) => {
    if (Page === 1) {
      setNextPageUrl(response?.pagination?.next_page_url);
      setAllOrderList(response?.data);
      syncTodayDriverOrders(response?.data);
      setOrderCount(response?.pagination?.total);
      setSyncOrderCount(getTodayDriverOrdersList()?.length);
      console.log("if end time", moment().format("HH:mm:ss"));
    } else {
      setNextPageUrl(response?.pagination?.next_page_url);
      const NewOrderListList = [...AllOrderList, ...response.data];
      setAllOrderList(NewOrderListList);
      syncTodayDriverOrders(NewOrderListList);
      setOrderCount(response?.pagination?.total);
      setSyncOrderCount(getTodayDriverOrdersList()?.length);
      console.log("else start time", moment().format("HH:mm:ss"));
    }
  };

  const GetAllOrdersList = async (UserToken, Page) => {
    setPage(Page + 1);
    let OrderObject = {
      UserToken: UserToken,
      page: Page,
    };
    console.log("start time", moment().format("HH:mm:ss"));
    GetDriverOrdersPagination(
      OrderObject,
      OrderListCallback,
      setloading,
      "today"
    );
  };

  const OnReachEnd = async () => {
    InternetStatus && GetAllOrdersList(UserToken, Page);
  };

  const OnRefreshList = () => {
    setPage(1);
  };

  //Render
  const RenderOrderData = ({ item, index }) => {
    if (moment(item?.DELIVERYDATE).format("LL") === moment().format("LL")) {
      return (
        <DriverOrderListCard
          OrderListItem={item}
          UserToken={UserToken}
          GetDataCallFunc={() => OnRefreshList()}
        />
      );
    }
  };

  const RenderOrderListEmpty = ({ item, index }) => {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No Data Found!</Text>
      </View>
    );
  };

  const RenderFootorComponent = () => {
    return (
      <View style={styles.footer}>
        {!InternetStatus || NextPageUrl === null ? (
          false
        ) : (
          <ActivityIndicator size={25} color={PurpleColor} />
        )}
      </View>
    );
  };

  return (
    <React.Fragment>
      <View style={styles.container}>
        {loading ? (
          <LoaderComponent />
        ) : (
          <View style={styles.container}>
            <View
              style={[styles.container, { marginBottom: 20, marginTop: 5 }]}
            >
              {InternetStatus && orderCount !== "" ? (
                <Text
                  style={styles.textContainer}
                >{`${syncOrderCount} today\'s order(s) are synced out of ${orderCount}`}</Text>
              ) : getTodayDriverOrdersList()?.length > 0 ? (
                <Text style={styles.textContainer}>{`${
                  getTodayDriverOrdersList()?.length
                } today\'s order(s) are cached offline`}</Text>
              ) : (
                <></>
              )}
              <FlatList
                data={AllOrderList}
                keyExtractor={(item, index) => index + ""}
                extraData={AllOrderList}
                refreshControl={
                  <RefreshControl
                    refreshing={loading}
                    onRefresh={() => OnRefreshList()}
                  />
                }
                ListFooterComponent={RenderFootorComponent}
                onEndReached={() =>
                  NextPageUrl === null ? false : OnReachEnd()
                }
                onEndReachedThreshold={1}
                removeClippedSubviews={true}
                ListEmptyComponent={RenderOrderListEmpty}
                renderItem={RenderOrderData}
              />
            </View>
          </View>
        )}
      </View>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footer: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  textContainer: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: "center",
    backgroundColor: primaryColor,
    borderRadius: 13,
    color: whiteColor,
  },
});

export default DriverOrderList;
