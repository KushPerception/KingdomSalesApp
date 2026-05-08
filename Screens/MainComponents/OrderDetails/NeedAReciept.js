import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import HeaderComponent from "../../CommonComponents/Header";
import LoginButton from "../../CommonComponents/LoginButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GetDriverReceiptPdf } from "../../../utility/ApiHelpers/StagingApis";
import Pdf from "react-native-pdf";
import SunmiInnerPrinter from "react-native-sunmi-v2-printer";
import { primaryColor } from "../../../utility/colors";
import NetInfo from "@react-native-community/netinfo";

const NeedAReciept = (props) => {
  const OrderListItem = props.route.params?.OrderListItem;

  //States
  const [loading, setloading] = useState(true);
  const [UserToken, setUserToken] = useState("");
  const [PdfInvoice, setPdfInvoice] = useState("");
  const [ReceiptData, setReceiptData] = useState("");
  const [InternetStatus, setInternetStatus] = useState(true);

  useEffect(() => {
    NetInfo.addEventListener((state) => {
      setInternetStatus(state.isConnected);
    });
  }, []);

  //Effect
  useEffect(() => {
    if (InternetStatus) {
      getData();
    }
  }, []);

  //Callback function
  const OrderPdfCallback = (response) => {
    setReceiptData(response?.data);
    setPdfInvoice(response?.data?.pdf);
  };

  const getData = async () => {
    try {
      await AsyncStorage.multiGet(["access_token", "userinfo"]).then(
        (response) => {
          setUserToken(response[0][1]);
          GetOrderPdf(response[0][1]);
        }
      );
    } catch (e) {
      console.error(e);
    }
  };

  const GetOrderPdf = (UserToken) => {
    let OrderPdfObject = {
      Division: OrderListItem?.TABLENAME,
      DeliveryNo: OrderListItem?.DELIVERYNO,
    };
    setloading(true);

    GetDriverReceiptPdf(
      OrderPdfObject,
      UserToken,
      OrderPdfCallback,
      setloading
    );
  };

  const printDineInReceipt = async () => {
    let receiptData = InternetStatus
      ? ReceiptData?.print
      : OrderListItem?.receiptData;
    console.log("PRINT CALLED", receiptData?.title);
    let { title, group_vat, address, phone, email } = receiptData?.company_info;

    let {
      DELIVERYNO,
      DELIVERYDATE,
      DELIVERYTIME,
      ORDERNO,
      CUSTOMER,
      SITE,
      ITEMS,
      DRIVER,
      LPO,
    } = receiptData?.order;

    let { NAME: CustomerName, SIGNATURE: CustomerSignature } = CUSTOMER;

    let { NAME: Drivername, SIGNATURE: Driversignature } = DRIVER;

    const S1 = 30;
    const S2 = 24;
    try {
      if (SunmiInnerPrinter.hasPrinter) {
        console.log("Printer available");
        await SunmiInnerPrinter.setAlignment(1);
        await SunmiInnerPrinter.setFontSize(S2);
        await SunmiInnerPrinter.printOriginalText(` \n`);
        await SunmiInnerPrinter.printOriginalText(` \n`);
        await SunmiInnerPrinter.printOriginalText(`${title}\n`);
        await SunmiInnerPrinter.printOriginalText(`${group_vat}\n`);
        await SunmiInnerPrinter.printOriginalText(`${address}\n`);
        await SunmiInnerPrinter.printOriginalText(`${"Phone No: " + phone}\n`);
        await SunmiInnerPrinter.printOriginalText(`${"Email: " + email}\n`);
        await SunmiInnerPrinter.printOriginalText(` \n`);
        await SunmiInnerPrinter.printOriginalText(` \n`);
        await SunmiInnerPrinter.printOriginalText(`${receiptData?.title}\n`);
        await SunmiInnerPrinter.printOriginalText(
          `${"------------------------------"}\n`
        );
        await SunmiInnerPrinter.printOriginalText(` \n`);
        await SunmiInnerPrinter.printOriginalText(
          `${"D.N. No: " + DELIVERYNO}\n`
        );
        await SunmiInnerPrinter.printOriginalText(
          `${"Order No: " + ORDERNO}\n`
        );
        await SunmiInnerPrinter.printOriginalText(
          `${"Date: " + DELIVERYDATE}\n`
        );
        await SunmiInnerPrinter.printOriginalText(
          `${"Time: " + DELIVERYTIME}\n`
        );
        await SunmiInnerPrinter.printOriginalText(
          `${"Customer: " + CustomerName}\n`
        );
        await SunmiInnerPrinter.printOriginalText(`${"Site: " + SITE}\n`);
        await SunmiInnerPrinter.printOriginalText(` \n`);
        await SunmiInnerPrinter.printOriginalText(
          `${"LPO: " + LPO === "" ? "N/A" : LPO}\n`
        );
        await SunmiInnerPrinter.printOriginalText(
          `${"------------------------------"}\n`
        );
        ITEMS.map(async (item) => {
          await SunmiInnerPrinter.printOriginalText(
            `${"ITEM: " + item.NAME}\n${"------------------------------"}\n${"QUANTITY: " + item.QTY}\n`
          );
        });
        await SunmiInnerPrinter.printOriginalText(` \n`);
        await SunmiInnerPrinter.printOriginalText(` \n`);
        await SunmiInnerPrinter.printOriginalText(
          `${"Driver Name & Signature: " + Drivername}\n`
        );
        await SunmiInnerPrinter.printOriginalText(` \n`);
        await SunmiInnerPrinter.printOriginalText(`${"Receiver Signature"}\n`);
        await SunmiInnerPrinter.printOriginalText(` \n`);
        await SunmiInnerPrinter.printOriginalText(` \n`);
      } else {
        Alert.alert("Printer not available");
      }
    } catch (err) {
      console.log("Error", err);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderComponent
        BackTitle={true}
        Title={"Print Reciept"}
        onBackPress={() => props.navigation.goBack()}
        InternetStatus={InternetStatus}
        driverOrd={true}
      />
      <View style={styles.container}>
        <Pdf
          source={{
            uri: `${"data:application/pdf;base64,"}${
              InternetStatus ? PdfInvoice : OrderListItem.receiptPdf
            }`,
          }}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log(`number of pages: ${numberOfPages}`);
          }}
          onPageChanged={(page, numberOfPages) => {
            console.log(`current page: ${page}`);
          }}
          onError={(error) => {
            console.log(error);
          }}
          onPressLink={(uri) => {
            console.log(`Link presse: ${uri}`);
          }}
          style={styles.pdf}
        />

        {loading ? (
          false
        ) : (
          <View style={{ marginBottom: 20 }}>
            <LoginButton onPress={() => printDineInReceipt()} title={"Print"} />
            {/* <LoginButton onPress = {()=> printBase64Receipt()} title = {"Print Base64 "}/> */}
          </View>
        )}
        {loading ? (
          <View style={styles.activityIndicatorStyle}>
            <ActivityIndicator color={primaryColor} size={35} />
          </View>
        ) : (
          false
        )}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  activityIndicatorStyle: {
    flex: 1,
    position: "absolute",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "auto",
    marginBottom: "auto",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },

  pdf: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
export default NeedAReciept;
