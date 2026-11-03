// DriverInvoice.js;
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import Pdf from "react-native-pdf";
import RNFetchBlob from "react-native-blob-util";
import { GetCurrentDriveOrderItemInvoice } from "../../../utility/ApiHelpers/StagingApis";
import { W, fonts } from "../../../utility/GlobalStyles";
import {
  darkGreyTextColor,
  lightGreyTextColor,
  whiteColor,
} from "../../../utility/colors";
import HeaderComponent from "../../CommonComponents/Header";
import LoaderComponent from "../../CommonComponents/LoaderComponent";
import OfflineNotice from "../../CommonComponents/OfflineNotice";
import SaveButton from "../../CommonComponents/SaveButton";

const DriverInvoice = (props) => {
  //Props

  const Division = props.route?.params?.Division;
  const InvoiceNo = props.route?.params?.InvoiceNo;

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
    GetCurrentDriveOrderItemInvoice(
      Division,
      InvoiceNo,
      UserToken,
      OrderPdfCallback,
      setloading
    );
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
        Title={"Invoice"}
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
export default DriverInvoice;
