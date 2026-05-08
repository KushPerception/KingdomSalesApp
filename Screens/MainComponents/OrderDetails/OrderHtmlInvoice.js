import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Pdf from "react-native-pdf";
import { ForwardGreyIcon } from "../../../Images/index";
import {
  GetDriverInvoicePdf,
  ResendDeliveryNote,
  SignatureUrl,
  whatsappURL,
} from "../../../utility/ApiHelpers/StagingApis";
import { W, fonts } from "../../../utility/GlobalStyles";
import {
  BlackColor,
  RedTextColor,
  darkGreyTextColor,
  lightGreyTextColor,
  lightGreyTextInputColor,
  primaryColor,
  whiteColor,
} from "../../../utility/colors";
import { validatePhone } from "../../../utility/helpers";
import Strings from "../../../utility/strings";
import BottomSwipebleModal from "../../CommonComponents/BottomSwipebleModal/BottomSwipebleModal";
import HeaderComponent from "../../CommonComponents/Header";
import SaveButton from "../../CommonComponents/SaveButton";
import SimpleCenterAlignModal from "../../CommonComponents/SimpleCenterAlignModal";

/* order pdf */
const OrderHtmlInvoice = (props) => {
  //Props
  const bottomSheet = useRef();
  const simplemodal = useRef();

  const OrderListItem = props.route.params?.OrderListItem;
  const NavigateWatsapp = props.route.params?.NavigateWatsapp;
  const AvoidGetData = props.route.params?.AvoidGetData;
  //States
  const [loading, setloading] = useState(true);
  const [UserToken, setUserToken] = useState("");
  const [PdfInvoice, setPdfInvoice] = useState("");
  const [primaryEmail, setPrimaryEmail] = useState("");
  const [UserInfo, setUserInfo] = useState("");
  const [WatsappNumber, setWatsappNumber] = useState(
    OrderListItem?.CUSTPHONE ? OrderListItem?.CUSTPHONE : ""
  );

  const [WhatsappPhoneNullError, setWhatsappPhoneNullError] = useState("");

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
      console.log("AvoidGetData", AvoidGetData);

      if (AvoidGetData === true) {
        console.log("Focus called to avoid get data");
      } else {
        if (InternetStatus) {
          getData();
        }
      }
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [props.navigation, NavigateWatsapp]);

  useEffect(() => {
    if (InternetStatus) {
      getData();
    }
  }, [InternetStatus]);

  //Callback function
  const OrderPdfCallback = (response) => {
    setPdfInvoice(response?.data?.pdf);
    setPrimaryEmail(response?.data?.primary_email);
  };

  const getData = async () => {
    try {
      console.log("get data called===========");

      await AsyncStorage.multiGet(["access_token", "userinfo"]).then(
        (response) => {
          if (NavigateWatsapp === true) {
            setUserToken(response[0][1]);
            GetOrderPdf(response[0][1]);
            setWatsappNumber(OrderListItem?.CUSTPHONE);
            NavigatWatsapp();
          } else {
            setUserToken(response[0][1]);
            GetOrderPdf(response[0][1]);
            let UserInfo = JSON.parse(response[1][1]);
            setUserInfo(UserInfo?.USERNAME);
          }
        }
      );
    } catch (e) {
      console.error(e);
    }
  };

  const NavigatWatsapp = () => {
    Linking.openURL(
      whatsappURL +
        OrderListItem?.CUSTPHONE +
        "&text=Dear%20customer,%20your%20delivery%20note%20from%20KINGDOM%20is:%20" +
        `${SignatureUrl}` +
        OrderListItem?.TABLENAME +
        "/" +
        OrderListItem?.DELIVERYNO +
        "/" +
        OrderListItem?.AUTHPERSON +
        "/download"
    );
  };

  //Validation

  const ValidateForm = (WatsappNumber) => {
    var isValidate = 0;
    if (validatePhone(WatsappNumber)) {
      isValidate += 1;
      setWatsappNumber(WatsappNumber);
    } else {
      isValidate -= 1;
      setWhatsappPhoneNullError(Strings.CustomerPhoneNullError);
    }

    if (isValidate === 1) {
      console.log("Save");
      OnResendViaPhoneNo();
    }
  };

  const OnClickOpenBottomModal = () => {
    console.log("Preview ebook called");
    bottomSheet.current?.show();
  };

  const GetOrderPdf = (UserToken) => {
    let OrderPdfObject = {
      Division: OrderListItem?.TABLENAME,
      DeliveryNo: OrderListItem?.DELIVERYNO,
    };
    setloading(true);
    if (InternetStatus) {
      GetDriverInvoicePdf(
        OrderPdfObject,
        UserToken,
        OrderPdfCallback,
        setloading
      );
    }
  };

  const OnResendViaEmail = async () => {
    await bottomSheet.current?.close();
    props.navigation.navigate("ResendView", {
      OrderListItem: OrderListItem,
      primaryEmail: primaryEmail || OrderListItem.primaryEmail,
    });
  };

  const OnResendViaPhoneNo = async () => {
    await bottomSheet.current?.close();
    await simplemodal.current?.close();

    await Linking.openURL(
      whatsappURL +
        WatsappNumber +
        "&text=Dear%20customer,%20your%20delivery%20note%20from%20KINGDOM%20is:%20" +
        `${SignatureUrl}` +
        OrderListItem?.TABLENAME +
        "/" +
        OrderListItem?.DELIVERYNO +
        "/" +
        UserInfo +
        "/download"
    );
    let ResendOrderPdfObject = {
      UserToken: UserToken,
      DeliveryNo: OrderListItem?.DELIVERYNO,
      Division: OrderListItem?.TABLENAME,
      Email1: primaryEmail || OrderListItem.primaryEmail,
      Email2: null,
      Email3: null,
    };
    InternetStatus && ResendDeliveryNote(ResendOrderPdfObject, setloading);
  };

  const OnChangeWatsappNo = (WatsappNumber) => {
    setWatsappNumber(WatsappNumber);
    setWhatsappPhoneNullError("");
  };

  return (
    <View style={styles.container}>
      <HeaderComponent
        BackTitle={true}
        Title={"Delivery Note"}
        onBackPress={() => props.navigation.goBack()}
        InternetStatus={InternetStatus}
        driverOrd={true}
      />
      <View style={styles.container}>
        <Pdf
          source={{
            uri: `${"data:application/pdf;base64,"}${
              InternetStatus ? PdfInvoice : OrderListItem.orderPdf
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
          <View style={styles.SendResendButtonView}>
            <SaveButton
              onPress={() => {
                OrderListItem?.SIGNED == 0
                  ? props.navigation.navigate("DelieveryNote", {
                      OrderListItem: OrderListItem,
                      primaryEmail: primaryEmail || OrderListItem.primaryEmail,
                    })
                  : props.navigation.navigate("NeedAReciept", {
                      OrderListItem: OrderListItem,
                      primaryEmail: primaryEmail || OrderListItem.primaryEmail,
                    });
              }}
              title={
                OrderListItem?.SIGNED == 0
                  ? Strings.TakeSignature
                  : Strings.NeedReciept
              }
            />

            {OrderListItem?.SIGNED == 0 ? (
              false
            ) : InternetStatus ? (
              <SaveButton
                onPress={() => OnClickOpenBottomModal()}
                BgColor={RedTextColor}
                borderColor={RedTextColor}
                title={"Resend"}
              />
            ) : (
              false
            )}
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

      <BottomSwipebleModal
        draggable={true}
        hasDraggableIcon
        ref={bottomSheet}
        height={300}
      >
        <View
          showsVerticalScrollIndicator={false}
          style={{ padding: 20, marginTop: 20, alignItems: "center" }}
        >
          <TouchableOpacity
            onPress={() => OnResendViaEmail()}
            style={styles.ShareViaTouchBox}
          >
            <Text>{Strings.ShareViaEmail}</Text>
            <Image
              source={ForwardGreyIcon}
              style={styles.ForwardIconStyle}
              resizeMode={"contain"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => simplemodal.current?.show()}
            style={styles.ShareViaTouchBox}
          >
            <Text>{Strings.ShareViaWhatsApp}</Text>
            <Image
              source={ForwardGreyIcon}
              style={styles.ForwardIconStyle}
              resizeMode={"contain"}
            />
          </TouchableOpacity>
        </View>
      </BottomSwipebleModal>

      <SimpleCenterAlignModal
        ref={simplemodal}
        onRequestClose={() => simplemodal.current?.close()}
        height={200} //As per need
        width={"96%"}
      >
        <View>
          <Text style={styles.MobileNumberTitle}>
            {Strings.WatsappMobileNo}
          </Text>
          <View style={styles.CenterTopMargin}>
            <View style={styles.TextInputWidth}>
              <TextInput
                style={{ color: BlackColor }}
                placeholder="Mobile Number"
                value={WatsappNumber}
                returnKeyLabel={"Done"}
                returnKeyType={"done"}
                keyboardType={"number-pad"}
                placeholderTextColor={lightGreyTextColor}
                maxLength={14}
                fontSize={14}
                onChangeText={(WatsappNumber) =>
                  OnChangeWatsappNo(WatsappNumber)
                }
              />
            </View>
          </View>
          {WhatsappPhoneNullError === "" ? (
            false
          ) : (
            <Text style={[styles.InputErrorText, { marginLeft: 20 }]}>
              {WhatsappPhoneNullError}
            </Text>
          )}
        </View>

        <View style={[styles.SendResendButtonView, { marginTop: 10 }]}>
          <SaveButton
            title={"Cancel"}
            onPress={() => simplemodal.current?.close()}
            BgColor={lightGreyTextInputColor}
            borderColor={lightGreyTextInputColor}
          />

          <SaveButton
            title={"Send"}
            onPress={() => ValidateForm(WatsappNumber)}
          />
        </View>
      </SimpleCenterAlignModal>
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
export default OrderHtmlInvoice;
