import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { fonts } from "../../../utility/GlobalStyles";
import Card from "../../CommonComponents/Card";
import {
  darkGreyTextColor,
  lightGreyTextColor,
  RedTextColor,
} from "../../../utility/colors";
import { useNavigation } from "@react-navigation/native";
const moment = require("moment");

const { width } = Dimensions.get("window");

/* driver order list item component */
const DriverOrderListCard = (props) => {
  let { OrderListItem } = props;

  const navigation = useNavigation();

  return (
    <View style={{ alignItems: "center" }}>
      <Card
        onPress={() =>
          navigation.navigate("OrderHtmlInvoice", {
            OrderListItem: OrderListItem,
            AvoidGetData: true,
          })
        }
        style={styles.CardStyle}
      >
        <Text style={styles.PhoneNoTextStyle}>{OrderListItem?.CUSTPHONE}</Text>
        <View style={styles.CustomerNameWidth}>
          <Text numberOfLines={1} style={styles.CustomerNameText}>
            {OrderListItem?.CUSTNAME}
          </Text>
          <Text numberOfLines={1} style={styles.SiteTextStyle}>
            {OrderListItem?.SITENAME}
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 10,
            }}
          >
            <View>
              {/* <Text numberOfLines={1} style={styles.DivisionNoTextStyle}> */}
              <Text style={styles.PhoneNoTextStyle}>Delivery No.</Text>
              <Text style={styles.OrderTypeDateStyle}>
                {OrderListItem?.DELIVERYNO}
              </Text>
              {/* </Text> */}
            </View>
            <View>
              <Text style={styles.PhoneNoTextStyle}>Status</Text>
              <Text style={styles.OrderTypeDateStyle}>
                {OrderListItem?.SIGNED === "1" ? "Delivered" : "Not Delivered"}
              </Text>
              {/* </Text> */}
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <View style={styles.Divisioncolomnstyle}>
            <Text style={styles.PhoneNoTextStyle}>Division</Text>
            <Text style={styles.OrderTypeDateStyle}>
              {OrderListItem?.DIVISION}
            </Text>
          </View>
          <View style={styles.Deliverydatecolomnstyle}>
            <Text style={styles.PhoneNoTextStyle}>Delivery Date</Text>
            <Text style={styles.OrderTypeDateStyle}>
              {" "}
              {moment(OrderListItem?.DELIVERYDATE).format("LL")}
            </Text>
          </View>
          <View style={styles.TruckNocolomnstyle}>
            <Text style={styles.PhoneNoTextStyle}>Truck No.</Text>
            <Text style={styles.OrderTypeDateStyle}>
              {OrderListItem?.TRUCKNO}
            </Text>
          </View>
        </View>
        <View style={{ marginBottom: 10 }} />
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  CardStyle: {
    width: width - 20,
    marginTop: 5,
    paddingLeft: 10,
    paddingTop: 20,
  },
  PhoneNoTextStyle: {
    color: lightGreyTextColor,
    fontFamily: fonts.Lato_Regular,
    fontSize: 12,
  },
  CustomerNameText: {
    color: RedTextColor,
    marginTop: 7,
    fontSize: 16,
    fontFamily: fonts.Lato_Bold,
    marginBottom: 5,
  },
  SiteTextStyle: {
    color: darkGreyTextColor,
    fontFamily: fonts.Lato_Regular,
    marginTop: 5,
  },
  OrderTypeRowStyle: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  OrderTypeDateStyle: {
    color: darkGreyTextColor,
    fontFamily: fonts.Lato_Regular,
    fontSize: 16,
    marginTop: 5,
  },
  CustomerNameWidth: {
    width: "90%",
  },
  DivisionNoTextStyle: {
    color: lightGreyTextColor,
    marginTop: 7,
  },
  Divisioncolomnstyle: {
    flexDirection: "column",
    width: "25%",
  },
  Deliverydatecolomnstyle: {
    flexDirection: "column",
    width: "35%",
    marginLeft: 20,
  },
  TruckNocolomnstyle: {
    flexDirection: "column",
    width: "30%",
    marginLeft: 10,
  },
});

export default DriverOrderListCard;
