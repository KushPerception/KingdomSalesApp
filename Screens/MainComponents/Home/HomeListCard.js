import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { W, H, fonts } from "../../../utility/GlobalStyles";
import Card from "../../CommonComponents/Card";
import {
  BlackColor,
  darkGreyTextColor,
  lightGreyTextColor,
  RedTextColor,
  whiteColor,
} from "../../../utility/colors";
import { useNavigation } from "@react-navigation/native";
import { DeleteIcon, PrintIcon } from "../../../Images/index";
import { DeleteOrder, DeleteOrderToServer } from "../../../utility/ApiHelpers/StagingApis";
import Strings from "../../../utility/strings";
const moment = require("moment");
import { formatPrice } from "../../../utility/helpers";
import SimpleCenterAlignModal from "../../CommonComponents/SimpleCenterAlignModal";
import SaveButton from "../../CommonComponents/SaveButton";

const { width, height } = Dimensions.get("window");

const HomeListCard = (props) => {
  const navigation = useNavigation();
  const simplemodal = useRef();

  let { OrderListItem, UserToken, GetDataCallFunc } = props;

  //State
  const [TimeUpMessage, setTimeUpMessage] = useState("");
  const [TodayDate, setTodayDate] = useState(new Date());
  const [ScheduleDateTime, setScheduleDateTime] = useState(new Date());
  const [DeleteRemark, setDeleteRemark] = useState("");
  //Function

  useEffect(() => {
    let ScheduleDateTime =
      OrderListItem?.SCHEDULEDATE + "T" + OrderListItem?.SCHEDULETIME;
    let todayDate = moment().format();
    let MomentTime = moment(ScheduleDateTime).format();
    setTodayDate(todayDate);
    setScheduleDateTime(MomentTime);
  }, []);

  const OnClickOrderCard = (OrderListItem) => {
    if (OrderListItem?.POSTED == 1) {
      navigation.navigate("UpdateOrders", {
        OrderListItem,
        UpdateProduct: false,
        isSubmitted: OrderListItem?.SUBMITTED,
      });
      setTimeUpMessage(Strings.TimeUpMessage);
    } else {
      navigation.navigate("UpdateOrders", {
        OrderListItem,
        UpdateProduct: true,
        isSubmitted: OrderListItem?.SUBMITTED,
      });
    }
  };

  const OnClickDeleteIcon = (SLNO) => {
    Alert.alert("Hold on!", "Are you sure you want to Delete the Order?", [
      {
        text: "Cancel",
        onPress: () => null,
        style: "cancel",
      },
      {
        text: "YES",
        onPress: () => DeleteOrderToServer(SLNO, UserToken, () => {
          GetDataCallFunc()
        }),
      },
    ]);

    // simplemodal.current?.show();
  };

  const OnChangeDeleteRemark = (DeleteRemark) => {
    setDeleteRemark(DeleteRemark);
  };

  const OnClickDeleteText = async (SLNO, DeleteRemark) => {
    await simplemodal.current?.close();

    await DeleteOrder(SLNO, DeleteRemark, UserToken, GetDataCallFunc);
  };

  return (
    <View>
      <Card
        onPress={() => OnClickOrderCard(OrderListItem)}
        style={styles.CardStyle}
      >
        <Text style={styles.PhoneNoTextStyle}>{OrderListItem?.PHONENO}</Text>

        <View style={styles.CustomerNameWidth}>
          <Text numberOfLines={1} style={styles.CustomerNameText}>
            {OrderListItem?.CUSTNAME}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingRight: "30%",
          }}
        >
          <Text style={styles.SiteTextStyle}>
            {(OrderListItem?.DIVISION)?.toUpperCase()}
          </Text>
          {/* <Text style={styles.CostTextStyle}>COST</Text> */}
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingRight: "14%",
          }}
        >
          <Text
            style={[styles.SiteTextStyle, { marginTop: 10, width: width / 2 }]}
          >
            {OrderListItem?.SITENAME}
          </Text>

          {/* <View style={{ width: "30%" }}>
            {OrderListItem?.Rate === null ? (
              <View>
                <Text style={{ marginTop: 10 }}>---</Text>
              </View>
            ) : (
              <Text style={[styles.SiteTextStyle, { marginTop: 10 }]}>
                {formatPrice(OrderListItem?.Rate)}
              </Text>
            )}
          </View> */}
        </View>

        <View style={{ flexDirection: "row", marginTop: 10, flexWrap: "wrap" }}>
          <View style={styles.orderDetailColumn}>
            <Text style={styles.PhoneNoTextStyle}>Order Type</Text>
            <Text style={styles.OrderTypeDateStyle}>
              {OrderListItem?.ORDERTYPE}
            </Text>
          </View>
          <View style={styles.orderDetailColumn}>
            <Text style={styles.PhoneNoTextStyle}>Order Date</Text>
            <Text style={styles.OrderTypeDateStyle}>
              {" "}
              {moment(OrderListItem?.ORDERDATE).format("ll")}
            </Text>
          </View>
          <View style={styles.orderDetailColumn}>
            {/* <Text style={styles.PhoneNoTextStyle}>ERP Order No</Text>
            <Text style={styles.OrderTypeDateStyle}>
              {OrderListItem?.ERPOrderNo ? OrderListItem?.ERPOrderNo : "-"}
            </Text> */}
          </View>
          <View style={styles.orderDetailColumn}>
            <Text style={styles.PhoneNoTextStyle}>SubTotal</Text>
            <Text style={styles.OrderTypeDateStyle}>
              {formatPrice(OrderListItem?.SUBTOTAL)}
            </Text>
          </View>
          <View style={styles.orderDetailColumn}>
            <Text style={styles.PhoneNoTextStyle}>VAT</Text>
            <Text style={styles.OrderTypeDateStyle}>
              {formatPrice(OrderListItem?.VATAMOUNT)}
            </Text>
          </View>
          <View style={styles.orderDetailColumn}>
            <Text style={styles.PhoneNoTextStyle}>TOTAL</Text>
            <Text style={styles.OrderTypeDateStyle}>
              {formatPrice(OrderListItem?.TOTAL)}
            </Text>
          </View>
        </View>
        {OrderListItem?.CANPRINT == false ? (
          false
        ) : (
          <View style={{ position: "absolute", right: 50, top: 20 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("OrderHtmlInvoiceSales", { OrderId: OrderListItem.SLNO, OrderType: OrderListItem.ORDERTYPE })}
              style={{ width: 40, padding: 10 }}
            >
              <Image
                resizeMode={"contain"}
                source={PrintIcon}
                style={{ width: 18, height: 18 }}
              />
            </TouchableOpacity>
          </View>
        )}
        {OrderListItem?.CANDELETE == false ? (
          false
        ) : (
          <View style={{ position: "absolute", right: 20, top: 20 }}>
            <TouchableOpacity
              onPress={() => OnClickDeleteIcon(OrderListItem?.SLNO)}
              style={{ width: 40, padding: 10 }}
            >
              <Image
                resizeMode={"contain"}
                source={DeleteIcon}
                style={{ width: 18, height: 18 }}
              />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ marginBottom: 10 }} />
      </Card>
      <SimpleCenterAlignModal
        ref={simplemodal}
        onRequestClose={() => simplemodal.current?.close()}
        // height={200} //As per need
        width={"96%"}
      >
        <View>
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <Text style={styles.DeleteRemarkTitle}>
              {Strings.DeleteOrderRemark}
            </Text>

            <View style={styles.TextInputWidth}>
              <TextInput
                style={{ color: BlackColor }}
                placeholder="Remark"
                placeholderTextColor={lightGreyTextColor}
                value={DeleteRemark}
                returnKeyLabel={"Done"}
                returnKeyType={"done"}
                multiline
                onChangeText={(DeleteRemark) =>
                  OnChangeDeleteRemark(DeleteRemark)
                }
              />
            </View>
          </View>
          <View>
            <SaveButton
              onPress={() =>
                OnClickDeleteText(OrderListItem?.SLNO, DeleteRemark)
              }
              BgColor={whiteColor}
              TitleColor={RedTextColor}
              title={Strings.Del}
              borderColor={whiteColor}
            />
          </View>
        </View>
      </SimpleCenterAlignModal>
    </View>
  );
};
const styles = StyleSheet.create({
  CardStyle: {
    flex: 1,
    // width: "95%",
    marginVertical: 8,
    // paddingLeft: 10,
    // paddingTop: 20,
    alignSelf: "center",
    padding: 10,
    paddingLeft: 15,
    marginHorizontal: 10,
  },
  PhoneNoTextStyle: {
    color: lightGreyTextColor,
    fontFamily: fonts.Lato_Regular,
    fontSize: 12,
  },
  CustomerNameText: {
    color: RedTextColor,
    marginTop: 7,
    fontSize: 14,
    fontFamily: fonts.Lato_Bold,
    marginBottom: 5,
  },
  SiteTextStyle: {
    color: darkGreyTextColor,
    fontFamily: fonts.Lato_Regular,
    fontSize: 12,
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
    fontSize: 13,
    marginTop: 5,
  },
  CustomerNameWidth: {
    width: "70%",
  },
  InputErrorText: {
    fontSize: 12,
    fontFamily: fonts.Lato_Regular,
    color: "red",
    marginTop: 10,
    marginLeft: 20,
  },
  CostTextStyle: {
    color: lightGreyTextColor,
    fontFamily: fonts.Font_Regular,
    marginTop: 5,
  },
  TextInputWidth: {
    width: W(320),
    height: 200,
    borderColor: darkGreyTextColor,
    borderWidth: 0.5,
    paddingLeft: 10,
    // borderRadius: 10,
    marginTop: 10,
  },
  DeleteRemarkTitle: {
    color: lightGreyTextColor,
    fontSize: 12,
    fontFamily: fonts.Font_Regular,
  },
  orderDetailColumn: {
    flexDirection: "column",
    width: "30%",
    marginTop: 20,
  },
});
export default HomeListCard;
