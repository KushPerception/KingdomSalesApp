import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
  PermissionsAndroid,
} from "react-native";
import HeaderComponent from "../../CommonComponents/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  darkGreyTextColor,
  lightGreyTextColor,
  whiteColor,
} from "../../../utility/colors";
import {
  GetSalesOrderItemReceipt,
  GetSalesReceiptPdf,
} from "../../../utility/ApiHelpers/StagingApis";
import Pdf from "react-native-pdf";
import SaveButton from "../../CommonComponents/SaveButton";
import { fonts, W } from "../../../utility/GlobalStyles";
import RNFetchBlob from "rn-fetch-blob";
import LoaderComponent from "../../CommonComponents/LoaderComponent";
import NetInfo from "@react-native-community/netinfo";
import OfflineNotice from "../../CommonComponents/OfflineNotice";

const OrderHtmlInvoiceSales = (props) => {
  //Props

  const OrderType = props.route?.params?.OrderType;
  const OrderId = props.route?.params?.OrderId;
  const ItemId = props.route?.params?.ItemId;
  const ERPOrderNo = props.route?.params?.ErpNo;
  const Division = props.route?.params?.Division;

  //States
  const [loading, setloading] = useState(true);
  const [UserToken, setUserToken] = useState("");
  const [PdfInvoice, setPdfInvoice] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [InternetStatus, setInternetStatus] = useState(true);

  useEffect(() => {
    NetInfo.addEventListener((state) => {
      setInternetStatus(state.isConnected);
    });
  }, [InternetStatus]);
  //Effect

  // useEffect(() => {
  //     const unsubscribe = props.navigation.addListener("focus", () => {
  //         // The screen is focused
  //         // Call any action
  //         console.log("AvoidGetData", AvoidGetData);

  //         if (AvoidGetData === true) {
  //             console.log("Focus called to avoid get data");
  //         } else {
  //             getData();
  //         }
  //     });

  //     // Return the function to unsubscribe from the event so it gets removed on unmount
  //     return unsubscribe;
  // }, [props.navigation, NavigateWatsapp]);

  useEffect(() => {
    getData();
  }, []);

  //Callback function
  const OrderPdfCallback = (response) => {
    setPdfInvoice(response?.data?.pdf);
    setDownloadUrl(response?.data?.download_url);
  };

  const getData = async () => {
    try {
      console.log("get data called===========");

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

  //Validation

  const GetOrderPdf = (UserToken) => {
    setloading(true);
    if (ItemId) {
      GetSalesOrderItemReceipt(
        OrderId,
        OrderType,
        ItemId,
        ERPOrderNo,
        Division,
        UserToken,
        OrderPdfCallback,
        setloading
      );
    } else {
      GetSalesReceiptPdf(
        OrderId,
        OrderType,
        UserToken,
        OrderPdfCallback,
        setloading
      );
    }
  };

  const checkPermission = async () => {
    if (Platform.OS === "ios") {
      downloadFile();
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "Storage Permission Required",
            message:
              "Application needs access to your storage to download File",
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          // Start downloading
          downloadFile();
          console.log("Storage Permission Granted.");
        } else {
          // If permission denied then show alert
          Alert.alert("Error", "Storage Permission Not Granted");
        }
      } catch (err) {
        // To handle permission related exception
        console.log("++++" + err);
      }
    }
  };

  const downloadFile = () => {
    let options = {
      fileCache: true,
      addAndroidDownloads: {
        description: "downloading file...",
        notification: true,
        mime: "application/pdf",
        useDownloadManager: true,
      },
    };
    RNFetchBlob.config(options)
      .fetch("GET", downloadUrl)
      .then((res) => {
        alert("File Download Successfully.");
      });
  };

  return (
    <View style={styles.container}>
      <HeaderComponent
        BackTitle={true}
        Title={"Receipt"}
        onBackPress={() => props.navigation.goBack()}
      />
      <OfflineNotice
        isConnected={InternetStatus}
        setIsConnected={setInternetStatus}
      />
      {loading ? (
        <LoaderComponent />
      ) : (
        <View style={styles.container}>
          <Pdf
            source={{ uri: `${"data:application/pdf;base64,"}${PdfInvoice}` }}
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
            <View style={styles.SendResendButtonView}>
              <SaveButton onPress={checkPermission} title={"Download"} />
            </View>
          )}
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: whiteColor,
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
  SendResendButtonView: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: "10%",
  },
  ShareViaTouchBox: {
    width: "96%",
    height: 45,
    flexDirection: "row",
    justifyContent: "space-between",
    borderColor: lightGreyTextColor,
    borderWidth: 0.5,
    alignItems: "center",
    paddingRight: 20,
    paddingLeft: 20,
    marginTop: 20,
  },
  ForwardIconStyle: {
    width: 18,
    height: 18,
  },
  MobileNumberTitle: {
    fontFamily: fonts.Lato_Bold,
    color: darkGreyTextColor,
    fontSize: 16,
    marginLeft: 20,
    marginTop: 20,
  },
  TextInputWidth: {
    width: W(320),
    height: 45,
    borderColor: darkGreyTextColor,
    borderWidth: 0.5,
    paddingLeft: 10,
    borderRadius: 10,
  },
  CenterTopMargin: {
    marginTop: 20,
    marginLeft: 20,
  },
  InputErrorText: {
    fontSize: 12,
    fontFamily: fonts.Lato_Regular,
    color: "red",
    marginTop: 5,
  },
});
export default OrderHtmlInvoiceSales;
