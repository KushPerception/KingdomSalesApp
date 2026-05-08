// CashReceipt.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { CalenderIcon, CancelIcon, CheckedIcon } from "../../../Images";
import {
  getCompaniesList,
  getPaymentModeList,
  updateCashReceipt,
} from "../../../utility/ApiHelpers/StagingApis";
import { BlackColor, lightGreyTextColor } from "../../../utility/colors";
import HeaderComponent from "../../CommonComponents/Header";
import OfflineNotice from "../../CommonComponents/OfflineNotice";
import moment from "moment";
import { fonts } from "../../../utility/GlobalStyles";
import DatePicker from 'react-native-date-picker';
import CompanyDropdownComponent from "../../CommonComponents/CompanyDropdownComponent";
import PaymentModeDropdowncomponent from "../../CommonComponents/PaymentModeDropdowncomponent";
import CustomerListModal from "../../CommonComponents/CustomerListModal";
import ModalShade from "react-native-modal";
import Strings from "../../../utility/strings";
import LoginButton from "../../CommonComponents/LoginButton";
import LoaderComponent from "../../CommonComponents/LoaderComponent";

const EditCashReceipt = (props) => {
  const cashReceipt = props.route?.params?.cashReceipt;
  console.log({ cashReceipt });
  const [internetStatus, setInternetStatus] = useState(true);
  const [companiesList, setCompaniesList] = useState([]);
  const [paymentModeList, setPaymentModeList] = useState([]);
  const [company, setCompany] = useState(
    cashReceipt.Division != null ? cashReceipt.Division : ""
  );
  const [paymentMode, setPaymentMode] = useState(
    cashReceipt.PaymentMode != null ? cashReceipt.PaymentMode : ""
  );
  const [userToken, setUserToken] = useState("");
  const [isCompanyModalVisible, setIsCompanyModalVisible] = useState(false);
  const [isPaymentModeModalVisible, setIsPaymentModeModalVisible] =
    useState(false);
  const [showReceiptDatePicker, setShowReceiptDatePicker] = useState(false);
  const [receiptDate, setReceiptDate] = useState(
    cashReceipt.ReceiptDate != null
      ? cashReceipt.ReceiptDate
      : moment().format()
  );
  const [showReferenceDatePicker, setShowReferenceDatePicker] = useState(false);
  const [refDate, setRefDate] = useState(
    cashReceipt.ReferenceDate != null ? cashReceipt.ReferenceDate : null
  );
  const [customerName, setCustomerName] = useState(
    cashReceipt.CustName != null ? cashReceipt.CustName : ""
  );
  const [customerCode, setCustomerCode] = useState(
    cashReceipt.CustCode != null ? cashReceipt.CustCode : ""
  );
  const [customerNameError, setCustomerNameError] = useState("");
  const [customerCodeError, setCustomerCodeError] = useState("");
  const [customerModal, setCustomerModal] = useState(false);
  const [referenceNo, setReferenceNo] = useState(
    cashReceipt.ReferenceNo != null ? cashReceipt.ReferenceNo : ""
  );
  const [referenceBank, setReferenceBank] = useState(
    cashReceipt.ReferenceBank != null ? cashReceipt.ReferenceBank : ""
  );
  const [amount, setAmount] = useState(
    cashReceipt.Amount != null ? cashReceipt.Amount : ""
  );
  const [amountError, setAmountError] = useState("");
  const [remark, setRemark] = useState(
    cashReceipt.Remarks != null ? cashReceipt.Remarks : ""
  );
  const [loading, setLoading] = useState(false);
  const [CashOrder, setCashOrder] = useState(
    cashReceipt.CusType != null && cashReceipt.CusType == "Cash" ? true : false
  );
  const [CreditOrder, setCreditOrder] = useState(
    cashReceipt.CusType != null && cashReceipt.CusType == "Credit"
      ? true
      : false
  );
  const [tempOrderType, setTempOrderType] = useState(
    cashReceipt.CusType != null ? cashReceipt.CusType : ""
  );

  const [editForm, setEditForm] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setInternetStatus(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      setLoading(true);
      if (token) {
        setUserToken(token);

        const companiesResponse = await getCompaniesList(token, true);
        const companiesData = companiesResponse?.data;
        setCompaniesList(companiesData);
        if (companiesData?.length > 0) {
          setCompany(
            cashReceipt.Division != null
              ? cashReceipt.Division
              : companiesData[0].Division
          );
        }

        const paymentModeResponse = await getPaymentModeList(token);
        const paymentModeData = paymentModeResponse?.data;
        setPaymentModeList(paymentModeData);
        if (paymentModeData?.length > 0) {
          setPaymentMode(
            cashReceipt.PaymentMode != null
              ? cashReceipt.PaymentMode
              : paymentModeData[0].PaymentMode
          );
        }
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const toggleDivisionModal = () => {
    setIsCompanyModalVisible(!isCompanyModalVisible);
  };

  const togglePaymentModeModal = () => {
    setIsPaymentModeModalVisible(!isPaymentModeModalVisible);
  };

  const onChangeReceiptDate = (selectedValue) => {
    console.log("receipt date", { selectedValue });
    setShowReceiptDatePicker(false);
    setReceiptDate(selectedValue);
  };

  const onChangeRefDate = (selectedValue) => {
    console.log("ref date", { selectedValue });
    setShowReferenceDatePicker(false);
    setRefDate(selectedValue);
  };

  const clearRefDate = () => {
    setRefDate(null);
  };

  const handleCustomerNameChange = (name) => {
    setCustomerNameError("");
    setCustomerName(name);
  };

  const handleCustomerCodeChange = (code) => {
    setCustomerCodeError("");
    setCustomerCode(code);
  };

  const setCustomerDetails = (code, name) => {
    setCustomerCode(code);
    setCustomerName(name);
    setCustomerNameError("");
    setCustomerCodeError("");
  };

  const validateForm = () => {
    let isValid = true;
    setLoading(true);
    if (!customerName) {
      setCustomerNameError(Strings.CustomerNameNullError);
      setLoading(false);
      isValid = false;
    } else {
      setCustomerNameError("");
    }

    if (!customerCode) {
      setCustomerCodeError(Strings.CustomerCodeNullError);
      setLoading(false);
      isValid = false;
    } else {
      setCustomerCodeError("");
    }

    if (!amount.match(/^\d+(\.\d{1,3})?$/)) {
      setAmountError("Invalid amount");
      setLoading(false);
      isValid = false;
    } else {
      setAmountError("");
    }

    if (isValid) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const receiptData = {
      SLNO: cashReceipt.SLNO,
      ReceiptDate: receiptDate,
      CustCode: customerCode,
      CustName: customerName,
      Division: company,
      PaymentMode: paymentMode,
      ReferenceNo: referenceNo,
      ReferenceDate: refDate,
      ReferenceBank: referenceBank,
      Amount: amount,
      Remarks: remark,
      CusType: tempOrderType,
    };

    try {
      const response = await updateCashReceipt(userToken, receiptData);
      console.log({ cashReceupt: response.status });
      if (response.status == 200) {
        ToastAndroid.show(
          "Cash receipt created successfully",
          ToastAndroid.SHORT
        );
        setLoading(false);
        // In CreateCashReceipt.js
        props.navigation.replace("CashReceipt", { refreshData: getData });
      } else {
        const errorData = await response.json();
        Alert.alert(
          "Error",
          `Failed to create cash receipt: ${errorData.message}`
        );
        setLoading(false);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create cash receipt");
      setLoading(false);
    }
  };

  const onClickOrderType = (OrderType) => {
    console.log("OrderType", OrderType);
    if (OrderType === "Cash") {
      setTempOrderType("Cash");
      setCreditOrder(false);
      setCashOrder(true);
      setCustomerModal(true);
    } else if (OrderType === "Credit") {
      setCreditOrder(true);
      setCashOrder(false);
      setTempOrderType("Credit");
      setCustomerModal(true);
    } else {
      setTempOrderType("");
      setCreditOrder(false);
      setCashOrder(false);
      setCustomerModal(false);
    }
  };

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const nextOneYear = new Date();
  nextOneYear.setFullYear(nextOneYear.getFullYear() + 1);

  return (
    <View style={styles.container}>
      <HeaderComponent
        BackTitle={true}
        Title="Edit Cash Receipt"
        onBackPress={() =>
          props.navigation.replace("CashReceipt", { refreshData: getData })
        }
      />
      <OfflineNotice
        isConnected={internetStatus}
        setIsConnected={setInternetStatus}
      />
      {loading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            width: "100%",
            zIndex: 1,
            backgroundColor: "rgba(0,0,0,0.2)",
          }}
        >
          <LoaderComponent />
        </View>
      )}
      {isCompanyModalVisible && (
        <CompanyDropdownComponent
          companyList={companiesList}
          isModalVisible={isCompanyModalVisible}
          setIsModalVisible={setIsCompanyModalVisible}
          onSelectDivision={(item) => {
            setCompany(item.Division);
            toggleDivisionModal();
          }}
        />
      )}
      {isPaymentModeModalVisible && (
        <PaymentModeDropdowncomponent
          paymentModeList={paymentModeList}
          isModalVisible={isPaymentModeModalVisible}
          setIsModalVisible={setIsPaymentModeModalVisible}
          onSelectPaymentMode={(item) => {
            setPaymentMode(item.PaymentMode);
            togglePaymentModeModal();
          }}
        />
      )}
      <ModalShade
        isVisible={customerModal}
        style={{ margin: 0 }}
        onBackdropPress={() => setCustomerModal(false)}
      >
        <CustomerListModal
          CloseCustomerModal={() => setCustomerModal(false)}
          SetCustomerDetailsFunc={(CUSTCODE, CUSTNAME, CUSTPHONE, EMAIL) => {
            setCustomerDetails(CUSTCODE, CUSTNAME);
            setCustomerModal(false);
          }}
          GetOrderType={tempOrderType === "Cash" ? "CASH" : "CREDIT"}
        />
      </ModalShade>
      {showReceiptDatePicker && (
        <DatePicker
          modal
          open={showReceiptDatePicker}
          date={receiptDate ? new Date(receiptDate) : new Date()}
          mode="date"
          minimumDate={new Date(new Date().setDate(new Date().getDate() - 4))}
          maximumDate={new Date()}
          onConfirm={onChangeReceiptDate}
          onCancel={() => setShowReceiptDatePicker(false)}
        />
      )}
      {showReferenceDatePicker && (
        <DatePicker
          modal
          open={showReferenceDatePicker}
          date={refDate ? new Date(refDate) : new Date()}
          mode="date"
          minimumDate={oneYearAgo}
          maximumDate={nextOneYear}
          onConfirm={onChangeRefDate}
          onCancel={() => setShowReferenceDatePicker(false)}
        />
      )}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          onPress={() => setShowReceiptDatePicker(true)}
          style={{ ...styles.DateButtonStyle, width: 200 }}
        >
          <Text style={styles.DivisionNameTextStyle}>
            {moment(receiptDate).format("LL")}
          </Text>
          <Image
            resizeMode="contain"
            source={CalenderIcon}
            style={styles.CalenderIconStyle}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.divisionSelect}
          onPress={toggleDivisionModal}
        >
          <Text>{company}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.filterContainer}>
        <Text
          style={{
            marginLeft: 10,
            marginRight: 10,
            height: 20,
            flexDirection: "row",
            justifyContent: "space-between",
            alignSelf: "center",
            fontWeight: "600",
          }}
        >
          {"Customer Details"}
        </Text>
      </View>
      <View style={styles.filterContainer}>
        {/* radio buttons here */}
        <View style={styles.radioBtnRowStyle}>
          {CashOrder ? (
            <TouchableOpacity
              disabled={editForm}
              onPress={() => onClickOrderType("Cash")}
              style={styles.radioBtnRowTouch}
            >
              <Image source={CheckedIcon} style={styles.selectRadioIcon} />
              <Text style={styles.radioBtnTxt}>{Strings.Cash}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              disabled={editForm}
              onPress={() => onClickOrderType("Cash")}
              style={styles.radioBtnRowTouch}
            >
              <View style={styles.unselectRadioButton} />
              <Text style={styles.radioBtnTxt}>{Strings.Cash}</Text>
            </TouchableOpacity>
          )}
          {CreditOrder ? (
            <TouchableOpacity
              disabled={editForm}
              onPress={() => onClickOrderType("Credit")}
              style={styles.radioBtnRowTouch}
            >
              <Image source={CheckedIcon} style={styles.selectRadioIcon} />
              <Text style={styles.radioBtnTxt}>{Strings.Credit}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              disabled={editForm}
              onPress={() => onClickOrderType("Credit")}
              style={styles.radioBtnRowTouch}
            >
              <View style={styles.unselectRadioButton} />
              <Text style={styles.radioBtnTxt}>{Strings.Credit}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.filterContainer}>
        {/* Customer Name Input */}
        <TextInput
          style={styles.keywordInput}
          placeholder={Strings.CustomerName}
          value={customerName}
          editable={false}
          onChangeText={handleCustomerNameChange}
        />
      </View>
      {customerNameError === "" ? (
        false
      ) : (
        <Text style={[styles.InputErrorText, { marginLeft: 20 }]}>
          {customerNameError}
        </Text>
      )}
      <View style={styles.filterContainer}>
        {/* Customer Code Input */}
        <TextInput
          style={styles.keywordInput}
          placeholder={Strings.CustomerCode}
          value={customerCode}
          editable={false}
          onChangeText={handleCustomerCodeChange}
        />
      </View>
      {customerCodeError === "" ? (
        false
      ) : (
        <Text style={[styles.InputErrorText, { marginLeft: 20 }]}>
          {customerCodeError}
        </Text>
      )}
      <View style={styles.filterContainer}>
        <Text
          style={{
            marginLeft: 10,
            marginRight: 10,
            height: 20,
            flexDirection: "row",
            justifyContent: "space-between",
            alignSelf: "center",
            fontWeight: "600",
          }}
        >
          {"Payment Details"}
        </Text>
      </View>
      <View style={styles.filterContainer}>
        {/* Payment type mode */}
        <TouchableOpacity
          style={styles.divisionSelect}
          onPress={togglePaymentModeModal}
        >
          <Text>{paymentMode}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowReferenceDatePicker(true)}
          style={{ ...styles.DateButtonStyle, width: 200 }}
        >
          <Text style={styles.DivisionNameTextStyle}>
            {refDate ? moment(refDate).format("LL") : "Reference Date"}
          </Text>
          <Image
            resizeMode="contain"
            source={CalenderIcon}
            style={styles.CalenderIconStyle}
          />
          {refDate && (
            <TouchableOpacity onPress={clearRefDate}>
              <Image
                resizeMode="contain"
                source={CancelIcon}
                style={styles.CalenderIconStyle}
              />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.filterContainer}>
        {/* Reference Number Input */}
        <TextInput
          style={styles.keywordInput}
          placeholder="Reference Number"
          value={referenceNo}
          onChangeText={setReferenceNo}
        />
      </View>
      <View style={styles.filterContainer}>
        {/* Reference Bank Input */}
        <TextInput
          style={styles.keywordInput}
          placeholder="Reference Bank"
          value={referenceBank}
          onChangeText={setReferenceBank}
        />
      </View>
      <View style={styles.filterContainer}>
        {/* Amount Input */}
        <TextInput
          style={styles.keywordInput}
          placeholder="Amount"
          value={amount}
          onChangeText={(text) => {
            setAmount(text);
            setAmountError("");
          }}
          keyboardType="decimal-pad"
        />
        {amountError === "" ? (
          false
        ) : (
          <Text style={[styles.InputErrorText, { marginLeft: 20 }]}>
            {amountError}
          </Text>
        )}
      </View>
      <View style={styles.filterContainer}>
        {/* Remarks Input */}
        <TextInput
          style={styles.keywordInput}
          placeholder="Remarks"
          value={remark}
          onChangeText={setRemark}
        />
      </View>
      <View
        style={{
          flexDirection: "column",
          position: "absolute",
          bottom: 20,
          alignSelf: "center",
          alignContent: "center",
        }}
      >
        <LoginButton onPress={validateForm} title="SUBMIT" />
      </View>
    </View>
  );
};

export default EditCashReceipt;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    margin: 10,
  },
  keywordInput: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  footer: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  CalenderIconStyle: {
    width: 18,
    height: 18,
    marginBottom: 4,
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    margin: 10,
  },
  divisionSelect: {
    flex: 1,
    marginLeft: 5,
    marginRight: 5,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  keywordInput: {
    flex: 1,
    marginLeft: 5,
    marginRight: 5,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  DateButtonStyle: {
    borderColor: BlackColor,
    marginLeft: 10,
    marginRight: 10,
    height: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  InputErrorText: {
    fontSize: 12,
    fontFamily: fonts.Lato_Regular,
    color: "red",
    marginTop: 5,
  },
  radioBtnRowStyle: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioBtnRowTouch: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  unselectRadioButton: {
    width: 16,
    height: 16,
    borderRadius: 16 / 2,
    borderWidth: 1,
    borderColor: lightGreyTextColor,
  },
  selectRadioIcon: {
    width: 16,
    height: 16,
  },
  radioBtnTxt: {
    marginLeft: 10,
    fontFamily: fonts.Lato_Regular,
    fontSize: 16,
    color: lightGreyTextColor,
  },
});
