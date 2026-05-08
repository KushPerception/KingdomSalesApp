import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Dimensions,
  Alert,
} from "react-native";
import {
  lightGreyTextColor,
  whiteColor,
  darkGreyTextColor,
  lightGreyTextInputColor,
  BlackColor,
  primaryColor,
} from "../../../utility/colors";
import { W, H, fonts } from "../../../utility/GlobalStyles";
import HeaderComponent from "../../CommonComponents/Header";
const moment = require("moment");
import {
  CheckedIcon,
  CalenderIcon,
  GreyArrowDown,
} from "../../../Images/index";
import LoginButton from "../../CommonComponents/LoginButton";
import DatePicker from 'react-native-date-picker';
import Card from "../../CommonComponents/Card";
import ProductList from "../AddProduct/ProductList";
import CustomerListModal from "../../CommonComponents/CustomerListModal";
import ModalShade from "react-native-modal";
import SimpleTextfield from "../../CommonComponents/SimpleTextfield";
import SimpleTextInput from "../../CommonComponents/SimpleTextInput";

import Strings from "../../../utility/strings";
import CustomerSiteModall from "../../CommonComponents/CustomerSiteModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GetAllOrders,
  getVatPercentage,
  SendCustomerDetailtToServer,
  UpdateZeroVat,
  ValidateCustomers,
} from "../../../utility/ApiHelpers/StagingApis";
import CheckBox from "@react-native-community/checkbox";
import LoaderComponent from "../../CommonComponents/LoaderComponent";
import NetInfo from "@react-native-community/netinfo";
import OfflineNotice from "../../CommonComponents/OfflineNotice";

const { width, height } = Dimensions.get("window");

const AddEditScheduleOrder = (props) => {
  const NewCustomerObject = props.route.params?.NewCustomerObject;
  console.log(NewCustomerObject);

  //States
  const [editForm, setEditForm] = useState(false);
  const [ProductData, setProductData] = useState([]);
  const [OrderDate, setOrderDate] = useState(new Date());
  const [ShowDatePicker, setShowDatePicker] = useState(false);
  const [CustomerName, setCustomerName] = useState(
    NewCustomerObject?.CustomerName
      ? NewCustomerObject?.CustomerName
      : "Customer Name"
  );
  const [CustomerCode, setCustomerCode] = useState(
    NewCustomerObject?.CustomerCode
      ? NewCustomerObject?.CustomerCode
      : "Customer Code"
  );
  const [PhoneNo, setPhoneNo] = useState(
    NewCustomerObject?.PhoneNo ? NewCustomerObject?.PhoneNo : ""
  );
  const [Site, setSite] = useState("Site");
  const [SalesMan, setSalesMan] = useState("");
  const [tempOrderType, setTempOrderType] = useState("");
  const [CashOrder, setCashOrder] = useState(
    NewCustomerObject?.OrderType === "Cash" ? true : true
  );
  const [CreditOrder, setCreditOrder] = useState(
    NewCustomerObject?.OrderType === "Credit" ? true : false
  );
  const [Index1, setIndex1] = useState(true);
  const [Index2, setIndex2] = useState(false);
  const [SLNO, setSLNO] = useState(null);
  const [ZEROVAT, setZEROVAT] = useState(false);
  const [NOTRANSPORT, setNOTRANSPORT] = useState(false);
  const [CustomerModal, setCustomerModal] = useState(false);
  const [OtherCustomer, setOtherCustomer] = useState(
    NewCustomerObject?.NewCustomer ? NewCustomerObject?.NewCustomer : false
  );
  const [CustomerSiteModal, setCustomerSiteModal] = useState(false);
  const [OtherSite, setOtherSite] = useState(false);
  const [UserToken, setUserToken] = useState(null);
  const [SentCustomerObject, setSentCustomerObject] = useState("");
  const [Email, setEmail] = useState(
    NewCustomerObject?.Email ? NewCustomerObject?.Email : ""
  );
  const [CustomerNameError, setCustomerNameError] = useState("");
  const [CustomerCodeError, setCustomerCodeError] = useState("");
  const [CustomerEmailError, setCustomerEmailError] = useState("");
  const [CustomerPhoneError, setCustomerPhoneError] = useState("");
  const [CustomerTypeError, setCustomerTypeError] = useState("");
  const [SiteError, setSiteError] = useState("");
  const [toggleCheckBox, setToggleCheckBox] = useState(false);
  const [toggleTransactionFee, setToggleTansactionFee] = useState(false);
  const [VATPercentage, setVATPercentage] = useState(0);
  const [showAllSites, setShowAllSites] = useState(false);
  const [loading, setLoading] = useState(false);
  const [InternetStatus, setInternetStatus] = useState(true);

  useEffect(() => {
    NetInfo.addEventListener((state) => {
      setInternetStatus(state.isConnected);
    });
  }, [InternetStatus]);
  //Effect
  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    await AsyncStorage.multiGet(["access_token", "userinfo"]).then(
      (response) => {
        setUserToken(response[0][1]);
        // getVatPercentage(response[0][1], setVATPercentage);
        let UserDetails = JSON.parse(response[1][1]);
        setSalesMan(UserDetails?.AUTHPERSON);
      }
    );
  };

  //Functions

  //CallBack Functions
  const ValidateCallback = (response) => {
    if (response.data === 1) {
      Alert.alert("Customer Already Available");
    } else {
      let MomentDate = moment(OrderDate).format();
      let DashOrderDate = MomentDate.substr(0, 10);

      let CustomerDetailsObject = {
        ORDERDATE: DashOrderDate,
        ORDERTYPE: CreditOrder ? "CREDIT" : "CASH",
        NEWCUST: OtherCustomer ? 1 : 0,
        CUSTCODE: CustomerCode,
        CUSTNAME: CustomerName,
        PHONENO: PhoneNo === "Phone No" ? null : PhoneNo,
        NEWSITE: OtherSite ? 1 : 0,
        SITENAME: Site,
        EMAIL: Email === "Email" ? null : Email,
        // STOCKS: [],
        // VATPercentage,
        ZEROVAT: toggleCheckBox,
        NOTRANSPORT: toggleTransactionFee,
      };

      setSentCustomerObject(CustomerDetailsObject);
      SendCustomerDetailtToServer(
        CustomerDetailsObject,
        UserToken,
        (slno, zerovat, notransport) => {
          setIndex1(false);
          setIndex2(true);
          setSLNO(slno);
          setZEROVAT(zerovat);
          setNOTRANSPORT(notransport);
        },
        setLoading
      );

      if (ProductData === []) {
        onAddMore();
      } else {
        false;
      }
    }
  };

  //Validation form
  const validateEmail = (email) => {
    var re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };

  const validatePhone = (phoneno) => {
    console.log(phoneno.length, phoneno);
    if (phoneno.length < 20 && phoneno.length > 0 && phoneno != "Phone No") {
      return true;
    } else {
      return false;
    }
  };

  const ValidationForm = (
    CustomerName,
    CustomerCode,
    Site,
    Email,
    PhoneNo,
    CreditOrder,
    CashOrder,
    OtherCustomer
  ) => {
    var isValidate = 0;
    if (CustomerName === "Customer Name" || CustomerName === "") {
      isValidate -= 1;
      setCustomerNameError(Strings.CustomerNameNullError);
      console.log("Customer name should be empty");

      // Alert.alert("Customer name should be empty")
    } else {
      isValidate += 1;
      setCustomerName(CustomerName);
    }
    if (CustomerCode === "Customer Code" || CustomerCode === "") {
      isValidate -= 1;
      // Alert.alert("Customer code should be empty")

      setCustomerCodeError(Strings.CustomerCodeNullError);
      console.log("Customer code should be empty");
    } else {
      isValidate += 1;
      setCustomerCode(CustomerCode);
    }

    if (Site === "" || Site === "Site") {
      isValidate -= 1;
      Alert.alert("Please scroll down to select a Site.");
      setSiteError(Strings.SiteNullError);
      //setCustomerCodeError("Customer Code should not be empty")
      console.log("Site should be empty");
    } else {
      isValidate += 1;
      setSite(Site);
      setSiteError("");
    }

    if (CashOrder === true || CreditOrder === true) {
      isValidate += 1;
      setCustomerTypeError("");
    } else {
      //Alert.alert("Please Select the Order Type")
      setCustomerTypeError(Strings.CustomerTypeNullError);
    }

    if (isValidate === 4) {
      console.log("Save");
      if (editForm) {
        if (ZEROVAT !== toggleCheckBox) {
          UpdateZeroVat(toggleCheckBox, SLNO, UserToken, () => {
            setIndex1(false);
            setIndex2(true);
            setZEROVAT(!ZEROVAT);
          });
        } else {
          setIndex1(false);
          setIndex2(true);
        }
      } else {
        setLoading(true);
        OtherCustomer ? ValidateCustomer() : OnClickNext();
      }
    }
  };

  const ValidateCustomer = () => {
    let CustomerObject = {
      CustomerCode: CustomerCode,
      UserToken: UserToken,
    };
    ValidateCustomers(CustomerObject, ValidateCallback);
  };

  const SetCustomerDetails = (CustomerCode, CustomerName, PhoneNo, Email) => {
    setCustomerCode(CustomerCode);
    setCustomerName(CustomerName);
    setPhoneNo(PhoneNo === null ? "" : PhoneNo);
    setOtherCustomer(false);
    setEmail(Email === undefined ? "Email" : Email);
    setCustomerNameError("");
    setCustomerCodeError("");
    setCustomerEmailError("");
    setCustomerPhoneError("");
    setCustomerModal(false);
  };

  const onChange = (selectedValue) => {
    if (ShowDatePicker) {
      setShowDatePicker(!ShowDatePicker);
      setOrderDate(selectedValue);
    }
  };

  const OnClickNext = () => {
    let MomentDate = moment(OrderDate).format();
    let DashOrderDate = MomentDate.substr(0, 10);
    let CustomerDetailsObject = {
      ORDERDATE: DashOrderDate,
      ORDERTYPE: CreditOrder ? "CREDIT" : "CASH",
      NEWCUST: OtherCustomer ? 1 : 0,
      CUSTCODE: CustomerCode,
      CUSTNAME: CustomerName,
      PHONENO: PhoneNo === "Phone No" ? null : PhoneNo,
      NEWSITE: OtherSite ? 1 : 0,
      SITENAME: Site,
      EMAIL: Email === "Email" ? null : Email,
      // STOCKS: [],
      // VATPercentage: VATPercentage,
      ZEROVAT: toggleCheckBox,
      NOTRANSPORT: toggleTransactionFee,
    };
    setSentCustomerObject(CustomerDetailsObject);
    SendCustomerDetailtToServer(
      CustomerDetailsObject,
      UserToken,
      (slno, zerovat, notransport) => {
        setIndex1(false);
        setIndex2(true);
        setSLNO(slno);
        setZEROVAT(zerovat);
        setNOTRANSPORT(notransport);
      },
      setLoading
    );

    if (ProductData === []) {
      onAddMore();
    } else {
      false;
    }
  };

  const onClickBack = () => {
    if (Index2 === true) {
      setIndex2(false);
      setIndex1(true);
      setEditForm(true);
    } else {
      props.navigation.goBack();
    }
  };

  const onClickOrderType = (OrderType) => {
    console.log("OrderType", OrderType);
    if (OrderType === "Cash") {
      setTempOrderType("Cash");
      // setCashOrder(true);
      // setCreditOrder(false);
      setCustomerModal(true);
      setCustomerTypeError("");
    } else if (OrderType === "Credit") {
      // setCreditOrder(true);
      // setCashOrder(false);
      setTempOrderType("Credit");
      setCustomerModal(true);
      setCustomerTypeError("");
    } else {
      setTempOrderType("");
      setCreditOrder(false);
      setCashOrder(false);
      setCustomerModal(false);
      setCustomerTypeError("");
    }
  };

  const onAddMore = () => {
    setProductData([
      ...ProductData,
      {
        Division: "",
        Quantinty: "",
        OrderTime: new Date(),
        PlacingDate: new Date(),
        Remark: "",
      },
    ]);
  };

  const OnHandleRemove = (item) => {
    let filteredList = ProductData.filter((x) => x !== item);
    setProductData([...filteredList]);
  };

  const OnClickOtherCustomers = () => {
    setPhoneNo("");
    setEmail("");
    setCustomerCode("");
    setCustomerName("");
    setOtherCustomer(true);
    setCustomerCodeError("");
    setCustomerEmailError("");
    setCustomerNameError("");
    setCustomerPhoneError("");
    setCustomerModal(false);
  };

  const OnClickOtherSite = () => {
    console.log("Other Site Called");
    setCustomerSiteModal(false);
    setShowAllSites(false);
    setSite("");
    setSiteError("");
    setOtherSite(true);
  };

  const OnClickSite = (SiteName) => {
    setSite(SiteName);
    setCustomerSiteModal(false);
    setShowAllSites(false);
    setOtherSite(false);
    setSiteError("");
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

  const OnChangeSite = (site) => {
    setSiteError("");
    setSite(site);
  };

  const toggleVatPercentage = (newValue) => {
    setToggleCheckBox(newValue);
    setVATPercentage(newValue);
    // if (newValue === true) {
    //   setVATPercentage(0);
    // } else {
    //   getVatPercentage(UserToken, setVATPercentage);
    // }
  };

  const toggleTransactionFees = (newValue) => {
    setToggleTansactionFee(false);
  };

  const allSitePress = () => {
    setCustomerSiteModal(true);
    setShowAllSites(true);
  };

  //Render

  return (
    <View style={styles.container}>
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
      <HeaderComponent
        BackTitle={true}
        Title="Schedule Order"
        onBackPress={onClickBack}
      />
      <DatePicker
        modal
        open={ShowDatePicker}
        date={OrderDate instanceof Date ? OrderDate : new Date(OrderDate)}
        mode="date"
        minimumDate={new Date()}
        onConfirm={onChange}
        onCancel={() => setShowDatePicker(!ShowDatePicker)}
      />
      <OfflineNotice
        isConnected={InternetStatus}
        setIsConnected={setInternetStatus}
      />
      {Index1 ? (
        <Text style={styles.CustomerInfoText}>
          {Strings.CustomerInformation}
        </Text>
      ) : (
        false
      )}
      {Index1 ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : null}
          style={{ flex: 0.9, alignItems: "center" }}
        >
          <Card disabled={true} style={styles.CardStyle}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              <Text style={styles.OrderDateText}>{Strings.OrderDate}</Text>
              <View style={{ alignItems: "center" }}>
                <TouchableOpacity style={styles.DateButtonStyle}>
                  <Text style={styles.OrderDateFieldText}>
                    {moment(OrderDate).format("LL")}
                  </Text>
                  <Image
                    resizeMode="contain"
                    source={CalenderIcon}
                    style={styles.selectRadioIcon}
                  />
                </TouchableOpacity>
              </View>
              <Text style={[styles.OrderDateText, { marginTop: 40 }]}>
                {Strings.CustomerType}
              </Text>
              <View style={styles.radioBtnRowStyle}>
                {CashOrder ? (
                  <TouchableOpacity
                    disabled={editForm}
                    onPress={() => onClickOrderType("Cash")}
                    style={styles.radioBtnRowTouch}
                  >
                    <Image
                      source={CheckedIcon}
                      style={styles.selectRadioIcon}
                    />
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
                    <Image
                      source={CheckedIcon}
                      style={styles.selectRadioIcon}
                    />
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
              {CustomerTypeError === "" ? (
                false
              ) : (
                <Text style={[styles.InputErrorText, { marginLeft: 20 }]}>
                  {CustomerTypeError}
                </Text>
              )}
              <View>
                {OtherCustomer ? (
                  <View>
                    <SimpleTextfield
                      placeholder="Customer Name"
                      value={CustomerName}
                      baseColor={BlackColor}
                      placeholderTextColor={lightGreyTextColor}
                      fontSize={14}
                      onChangeText={(CustomerName) =>
                        OnChangeCustomerName(CustomerName)
                      }
                    />
                    {CustomerNameError === "" ? (
                      false
                    ) : (
                      <Text style={[styles.InputErrorText, { marginLeft: 20 }]}>
                        {CustomerNameError}
                      </Text>
                    )}

                    <SimpleTextfield
                      placeholder="Customer Code"
                      value={CustomerCode}
                      baseColor={BlackColor}
                      placeholderTextColor={lightGreyTextColor}
                      fontSize={14}
                      onChangeText={(CustomerCode) =>
                        OnChangeCustomerCode(CustomerCode)
                      }
                    />
                    {CustomerCodeError === "" ? (
                      false
                    ) : (
                      <Text style={[styles.InputErrorText, { marginLeft: 20 }]}>
                        {CustomerCodeError}
                      </Text>
                    )}
                    <SimpleTextfield
                      placeholder="Email"
                      value={Email}
                      baseColor={BlackColor}
                      placeholderTextColor={lightGreyTextColor}
                      fontSize={14}
                      onChangeText={(Email) => OnChangeCustomerEmail(Email)}
                      disabled={editForm}
                    />
                    {CustomerEmailError === "" ? (
                      false
                    ) : (
                      <Text style={[styles.InputErrorText, { marginLeft: 20 }]}>
                        {CustomerEmailError}
                      </Text>
                    )}

                    <SimpleTextfield
                      placeholder="Phone No"
                      value={PhoneNo}
                      placeholderTextColor={lightGreyTextColor}
                      baseColor={BlackColor}
                      maxLength={20}
                      keyboardType="number-pad"
                      fontSize={14}
                      onChangeText={(PhoneNo) => OnChangeCustomerPhone(PhoneNo)}
                    />
                    {CustomerPhoneError === "" ? (
                      false
                    ) : (
                      <Text style={[styles.InputErrorText, { marginLeft: 20 }]}>
                        {CustomerPhoneError}
                      </Text>
                    )}
                  </View>
                ) : (
                  <View>
                    <View style={{ alignItems: "center" }}>
                      <View style={styles.CustomerInputStyle}>
                        <Text style={styles.InputTextColor}>
                          {CustomerName}
                        </Text>
                      </View>
                    </View>
                    {CustomerNameError === "" ? (
                      false
                    ) : (
                      <Text style={[styles.InputErrorText, { marginLeft: 20 }]}>
                        {CustomerNameError}
                      </Text>
                    )}
                    <View style={{ alignItems: "center" }}>
                      <View style={styles.CustomerInputStyle}>
                        <Text style={styles.InputTextColor}>
                          {CustomerCode}
                        </Text>
                      </View>
                    </View>
                    {CustomerCodeError === "" ? (
                      false
                    ) : (
                      <Text style={[styles.InputErrorText, { marginLeft: 20 }]}>
                        {CustomerCodeError}
                      </Text>
                    )}

                    <SimpleTextInput
                      placeholder="Email"
                      value={Email}
                      baseColor={BlackColor}
                      placeholderTextColor={lightGreyTextColor}
                      fontSize={16}
                      onChangeText={(Email) => OnChangeCustomerEmail(Email)}
                      editable={!editForm}
                    />
                    {CustomerEmailError === "" ? (
                      false
                    ) : (
                      <Text style={[styles.InputErrorText, { marginLeft: 20 }]}>
                        {CustomerEmailError}
                      </Text>
                    )}

                    {/* <View style = {styles.CustomerInputStyle}>
                    <Text style = {styles.InputTextColor}>{Email}</Text>
                  </View> */}

                    <SimpleTextInput
                      placeholder="Phone No"
                      value={PhoneNo}
                      placeholderTextColor={lightGreyTextColor}
                      baseColor={BlackColor}
                      fontSize={14}
                      maxLength={20}
                      keyboardType="number-pad"
                      onChangeText={(PhoneNo) => OnChangeCustomerPhone(PhoneNo)}
                      editable={!editForm}
                    />

                    {CustomerPhoneError === "" ? (
                      false
                    ) : (
                      <Text style={[styles.InputErrorText, { marginLeft: 20 }]}>
                        {CustomerPhoneError}
                      </Text>
                    )}

                    {/* <View style = {styles.CustomerInputStyle}>
                      <Text style = {styles.InputTextColor}>{PhoneNo}</Text>
                    </View> */}
                  </View>
                )}

                {OtherSite ? (
                  <View>
                    <SimpleTextfield
                      placeholder="Site"
                      value={Site}
                      placeholderTextColor={lightGreyTextColor}
                      baseColor={BlackColor}
                      fontSize={14}
                      onChangeText={(Site) => OnChangeSite(Site)}
                    />
                    {SiteError === "" ? (
                      false
                    ) : (
                      <Text style={[styles.InputErrorText, { marginLeft: 20 }]}>
                        {SiteError}
                      </Text>
                    )}
                  </View>
                ) : (
                  <>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          alignItems: "center",
                          marginRight: CreditOrder ? 15 : 0,
                        }}
                      >
                        <TouchableOpacity
                          disabled={editForm}
                          onPress={() => setCustomerSiteModal(true)}
                          style={[
                            styles.CustomerInputStyle,
                            { width: CreditOrder ? W(220) : W(320) },
                          ]}
                        >
                          <Text style={styles.InputTextColor}>{Site}</Text>
                          <Image
                            source={GreyArrowDown}
                            resizeMode="contain"
                            style={styles.DropdownImageStyle}
                          />
                        </TouchableOpacity>
                      </View>

                      {CreditOrder && (
                        <LoginButton
                          small
                          title="All Site"
                          onPress={allSitePress}
                        />
                      )}
                    </View>
                    {SiteError === "" ? (
                      false
                    ) : (
                      <Text style={[styles.InputErrorText, { marginLeft: 20 }]}>
                        {SiteError}
                      </Text>
                    )}
                  </>
                )}

                <View style={{ alignItems: "center" }}>
                  <View style={styles.CustomerInputStyle}>
                    <Text style={styles.InputTextColor}>{SalesMan}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <View style={styles.checkBoxContainer}>
                    <CheckBox
                      disabled={false}
                      value={toggleCheckBox}
                      onValueChange={toggleVatPercentage}
                      style={{ marginRight: 10 }}
                      tintColors={{ true: primaryColor }}
                      // tintColor={primaryColor}
                    />
                    <Text style={styles.InputTextColor}>ZERO VAT(%)</Text>
                  </View>
                  <View style={styles.checkBoxContainer}>
                    <CheckBox
                      disabled={true}
                      value={toggleTransactionFee}
                      onValueChange={toggleTransactionFees}
                      style={{ marginRight: 10 }}
                      tintColors={{ true: primaryColor }}
                      // tintColor={primaryColor}
                    />
                    <Text style={styles.InputTextColor}>
                      No Transaction Fee
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </Card>
          <LoginButton
            onPress={() => {
              ValidationForm(
                CustomerName,
                CustomerCode,
                Site,
                Email,
                PhoneNo,
                CreditOrder,
                CashOrder,
                OtherCustomer
              );
            }}
            title="NEXT"
          />
          <ModalShade
            isVisible={CustomerModal}
            style={{ margin: 0 }}
            onBackdropPress={() => setCustomerModal(false)}
          >
            <CustomerListModal
              CloseCustomerModal={() => setCustomerModal(false)}
              SetCustomerDetailsFunc={(
                CUSTCODE,
                CUSTNAME,
                CUSTPHONE,
                EMAIL
              ) => {
                SetCustomerDetails(CUSTCODE, CUSTNAME, CUSTPHONE, EMAIL);
                if (tempOrderType === "Cash") {
                  setCashOrder(true);
                  setCreditOrder(false);
                } else {
                  setCashOrder(false), setCreditOrder(true);
                }
              }}
              GetOrderType={tempOrderType === "Cash" ? "CASH" : "CREDIT"}
              OtherCustomer={() => OnClickOtherCustomers()}
            />
          </ModalShade>
          {CustomerSiteModal && (
            <ModalShade
              isVisible={CustomerSiteModal}
              style={{ margin: 0 }}
              onBackdropPress={() => {
                setCustomerSiteModal(false);
                setShowAllSites(false);
              }}
            >
              <CustomerSiteModall
                CloseSiteModal={() => {
                  setCustomerSiteModal(false);
                  setShowAllSites(false);
                }}
                OtherSite={() => OnClickOtherSite()}
                ClickSiteName={OnClickSite}
                orderType={
                  !showAllSites ? (CreditOrder ? "CREDIT" : "CASH") : null
                }
                customerCode={!showAllSites ? CustomerCode : null}
              />
            </ModalShade>
          )}
        </KeyboardAvoidingView>
      ) : (
        <ProductList
          GobackHome={() => props.navigation.navigate("Home")}
          CustomerDetailsObject={SentCustomerObject}
          CustomerType={CreditOrder}
          CustomerName={SentCustomerObject?.CUSTNAME}
          SiteName={Site}
          Slno={SLNO}
          notransport={NOTRANSPORT}
          isSubmitted={false}
        />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  DateButtonStyle: {
    width: W(315),
    borderColor: whiteColor,
    borderWidth: 0.5,
    paddingLeft: 10,
    justifyContent: "center",
    marginTop: 10,
    height: 30,
    borderLeftColor: whiteColor,
    borderRightColor: whiteColor,
    borderTopColor: whiteColor,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: 10,
    borderBottomColor: lightGreyTextInputColor,
  },
  OrderDateText: {
    fontFamily: fonts.Lato_Bold,
    marginTop: 20,
    marginLeft: 20,
    marginBottom: 5,
    fontSize: 16,
    color: darkGreyTextColor,
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
  },
  unselectRadioButton: {
    width: 16,
    height: 16,
    borderRadius: 16 / 2,
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
    fontFamily: fonts.Lato_Regular,
    fontSize: 16,
    color: lightGreyTextColor,
  },
  selectRadioIcon: {
    width: 16,
    height: 16,
  },
  NextIconView: {
    position: "absolute",
    marginRight: 30,
    bottom: "15%",
    right: 20,
  },
  CardStyle: {
    width: width - 30,
    // top: 10,
    flex: 0.9,
    marginTop: 10,
  },
  CustomerInfoText: {
    fontSize: 16,
    fontFamily: fonts.Lato_Bold,
    color: darkGreyTextColor,
    marginTop: 20,
    marginLeft: 20,
  },
  CustomerInputStyle: {
    width: W(320),
    borderWidth: 0.5,
    borderColor: whiteColor,
    borderBottomColor: lightGreyTextColor,
    paddingBottom: 10,
    paddingLeft: 10,
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  InputTextColor: {
    color: lightGreyTextColor,
    fontSize: 16,
    fontFamily: fonts.Lato_Regular,
  },
  OrderDateFieldText: {
    fontFamily: fonts.Lato_Regular,
    fontSize: 16,
    color: lightGreyTextColor,
  },
  DropdownImageStyle: {
    width: 16,
    height: 16,
    marginRight: 10,
  },
  InputErrorText: {
    fontSize: 12,
    fontFamily: fonts.Lato_Regular,
    color: "red",
    marginTop: 5,
  },
  checkBoxContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 10,
    marginVertical: 20,
  },
});
export default AddEditScheduleOrder;
