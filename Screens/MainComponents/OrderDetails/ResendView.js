import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import {
  GetResendEmails,
  ResendDeliveryNote,
} from "../../../utility/ApiHelpers/StagingApis";
import { W, fonts } from "../../../utility/GlobalStyles";
import {
  BlackColor,
  darkGreyTextColor,
  lightGreyTextColor,
  primaryColor,
  whiteColor,
} from "../../../utility/colors";
import Strings from "../../../utility/strings";
import Header from "../../CommonComponents/Header";
import LoaderComponent from "../../CommonComponents/LoaderComponent";
import LoginButton from "../../CommonComponents/LoginButton";

const ResendView = (props) => {
  //Props
  const OrderListItem = props.route.params?.OrderListItem;
  const primaryEmail = props.route.params?.primaryEmail;

  //States
  const [UserToken, setUserToken] = useState("");
  const [Email, setEmail] = useState(primaryEmail);
  const [Email2, setEmail2] = useState("");
  const [Email3, setEmail3] = useState("");
  const [EmailError, setEmailError] = useState("");
  const [loading, setloading] = useState(true);
  const [EmailsList, setEmailsList] = useState([]);
  const [Input3Focus, setInput3Focus] = useState(false);
  const [Input1Focus, setInput1Focus] = useState(false);
  const [Input2Focus, setInput2Focus] = useState(false);

  //Effect
  useEffect(() => {
    getData();
  }, []);

  //Function

  const validateEmail = (email) => {
    var re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };

  const getData = async () => {
    try {
      const UserToken = await AsyncStorage.getItem("access_token");
      if (UserToken !== null) {
        setUserToken(UserToken);
        GetCustomerEmails(UserToken);
      }
    } catch (e) {
      console.error(e);
    }
  };

  //Callback

  const CustomerEmailsCallBack = (response) => {
    console.log("Api call back after response", response);
    setEmailsList(response?.data);
    // setEmail(response?.data?.customer_email_1 || "delivery@kingdom.bh");
    setEmail2(response?.data?.customer_email_1);
    setEmail3(response?.data?.customer_email_2);
  };

  //Function

  const OnFocusInput1 = () => {
    setInput1Focus(true);
    setInput2Focus(false);
    setInput3Focus(false);
  };
  const OnFocusInput2 = () => {
    setInput1Focus(false);
    setInput2Focus(true);
    setInput3Focus(false);
  };
  const OnFocusInput3 = () => {
    setInput1Focus(false);
    setInput2Focus(false);
    setInput3Focus(true);
  };

  //Get Customer Email

  const GetCustomerEmails = (UserToken) => {
    let CustomerObject = {
      UserToken: UserToken,
      CUSTCODE: OrderListItem?.CUSTCODE,
    };
    console.log("CustomerObject", CustomerObject);
    GetResendEmails(CustomerObject, setloading, CustomerEmailsCallBack);
  };

  const ValidateEmailForm = (Email) => {
    var isValidate = 0;
    console.log("Email", Email);
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
      ResendNote();
    }
  };

  const OnChangeEmail = (email) => {
    setEmail(email);
    setEmailError("");
  };

  const ResendNote = () => {
    console.log("Resend Delivery Note");
    console.log("Resend Invoice", UserToken, OrderListItem?.DELIVERYNO);
    setloading(true);
    let ResendOrderPdfObject = {
      UserToken: UserToken,
      DeliveryNo: OrderListItem?.DELIVERYNO,
      Division: OrderListItem?.TABLENAME,
      Email1: Email,
      Email2: Email2,
      Email3: Email3,
    };
    console.log("ResendOrderPdfObject", ResendOrderPdfObject);
    ResendDeliveryNote(ResendOrderPdfObject, setloading);
  };

  return (
    <View style={styles.container}>
      <Header
        BackTitle={true}
        Title={"Resend"}
        onBackPress={() => props.navigation.goBack()}
      />

      {loading ? (
        <LoaderComponent />
      ) : (
        <View style={[styles.container, { marginTop: 10 }]}>
          <Text style={styles.EmailAddressTitle}>Primary Email Address</Text>
          <View style={{ marginTop: -20, alignItems: "center" }}>
            <View style={{ width: W(320) }}>
              <TextInput
                ref={(input1) => {
                  textInput1 = input1;
                }}
                style={[
                  styles.TextInputWidth,
                  {
                    borderBottomColor: Input1Focus
                      ? primaryColor
                      : lightGreyTextColor,
                    borderWidth: Input1Focus ? 2 : 0.5,
                  },
                ]}
                editable={false}
                placeholder="Email"
                value={Email}
                onFocus={() => OnFocusInput1()}
                baseColor={BlackColor}
                placeholderTextColor={lightGreyTextColor}
                returnKeyType="done"
                returnKeyLabel={"Done"}
                fontSize={14}
                onChangeText={(Email) => OnChangeEmail(Email)}
              />
            </View>
          </View>
          {EmailError === "" ? (
            false
          ) : (
            <Text style={styles.InputErrorText}>{EmailError}</Text>
          )}

          <Text style={styles.EmailAddressTitle}>
            Email Address 2 (optional)
          </Text>
          <View style={{ marginTop: -20, alignItems: "center" }}>
            <View style={{ width: W(320) }}>
              <TextInput
                ref={(input2) => {
                  textInput2 = input2;
                }}
                style={[
                  styles.TextInputWidth,
                  {
                    borderBottomColor: Input2Focus
                      ? primaryColor
                      : lightGreyTextColor,
                    borderWidth: Input2Focus ? 2 : 0.5,
                  },
                ]}
                placeholder="Email"
                value={Email2}
                onFocus={() => OnFocusInput2()}
                baseColor={BlackColor}
                placeholderTextColor={lightGreyTextColor}
                fontSize={14}
                onChangeText={(Email2) => setEmail2(Email2)}
              />
            </View>
          </View>

          <Text style={styles.EmailAddressTitle}>
            Email Address 3 (optional)
          </Text>
          <View style={{ marginTop: -20, alignItems: "center" }}>
            <View style={{ width: W(320) }}>
              <TextInput
                ref={(input3) => {
                  textInput3 = input3;
                }}
                style={[
                  styles.TextInputWidth,
                  {
                    borderBottomColor: Input3Focus
                      ? primaryColor
                      : lightGreyTextColor,
                    borderWidth: Input3Focus ? 2 : 0.5,
                  },
                ]}
                onFocus={() => OnFocusInput3()}
                placeholder="Email"
                value={Email3}
                baseColor={BlackColor}
                placeholderTextColor={lightGreyTextColor}
                fontSize={14}
                onChangeText={(Email3) => setEmail3(Email3)}
              />
            </View>
          </View>
        </View>
      )}
      <View style={{ marginBottom: "10%" }}>
        <LoginButton
          BgColor={"red"}
          onPress={() => ValidateEmailForm(Email)}
          title={"Resend"}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: whiteColor,
  },
  EmailAddressTitle: {
    fontFamily: fonts.Lato_Bold,
    color: darkGreyTextColor,
    fontSize: 16,
    marginLeft: 20,
    marginTop: 20,
  },
  InputErrorText: {
    fontSize: 12,
    fontFamily: fonts.Lato_Regular,
    color: "red",
    marginTop: 2,
    marginLeft: 30,
  },
  TextInputWidth: {
    width: W(320),
    borderColor: whiteColor,
    paddingBottom: 10,
    paddingLeft: 10,
    marginTop: 30,
    color: lightGreyTextColor,
  },
});
export default ResendView;
