import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import {
  lightGreyTextColor,
  whiteColor,
  darkGreyTextColor,
  lightGreyTextInputColor,
  primaryColor,
} from '../../../utility/colors';
import { W, H, fonts } from '../../../utility/GlobalStyles';
import HeaderComponent from '../../CommonComponents/Header';
const moment = require('moment');
import { CheckedIcon, CalenderIcon } from '../../../Images/index';
import LoginButton from '../../CommonComponents/LoginButton';
import DatePicker from 'react-native-date-picker';
import Card from '../../CommonComponents/Card';
import CustomerListModal from '../../CommonComponents/CustomerListModal';
import ModalShade from 'react-native-modal';
import Strings from '../../../utility/strings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProductList from '../AddProduct/ProductList';
import CheckBox from '@react-native-community/checkbox';
import NetInfo from '@react-native-community/netinfo';
import { UpdateZeroVat } from '../../../utility/ApiHelpers/StagingApis';
import OfflineNotice from '../../CommonComponents/OfflineNotice';
const { width } = Dimensions.get('window');

const UpdateOrders = props => {
  // Props
  const UpdateOrder = props.route.params?.OrderListItem;
  const UpdateProduct = props.route.params?.UpdateProduct;
  const isSubmitted = props.route.params?.isSubmitted;

  // Effect
  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const UserToken = await AsyncStorage.getItem('access_token');
      const UserInfo = await AsyncStorage.getItem('userinfo');

      if (UserToken !== null) {
        setUserToken(UserToken);
        //  setSalesMan(UserInfo?.SALESMAN)
      }
    } catch (e) {
      console.error(e);
    }
  };

  // States
  const [toggleCheckBox, setToggleCheckBox] = useState(
    UpdateOrder ? UpdateOrder.ZEROVAT : false,
  );
  const [toggleCheckBoxTemp, setToggleCheckBoxTemp] = useState(
    UpdateOrder ? UpdateOrder.ZEROVAT : false,
  );
  const [ProductData, setProductData] = useState([]);
  const [OrderDate, setOrderDate] = useState(
    UpdateOrder ? moment(UpdateOrder?.ORDERDATE).format() : new Date(),
  );
  const [ShowDatePicker, setShowDatePicker] = useState(false);
  const [CustomerName, setCustomerName] = useState(
    UpdateOrder ? UpdateOrder.CUSTNAME : 'Customer Name',
  );
  const [CustomerCode, setCustomerCode] = useState(
    UpdateOrder ? UpdateOrder.CUSTCODE : 'Customer Code',
  );
  const [PhoneNo, setPhoneNo] = useState(
    UpdateOrder ? UpdateOrder.PHONENO : 'Phone No',
  );
  const [Site, setSite] = useState(UpdateOrder ? UpdateOrder.SITENAME : '');
  const [SalesMan, setSalesMan] = useState(
    UpdateOrder ? UpdateOrder.AddedBy : 'Sales Person',
  );
  const [CashOrder, setCashOrder] = useState(false);
  const [CreditOrder, setCreditOrder] = useState(
    UpdateOrder?.ORDERTYPE === 'CREDIT' ? true : false,
  );
  const [Index1, setIndex1] = useState(true);
  const [Index2, setIndex2] = useState(false);
  const [CustomerModal, setCustomerModal] = useState(false);
  const [UserToken, setUserToken] = useState('');
  const [OrderType, setOrderType] = useState(
    UpdateOrder ? UpdateOrder.ORDERTYPE : null,
  );
  const [InternetStatus, setInternetStatus] = useState(true);
  const [toggleTransactionFee, setToggleTansactionFee] = useState(
    UpdateOrder ? UpdateOrder.NOTRANSPORT : false,
  );
  const [toggleTransactionFeeTemp, setToggleTansactionFeeTemp] = useState(
    UpdateOrder ? UpdateOrder.NOTRANSPORT : false,
  );

  useEffect(() => {
    NetInfo.addEventListener(state => {
      setInternetStatus(state.isConnected);
    });
  }, [InternetStatus]);

  // Functions
  const SetCustomerDetails = (CustomerCode, CustomerName, Id, PhoneNo) => {
    setCustomerCode(CustomerCode);
    setCustomerName(CustomerName);
    setPhoneNo(PhoneNo);
    setCustomerModal(false);
  };

  const onChange = selectedValue => {
    if (ShowDatePicker) {
      setShowDatePicker(!ShowDatePicker);
      setOrderDate(selectedValue);
    }
  };

  const OnClickNext = () => {
    if (
      toggleCheckBoxTemp !== toggleCheckBox ||
      toggleTransactionFeeTemp !== toggleTransactionFee
    ) {
      UpdateZeroVat(
        toggleTransactionFee,
        toggleCheckBox,
        UpdateOrder?.SLNO,
        UserToken,
        () => {
          setIndex1(false);
          setIndex2(true);
          setToggleCheckBoxTemp(!toggleCheckBoxTemp);
          setToggleTansactionFeeTemp(!toggleTransactionFeeTemp);
          if (ProductData.length === 0) {
            onAddMore();
          } else {
            false;
          }
        },
      );
    } else {
      setIndex1(false);
      setIndex2(true);
      if (ProductData.length === 0) {
        onAddMore();
      } else {
        false;
      }
    }
  };

  const onClickBack = () => {
    if (Index2 === true) {
      setIndex2(false);
      setIndex1(true);
    } else {
      props.navigation.goBack();
    }
  };

  const onClickOrderType = OrderType => {
    if (OrderType === 'Cash') {
      setCashOrder(!CashOrder);
      setCreditOrder(false);
      setCustomerModal(true);
    } else if (OrderType === 'Credit') {
      setCreditOrder(!CreditOrder);
      setCashOrder(false);
      setCustomerModal(true);
    } else {
      setCreditOrder(false);
      setCashOrder(false);
      setCustomerModal(false);
    }
  };

  const onAddMore = () => {
    setProductData([
      ...ProductData,
      {
        Division: '',
        Quantinty: '',
        OrderTime: new Date(),
        ScheduleDate: new Date(),
        Remark: '',
      },
    ]);
  };

  const toggleVatPercentage = newValue => {
    setToggleCheckBox(newValue);
  };

  const toggleTransactionFees = newValue => {
    setToggleTansactionFee(false);
  };

  //Render

  return (
    <View style={styles.container}>
      <HeaderComponent
        BackTitle={true}
        Title="Update Orders"
        onBackPress={() => onClickBack()}
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
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          style={{ flex: 0.9, alignItems: 'center' }}
        >
          <Card disabled={true} style={styles.CardStyle}>
            <ScrollView>
              <Text style={styles.OrderDateText}>{Strings.OrderDate}</Text>
              <View style={{ alignItems: 'center' }}>
                <View
                  onPress={() => setShowDatePicker(!ShowDatePicker)}
                  style={styles.DateButtonStyle}
                >
                  <Text style={styles.OrderDateFieldText}>
                    {moment(OrderDate).format('LL')}
                  </Text>
                  <Image
                    resizeMode="contain"
                    source={CalenderIcon}
                    style={styles.selectRadioIcon}
                  />
                </View>
              </View>
              <Text style={[styles.OrderDateText, { marginTop: 30 }]}>
                {Strings.OrderType}
              </Text>
              <View style={[styles.radioBtnRowStyle, { marginLeft: 20 }]}>
                <Image source={CheckedIcon} style={styles.selectRadioIcon} />
                <Text style={styles.radioBtnTxt}>{OrderType}</Text>
              </View>

              <View>
                <View style={{ alignItems: 'center' }}>
                  <View style={styles.CustomerInputStyle}>
                    <Text style={styles.InputTextColor}>{CustomerName}</Text>
                  </View>

                  <View style={styles.CustomerInputStyle}>
                    <Text style={styles.InputTextColor}>{CustomerCode}</Text>
                  </View>

                  <View style={styles.CustomerInputStyle}>
                    <Text style={styles.InputTextColor}>
                      {PhoneNo === null ? 'Phone No' : PhoneNo}
                    </Text>
                  </View>
                </View>

                <View style={{ alignItems: 'center' }}>
                  <View style={styles.CustomerInputStyle}>
                    <Text style={styles.InputTextColor}>{Site}</Text>
                  </View>
                </View>

                <View style={{ alignItems: 'center' }}>
                  <View style={styles.CustomerInputStyle}>
                    <Text style={styles.InputTextColor}>{SalesMan}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity
                    style={styles.checkBoxContainer}
                    onPress={() => toggleVatPercentage(!toggleCheckBox)}
                    disabled={UpdateOrder?.SUBMITTED}
                  >
                    <CheckBox
                      disabled={UpdateOrder?.SUBMITTED}
                      value={toggleCheckBox}
                      onValueChange={toggleVatPercentage}
                      style={{ marginRight: 10 }}
                      tintColors={{ true: primaryColor }}

                      // tintColor={primaryColor}
                    />
                    <Text style={styles.InputTextColor}>ZERO VAT(%)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.checkBoxContainer}
                    onPress={() => toggleTransactionFees(!toggleTransactionFee)}
                    disabled={UpdateOrder?.SUBMITTED}
                  >
                    <CheckBox
                      disabled={UpdateOrder?.SUBMITTED}
                      value={toggleTransactionFee}
                      onValueChange={toggleTransactionFees}
                      style={{ marginRight: 10 }}
                      tintColors={{ true: primaryColor }}

                      // tintColor={primaryColor}
                    />
                    <Text style={styles.InputTextColor}>
                      No Transaction Fee
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <DatePicker
              modal
              open={ShowDatePicker}
              date={OrderDate instanceof Date ? OrderDate : new Date(OrderDate)}
              mode="date"
              minimumDate={new Date()}
              onConfirm={onChange}
              onCancel={() => setShowDatePicker(!ShowDatePicker)}
            />
          </Card>
          <View>
            <LoginButton onPress={() => OnClickNext()} title="NEXT" />
          </View>

          <ModalShade
            isVisible={CustomerModal}
            style={{ margin: 0 }}
            onBackdropPress={() => setCustomerModal(false)}
          >
            <CustomerListModal
              CloseCustomerModal={() => setCustomerModal(false)}
              SetCustomerDetailsFunc={SetCustomerDetails}
            />
          </ModalShade>
        </KeyboardAvoidingView>
      ) : (
        <ProductList
          GobackHome={() => props.navigation.goBack()}
          CustomerType={CreditOrder}
          CustomerName={CustomerName}
          SiteName={Site}
          Slno={UpdateOrder?.SLNO}
          isSubmitted={isSubmitted}
        />
      )}
      {/* <UpdateProducts
          UpdateProductData={UpdateOrder}
          UpdateProduct={UpdateProduct}
          OrderType = {UpdateOrder?.ORDERTYPE === "CREDIT"?true: false}
          CustomerName = {CustomerName}
          SiteName = {Site}

        /> */}
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
    justifyContent: 'center',
    marginTop: 10,
    height: 30,
    borderLeftColor: whiteColor,
    borderRightColor: whiteColor,
    borderTopColor: whiteColor,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginLeft: 10,
  },
  radioBtnRowTouch: {
    flexDirection: 'row',
    alignItems: 'center',
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
    position: 'absolute',
    marginRight: 30,
    bottom: '15%',
    right: 20,
  },
  CardStyle: {
    width: width - 30,
    top: 10,
    flex: 0.92,
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
  checkBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    marginVertical: 20,
  },
});

export default UpdateOrders;
