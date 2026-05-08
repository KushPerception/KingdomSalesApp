import React, { createRef, useEffect, useState } from "react";

// import all the components we are going to use
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import SignatureCanvas from "react-native-signature-canvas";
import { SendOrderSignature } from "../../../utility/ApiHelpers/StagingApis";
import { W, fonts } from "../../../utility/GlobalStyles";
import {
  BlackColor,
  RedTextColor,
  darkGreyTextColor,
  lightGreyTextColor,
  primaryColor,
} from "../../../utility/colors";
import { validatePhone } from "../../../utility/helpers";
import Strings from "../../../utility/strings";
import Header from "../../CommonComponents/Header";
import SaveButton from "../../CommonComponents/SaveButton";
import SimpleTextfield from "../../CommonComponents/SimpleTextfield";
import { addSingleSettledDriverOrder } from "../../db/driverOrders/crud";

const OrderDetails = (props) => {
  //Props
  const OrderListItem = props.route.params?.OrderListItem;
  const primaryEmail = props.route.params?.primaryEmail;

  //States
  const sign = createRef();
  const [UserToken, setUserToken] = useState("");
  const [Email, setEmail] = useState(
    primaryEmail || OrderListItem?.primaryEmail
  );
  const [Email2, setEmail2] = useState(
    OrderListItem ? OrderListItem?.CUSTEMAIL : ""
  );
  const [Email3, setEmail3] = useState("");
  const [SignaturePresent, setSignaturePresent] = useState(false);
  const [EmptySignatureError, setEmptySignatureError] = useState("");
  const [EmailError, setEmailError] = useState("");
  const [loading, setloading] = useState(true);
  const [Remark, setRemark] = useState("");
  const [keyboardStatus, setKeyboardStatus] = useState(undefined);
  const [WatsappNumber, setWatsappNumber] = useState(
    OrderListItem?.CUSTPHONE ? OrderListItem?.CUSTPHONE : ""
  );
  const [WhatsappPhoneNullError, setWhatsappPhoneNullError] = useState("");
  const [ShareTypeVia, setShareTypeVia] = useState("");
  const [UserInfo, setUserInfo] = useState("");
  const [InternetStatus, setInternetStatus] = useState(true);

  //Effect

  useEffect(() => {
    NetInfo.addEventListener((state) => {
      setInternetStatus(state.isConnected);
    });
  }, []);
  useEffect(() => {
    getData();
    Keyboard.addListener("keyboardDidShow", _keyboardDidShow);
    Keyboard.addListener("keyboardDidHide", _keyboardDidHide);
    // cleanup function
    return () => {
      Keyboard.removeAllListeners();
      // Keyboard.removeListener("keyboardDidShow", _keyboardDidShow);
      // Keyboard.removeListener("keyboardDidHide", _keyboardDidHide);
    };
  }, []);

  const _keyboardDidShow = () => setKeyboardStatus("Keyboard Shown");
  const _keyboardDidHide = () => setKeyboardStatus("Keyboard Hidden");

  const getData = async () => {
    try {
      await AsyncStorage.multiGet(["access_token", "userinfo"]).then(
        (response) => {
          setUserToken(response[0][1]);
          let UserInfo = JSON.parse(response[1][1]);
          setUserInfo(UserInfo?.USERNAME);
          setloading(false);
        }
      );
    } catch (e) {
      console.error(e);
    }
  };

  //Callback

  const SignatureCallback = (
    setSignaturePresent,
    setEmptySignatureError,
    response
  ) => {
    if (InternetStatus) {
      let NewOrderItem = {
        CUSTCODE: OrderListItem?.CUSTCODE,
        CUSTEMAIL: OrderListItem?.CUSTEMAIL,
        CUSTNAME: OrderListItem?.CUSTNAME,
        CUSTPHONE: WatsappNumber,
        DELIVERYDATE: OrderListItem?.DELIVERYDATE,
        DELIVERYNO: OrderListItem?.DELIVERYNO,
        DIVISION: OrderListItem?.DIVISION,
        SIGNED: 1,
        SITENAME: OrderListItem?.SITENAME,
        STOCKNAME: OrderListItem?.STOCKNAME,
        TRUCKNO: OrderListItem?.TRUCKNO,
        TABLENAME: OrderListItem?.TABLENAME,
        AUTHPERSON: UserInfo,
      };
      setSignaturePresent(false);
      setEmptySignatureError("");

      if (ShareTypeVia === "Email") {
        props.navigation.navigate("OrderHtmlInvoice", {
          OrderListItem: NewOrderItem,
          AvoidGetData: false,
        });
      } else {
        props.navigation.navigate("OrderHtmlInvoice", {
          OrderListItem: NewOrderItem,
          NavigateWatsapp: true,
          AvoidGetData: false,
        });
      }
    } else {
      let NewOrderItem = {
        CUSTCODE: OrderListItem?.CUSTCODE,
        CUSTEMAIL: OrderListItem?.CUSTEMAIL,
        CUSTNAME: OrderListItem?.CUSTNAME,
        CUSTPHONE: WatsappNumber,
        DELIVERYDATE: OrderListItem?.DELIVERYDATE,
        DELIVERYNO: OrderListItem?.DELIVERYNO,
        DIVISION: OrderListItem?.DIVISION,
        SITENAME: OrderListItem?.SITENAME,
        STOCKNAME: OrderListItem?.STOCKNAME,
        TRUCKNO: OrderListItem?.TRUCKNO,
        TABLENAME: OrderListItem?.TABLENAME,
        SIGNED: 1,
        receiptPdf: OrderListItem?.receiptPdf,
        orderPdf: OrderListItem?.orderPdf,
        receiptData: OrderListItem?.receiptData,
        AUTHPERSON: UserInfo,
      };
      setSignaturePresent(false);
      setEmptySignatureError("");

      props.navigation.navigate("OrderHtmlInvoice", {
        OrderListItem: NewOrderItem,
        AvoidGetData: false,
      });
    }
  };

  //Function
  const validateEmail = (email) => {
    var re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };

  const saveSign = (UserToken, Email, WatsappNumber, SendType) => {
    var isValidate = 0;
    console.log("Email", Email, SendType, WatsappNumber);
    AsyncStorage.setItem("SendUserEmail", Email);
    AsyncStorage.setItem("SendUserToken", UserToken);
    // if (validateEmail(Email)) {
    //   console.log("Email is Valid");
    //   isValidate += 1;
    //   setEmail(Email);
    //   setEmailError("");
    // } else {
    //   isValidate -= 1;
    //   setEmailError(
    //     Email === null || Email === ""
    //       ? Strings.EmailNullError
    //       : Strings.InvalidEmailError
    //   );
    // }

    // if (isValidate === 1) {
    //   console.log("Save");
    //   sign.current.readSignature();
    // }
    if (InternetStatus) {
      if (SendType === "SendViaEmail") {
        if (validateEmail(Email)) {
          console.log("Email is Valid");
          isValidate += 1;
          setEmail(Email);
          setEmailError("");
        } else {
          isValidate -= 1;
          setEmailError(
            Email === null || Email === ""
              ? Strings.EmailNullError
              : Strings.InvalidEmailError
          );
        }

        if (isValidate === 1) {
          console.log("Save");
          setShareTypeVia("Email");
          sign.current.readSignature();
        }
      } else {
        if (validateEmail(Email)) {
          console.log("Email is Valid");
          isValidate += 1;
          setEmail(Email);
          setEmailError("");
        } else {
          isValidate -= 1;
          setEmailError(
            Email === null || Email === ""
              ? Strings.EmailNullError
              : Strings.InvalidEmailError
          );
        }

        if (validatePhone(WatsappNumber)) {
          isValidate += 1;
          setWatsappNumber(WatsappNumber);
        } else {
          isValidate -= 1;
          setWhatsappPhoneNullError(Strings.CustomerPhoneNullError);
        }

        if (isValidate === 2) {
          console.log("Save");
          setShareTypeVia("Whatsapp");

          sign.current.readSignature();
        }
      }
    } else {
      sign.current.readSignature();
    }
  };

  const resetSign = () => {
    setSignaturePresent(false);
    setEmptySignatureError("");
    sign.current.clearSignature();
  };

  // react-native-signature-canvas calls onOK with a base64 data-URI string
  const _onSaveEvent = async (base64DataUri) => {
    const SendUserToken = await AsyncStorage.getItem("SendUserToken");
    const SendUserEmail = await AsyncStorage.getItem("SendUserEmail");
    // Strip the data-URI prefix to get the raw base64
    const encoded = base64DataUri.replace(/^data:image\/[a-z]+;base64,/, "");

    let SendDeliveryNoteObject = {
      Signature: encoded,
      UserToken: SendUserToken,
      UserEmail: Email,
      UserEmail2: Email2,
      UserEmail3: Email3,
      Division: OrderListItem?.TABLENAME,
      DeliveryNo: OrderListItem?.DELIVERYNO,
      SignatureRemarks: Remark,
      CustomerPhone: WatsappNumber,
    };
    // console.log("SendSignatureEmail", SendDeliveryNoteObject);
    if (SignaturePresent === true) {
      console.log("Signature Send");
      /* signature api */
      if (InternetStatus) {
        SendOrderSignature(
          SendDeliveryNoteObject,
          SignatureCallback,
          setloading,
          setSignaturePresent,
          setEmptySignatureError
        );
      } else {
        console.log("_onSaveEvent offline");
        addSingleSettledDriverOrder(
          SendDeliveryNoteObject,
          SignatureCallback,
          setloading,
          setSignaturePresent,
          setEmptySignatureError,
          OrderListItem?._id,
          "1",
          OrderListItem?.tag
        );
      }
    } else {
      console.log("No Signature Found");
      setEmptySignatureError(Strings.EmptySignatureError);
    }

    //  Ios function
    //  SendOrderSignature(
    //   SendDeliveryNoteObject,
    //   SignatureCallback,
    //   setloading,
    //   setSignaturePresent,
    //   setEmptySignatureError
    // );
  };

  const OnChangeEmail = (email) => {
    setEmail(email);
    setEmailError("");
  };

  const _onDragEvent = () => {
    // This callback will be called when the user enters signature
    console.log("dragged");
    setSignaturePresent(true);
    setEmptySignatureError("");
    setWhatsappPhoneNullError("");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "android" ? "padding" : "height"}
      keyboardVerticalOffset={-220}
      style={styles.container}
    >
      <Header
        RightTitleBackTitle={true}
        Title="Delivery Note"
        onBackPress={() => props.navigation.goBack()}
        RightTitle={Strings.Reset}
        onPressRight={resetSign}
        InternetStatus={InternetStatus}
        driverOrd={true}
      />
      <View style={styles.container}>
        <ScrollView>
          {loading ? (
            <View style={styles.activityIndicatorStyle}>
              <ActivityIndicator color={primaryColor} size={35} />
            </View>
          ) : (
            <View>
              <Text style={styles.EmailAddressTitle}>
                Primary Email Address
              </Text>
              <View style={{ marginTop: -25 }}>
                <SimpleTextfield
                  editable={false}
                  placeholder="Email"
                  value={Email}
                  baseColor={BlackColor}
                  placeholderTextColor={lightGreyTextColor}
                  fontSize={14}
                  onChangeText={(Email) => OnChangeEmail(Email)}
                />
              </View>
              {EmailError === "" ? (
                false
              ) : (
                <Text style={styles.InputErrorText}>{EmailError}</Text>
              )}
              <Text style={styles.EmailAddressTitle}>
                Email Address 2 (optional)
              </Text>
              <View style={{ marginTop: -25 }}>
                <SimpleTextfield
                  placeholder="Email"
                  value={Email2}
                  baseColor={BlackColor}
                  placeholderTextColor={lightGreyTextColor}
                  fontSize={14}
                  onChangeText={(Email2) => setEmail2(Email2)}
                />
              </View>
              <Text style={styles.EmailAddressTitle}>
                Email Address 3 (optional)
              </Text>
              <View style={{ marginTop: -25 }}>
                <SimpleTextfield
                  placeholder="Email"
                  value={Email3}
                  baseColor={BlackColor}
                  placeholderTextColor={lightGreyTextColor}
                  fontSize={14}
                  onChangeText={(Email3) => setEmail3(Email3)}
                />
              </View>

              <Text style={styles.EmailAddressTitle}>Mobile Number</Text>
              <View style={{ marginTop: -25 }}>
                <SimpleTextfield
                  placeholder="Mobile Number"
                  value={WatsappNumber}
                  baseColor={BlackColor}
                  keyboardType={"number-pad"}
                  placeholderTextColor={lightGreyTextColor}
                  maxLength={14}
                  fontSize={14}
                  onChangeText={(WatsappNumber) =>
                    setWatsappNumber(WatsappNumber)
                  }
                />
              </View>
              {WhatsappPhoneNullError === "" ? (
                false
              ) : (
                <Text style={[styles.InputErrorText, { marginLeft: 35 }]}>
                  {WhatsappPhoneNullError}
                </Text>
              )}
              <Text style={styles.DeliveryStatusText}>{Strings.Signature}</Text>
              <Text style={styles.SignatureMessageText}>
                {Strings.SignatureMessage}
              </Text>
              <View
                style={
                  Platform.OS === "ios"
                    ? styles.iossignatureview
                    : styles.signatureview
                }
              >
                <SignatureCanvas
                  ref={sign}
                  onOK={_onSaveEvent}
                  onBegin={_onDragEvent}
                  webStyle={`
                    .m-signature-pad { box-shadow: none; border: none; }
                    .m-signature-pad--body { border: none; }
                    .m-signature-pad--footer { display: none; }
                    body, html { width: 100%; height: 160px; }
                  `}
                  style={styles.signature}
                />
              </View>
              {EmptySignatureError === "" ? (
                false
              ) : (
                <Text style={[styles.InputErrorText, { marginTop: 10 }]}>
                  {EmptySignatureError}
                </Text>
              )}

              <View style={{ alignItems: "center", marginTop: 10 }}>
                <View style={styles.RemarkInputWidth}>
                  <TextInput
                    style={{ color: darkGreyTextColor, padding: 10 }}
                    placeholder={"Remark (Optional)"}
                    value={Remark}
                    multiline={true}
                    returnKeyLabel={"Done"}
                    returnKeyType={"done"}
                    blurOnSubmit={true}
                    placeholderTextColor={lightGreyTextColor}
                    fontSize={14}
                    onChangeText={(Remark) => setRemark(Remark)}
                    //onSubmitEditing = {()=>Keyboard.dismiss()}
                  />
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.activityIndicatorStyle}>
          <ActivityIndicator color={primaryColor} size={35} />
        </View>
      ) : (
        <View>
          {keyboardStatus === "Keyboard Shown" ? (
            false
          ) : InternetStatus ? (
            <View style={styles.SaveResetFlexEnd}>
              <SaveButton
                onPress={() =>
                  saveSign(UserToken, Email, WatsappNumber, "SendViaEmail")
                }
                title={Strings.SendEmail}
              />
              <SaveButton
                title={Strings.SendWhatsapp}
                onPress={() =>
                  saveSign(UserToken, Email, WatsappNumber, "SendViaWhatsapp")
                }
              />
            </View>
          ) : (
            <View style={styles.SaveResetFlexEnd}>
              <SaveButton
                onPress={() =>
                  saveSign(UserToken, Email, WatsappNumber, "SendViaEmail")
                }
                title={Strings.saveOrder}
              />
            </View>
          )}
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  titleStyle: {
    fontSize: 20,
    textAlign: "center",
    margin: 10,
  },
  signature: {
    width: "100%",
    height: 160,
  },
  signatureview: {
    width: "100%",
    height: 180,
    borderColor: lightGreyTextColor,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 1,
  },
  iossignatureview: {
    width: "100%",
    height: 180,
  },
  buttonStyle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    backgroundColor: "#eeeeee",
    margin: 10,
  },
  DeliveryStatusText: {
    fontFamily: fonts.Lato_Bold,
    color: darkGreyTextColor,
    fontSize: 16,
    marginLeft: 20,
    marginTop: 20,
  },
  DeliveryStatusRowStyle: {
    flexDirection: "row",
    marginTop: 20,
    marginLeft: 18,
  },
  UnselectRadioButton: {
    width: 18,
    height: 18,
    borderRadius: 18 / 2,
    borderWidth: 1,
    borderColor: lightGreyTextColor,
  },
  IntransistTextStyle: {
    color: lightGreyTextColor,
    fontFamily: fonts.Lato_Regular,
    fontSize: 16,
    marginLeft: 10,
  },
  CheckedIconStyle: {
    width: 18,
    height: 18,
  },
  IntransistRedTextStyle: {
    color: RedTextColor,
    fontFamily: fonts.Lato_Bold,
    fontSize: 16,
    marginLeft: 10,
  },

  SignatureImageStyle: {
    width: "30%",
    height: 200,
    marginTop: -30,
    marginLeft: 10,
  },
  InputErrorText: {
    fontSize: 12,
    fontFamily: fonts.Lato_Regular,
    color: "red",
    marginTop: 2,
    marginLeft: 30,
  },
  EmailAddressTitle: {
    fontFamily: fonts.Lato_Bold,
    color: darkGreyTextColor,
    fontSize: 16,
    marginLeft: 20,
    marginTop: 10,
  },
  SignatureMessageText: {
    color: lightGreyTextColor,
    fontSize: 12,
    marginLeft: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  SaveResetFlexEnd: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
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
  RemarkInputWidth: {
    width: W(340),
    height: 120,
    borderColor: lightGreyTextColor,
    borderWidth: 0.5,
  },
});
export default OrderDetails;
