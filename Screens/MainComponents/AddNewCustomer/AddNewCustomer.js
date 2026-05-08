import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { BlackColor, whiteColor } from "../../../utility/colors";
import Header from "../../CommonComponents/Header";
import SimpleTextfield from "../../CommonComponents/SimpleTextfield";
import { fonts, W } from "../../../utility/GlobalStyles";
import { lightGreyTextColor } from "../../../utility/colors";
import { CheckedIcon } from "../../../Images/index";
import LoginButton from "../../CommonComponents/LoginButton";
import OfflineNotice from "../../CommonComponents/OfflineNotice";
import Strings from "../../../utility/strings";
import NetInfo from "@react-native-community/netinfo";

const AddNewCustomer = (props) => {
  const [CustomerName, setCustomerName] = useState("");
  const [PhoneNo, setPhoneNo] = useState("");
  const [Email, setEmail] = useState("");
  const [CashOrder, setCashOrder] = useState(true);
  const [CreditOrder, setCreditOrder] = useState(false);
  const [CustomerCode, setCustomerCode] = useState("");
  const [CustomerNameError, setCustomerNameError] = useState("");
  const [CustomerCodeError, setCustomerCodeError] = useState("");
  const [CustomerEmailError, setCustomerEmailError] = useState("");
  const [CustomerPhoneError, setCustomerPhoneError] = useState("");
  const [CustomerTypeError, setCustomerTypeError] = useState("");
  //Function

  const validateEmail = (email) => {
    var re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };

  const validatePhone = (phoneno) => {
    console.log(phoneno.length);
    if (phoneno.length < 20 && phoneno.length > 0) {
      return true;
    } else {
      return false;
    }
  };

  const ValidateForm = (
    Email,
    CustomerName,
    CustomerCode,
    PhoneNo,
    CashOrder,
    CreditOrder
  ) => {
    var isValidate = 0;
    if (CustomerName === "") {
      isValidate -= 1;
      setCustomerNameError(Strings.CustomerNameNullError);
    } else {
      isValidate += 1;
      setCustomerName(CustomerName);
    }
    if (CustomerCode === "") {
      isValidate -= 1;
      setCustomerCodeError(Strings.CustomerCodeNullError);
    } else {
      isValidate += 1;
      setCustomerCode(CustomerCode);
    }

    // if(validateEmail(Email)){
    //     console.log("Email is Valid")
    //     isValidate += 1;
    //    setEmail(Email)
    // }else{
    //     isValidate -= 1;
    //    setCustomerEmailError(Email ===""?Strings.EmailNullError:Strings.InvalidEmailError)
    // }
    //     if(validatePhone(PhoneNo)){
    //         isValidate += 1;
    //         setPhoneNo(PhoneNo)
    //    }else{
    //     isValidate -= 1;
    //     setCustomerPhoneError(Strings.CustomerPhoneNullError)
    //     }
    if (CashOrder === true || CreditOrder === true) {
      isValidate += 1;
      setCustomerTypeError("");
    } else {
      //Alert.alert("Please Select the Order Type")
      setCustomerTypeError(Strings.CustomerTypeNullError);
    }

    if (isValidate === 3) {
      console.log("Save");
      OnClickSave(
        Email,
        CustomerName,
        CustomerCode,
        PhoneNo,
        CashOrder,
        CreditOrder
      );
    }
  };

  const onClickOrderType = (OrderType) => {
    console.log("OrderType", OrderType);
    if (OrderType === "Cash") {
      setCashOrder(true);
      setCreditOrder(false);
      setCustomerTypeError("");
    } else if (OrderType === "Credit") {
      setCreditOrder(true);
      setCashOrder(false);
      setCustomerTypeError("");
    } else {
      setCreditOrder(false);
      setCashOrder(false);
      setCustomerTypeError("");
    }
  };

  const OnChangeCustomerName = (customername) => {
    setCustomerNameError("");
    setCustomerName(customername);
  };

  const OnChangeCustomerCode = (customercode) => {
    setCustomerCodeError("");
    setCustomerCode(customercode);
  };

  const OnChangeCustomerEmail = (customeremail) => {
    setCustomerEmailError("");
    setEmail(customeremail);
  };

  const OnChangeCustomerPhone = (customerphone) => {
    setCustomerPhoneError("");
    setPhoneNo(customerphone);
  };

  const OnClickSave = (
    Email,
    CustomerName,
    CustomerCode,
    PhoneNo,
    CashOrder,
    CreditOrder
  ) => {
    let NewCustomerObject = {
      CustomerName: CustomerName,
      CustomerCode: CustomerCode,
      Email: Email,
      PhoneNo: PhoneNo,
      OrderType: CashOrder ? "Cash" : "Credit",
      NewCustomer: true,
    };
    props.navigation.navigate("AddEditScheduleOrder", {
      NewCustomerObject: NewCustomerObject,
    });
  };

  const [InternetStatus, setInternetStatus] = useState(true);

  useEffect(() => {
    NetInfo.addEventListener((state) => {
      setInternetStatus(state.isConnected);
    });
  }, [InternetStatus]);

  return (
    <View style={styles.container}>
      <Header
        BackTitle={true}
        Title={"Add New Customer"}
        onBackPress={() => props.navigation.goBack()}
      />
      <OfflineNotice
        isConnected={InternetStatus}
        setIsConnected={setInternetStatus}
      />
      <View style={styles.container}>
        <Text
          style={[styles.ScheduleDateText, { marginTop: 40, marginLeft: 35 }]}
        >
          {Strings.CustomerType}
        </Text>
        <View style={styles.radioBtnRowStyle}>
          {CashOrder ? (
            <TouchableOpacity
              onPress={() => onClickOrderType("Cash")}
              style={styles.radioBtnRowTouch}
            >
              <Image source={CheckedIcon} style={styles.selectRadioIcon} />
              <Text style={styles.radioBtnTxt}>{Strings.Cash}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => onClickOrderType("Cash")}
              style={styles.radioBtnRowTouch}
            >
              <View style={styles.unselectRadioButton} />
              <Text style={styles.radioBtnTxt}>{Strings.Cash}</Text>
            </TouchableOpacity>
          )}
          {CreditOrder ? (
            <TouchableOpacity
              onPress={() => onClickOrderType("Credit")}
              style={styles.radioBtnRowTouch}
            >
              <Image source={CheckedIcon} style={styles.selectRadioIcon} />
              <Text style={styles.radioBtnTxt}>{Strings.Credit}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => onClickOrderType("Credit")}
              style={styles.radioBtnRowTouch}
            >
              <View style={styles.unselectRadioButton} />
              <Text style={styles.radioBtnTxt}>{Strings.Credit}</Text>
            </TouchableOpacity>
          )}
        </View>
        {CustomerTypeError === "" ? (
          false
        ) : (
          <Text style={styles.InputErrorText}>{CustomerTypeError}</Text>
        )}
        <SimpleTextfield
          placeholder={Strings.CustomerName}
          value={CustomerName}
          //error = {CustomerNameError}
          baseColor={BlackColor}
          fontSize={14}
          onChangeText={(CustomerName) => OnChangeCustomerName(CustomerName)}
        />
        {CustomerNameError === "" ? (
          false
        ) : (
          <Text style={styles.InputErrorText}>{CustomerNameError}</Text>
        )}

        <SimpleTextfield
          placeholder={Strings.CustomerCode}
          value={CustomerCode}
          // error = {CustomerCodeError}
          baseColor={BlackColor}
          fontSize={14}
          onChangeText={(CustomerCode) => OnChangeCustomerCode(CustomerCode)}
        />
        {CustomerCodeError === "" ? (
          false
        ) : (
          <Text style={styles.InputErrorText}>{CustomerCodeError}</Text>
        )}
        <SimpleTextfield
          placeholder={Strings.EmailAddress}
          value={Email}
          baseColor={BlackColor}
          // error = {CustomerEmailError}
          fontSize={14}
          onChangeText={(Email) => OnChangeCustomerEmail(Email)}
        />
        {CustomerEmailError === "" ? (
          false
        ) : (
          <Text style={styles.InputErrorText}>{CustomerEmailError}</Text>
        )}
        <SimpleTextfield
          placeholder={Strings.PhoneNo}
          value={PhoneNo}
          keyboardType="number-pad"
          baseColor={BlackColor}
          maxLength={20}
          // error = {CustomerPhoneError}
          fontSize={14}
          onChangeText={(PhoneNo) => OnChangeCustomerPhone(PhoneNo)}
        />
        {CustomerPhoneError === "" ? (
          false
        ) : (
          <Text style={styles.InputErrorText}>{CustomerPhoneError}</Text>
        )}

        <View style={styles.SaveButtonTopMargin}>
          <LoginButton
            onPress={() =>
              ValidateForm(
                Email,
                CustomerName,
                CustomerCode,
                PhoneNo,
                CashOrder,
                CreditOrder
              )
            }
            title="Save"
          />
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: whiteColor,
  },
  ScheduleDateText: {
    fontFamily: fonts.Font_Medium,
    marginTop: 20,
    marginLeft: 20,
    marginBottom: 5,
  },
  radioBtnRowStyle: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginLeft: 10,
  },
  radioBtnRowTouch: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginLeft: 15,
  },

  unselectRadioButton: {
    width: 20,
    height: 20,
    borderRadius: 20 / 2,
    borderWidth: 1,
    borderColor: lightGreyTextColor,
  },
  unspecButton: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: lightGreyTextColor,
  },
  radioBtnTxt: {
    marginLeft: 10,
  },
  selectRadioIcon: {
    width: 20,
    height: 20,
  },
  SaveButtonTopMargin: {
    marginTop: "10%",
  },
  InputErrorText: {
    marginLeft: 35,
    fontSize: 12,
    fontFamily: fonts.Lato_Regular,
    color: "red",
  },
});
export default AddNewCustomer;
