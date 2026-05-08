import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  FlatList,
  Keyboard,
  Alert,
} from 'react-native';
import {
  darkGreyTextColor,
  lightGreyTextColor,
  whiteColor,
  lightGreyTextInputColor,
  BlackColor,
  saperatorColor,
  RedTextColor,
} from '../../../utility/colors';
import {
  GreyArrowDown,
  CalenderIcon,
  CheckedTickIcon,
} from '../../../Images/index';
import SimpleTextfield from '../../CommonComponents/SimpleTextfield';
import DatePicker from 'react-native-date-picker';
import ListSeparator from '../../CommonComponents/ListSeparator';
import { fonts, W } from '../../../utility/GlobalStyles';
const moment = require('moment');
import ModalShade from 'react-native-modal';
import LoginButton from '../../CommonComponents/LoginButton';
const { width, height } = Dimensions.get('window');
import Strings from '../../../utility/strings';
import {
  GetAllDivisions,
  GetStocksByDivision,
  UpdateOrders,
} from '../../../utility/ApiHelpers/StagingApis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StockListModal from '../../CommonComponents/StockListModal';
import { useNavigation } from '@react-navigation/native';
import { formatPrice } from '../../../utility/helpers';
const UpdateProducts = props => {
  let { UpdateProductData, UpdateProduct, OrderType, CustomerName, SiteName } =
    props;
  console.log('CreditOrder', OrderType);
  //States
  const navigation = useNavigation();
  const [DivisionName, setDivisionName] = useState(
    UpdateProductData ? UpdateProductData?.DIVISION : 'Select Division',
  );
  const [ScheduleTime, setScheduleTime] = useState(new Date());
  const [ShowDivisionList, setShowDivisionList] = useState(false);
  const [ShowStockList, setShowStockList] = useState(false);
  const [StockName, setStockName] = useState(
    UpdateProductData ? UpdateProductData?.STOCKNAME : 'Select Stock',
  );
  const [StockCode, setStockCode] = useState(
    UpdateProductData ? UpdateProductData?.STOCKCODE : '',
  );
  const [IceSpec, setIceSpec] = useState(
    UpdateProductData ? UpdateProductData?.ICE : false,
  );
  const [PumpSpecs, setPumpSpecs] = useState(
    UpdateProductData ? UpdateProductData?.PUMP : false,
  );
  const [pipeFixing, setpipeFixing] = useState(
    UpdateProductData ? UpdateProductData?.PIPEFIXING : false,
  );
  const [Quantity, setQuantity] = useState(
    UpdateProductData ? UpdateProductData?.QTY : '',
  );
  const [ShowTimePicker, setShowTimePicker] = useState(false);
  const [ShowScheduleDatePicker, setShowScheduleDatePicker] = useState(false);
  const [Remark, setRemark] = useState(
    UpdateProductData ? UpdateProductData?.REMARKS : '',
  );
  const [ScheduleDate, setScheduleDate] = useState(
    UpdateProductData
      ? moment(UpdateProductData?.SCHEDULEDATE).format()
      : moment().format(),
  );
  const [DivisionList, setDivisionList] = useState([]);
  const [StockList, setStockList] = useState([]);
  const [keyboardStatus, setKeyboardStatus] = useState(undefined);
  const [UserToken, setUserToken] = useState(null);
  const [DivisionEmptyError, setDivisionEmptyError] = useState('');
  const [StockEmptyError, setStockEmptyError] = useState('');
  const [QuantityEmptyError, setQuantityEmptyError] = useState('');
  const [DateTimeError, setDateTimeError] = useState('');
  const [StockPrice, setStockPrice] = useState(
    UpdateProductData?.Rate
      ? formatPrice(UpdateProductData?.Rate, OrderType)
      : '',
  );

  //Effects

  useEffect(() => {
    getData();

    Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
    Keyboard.addListener('keyboardDidHide', _keyboardDidHide);

    // cleanup function
    return () => {
      Keyboard.removeListener('keyboardDidShow', _keyboardDidShow);
      Keyboard.removeListener('keyboardDidHide', _keyboardDidHide);
    };
  }, []);

  //Function

  const ValidateUpdateForm = (
    DivisionName,
    StockName,
    Quantity,
    ScheduleTime,
    ScheduleDate,
    Remark,
  ) => {
    var isValidate = 0;
    if (DivisionName === 'Select Division') {
      isValidate -= 1;
      setDivisionEmptyError(Strings.DivisionNullError);
    } else {
      isValidate += 1;
      setDivisionEmptyError('');
    }
    if (StockName === 'Select Stock') {
      isValidate -= 1;
      setStockEmptyError(Strings.StockNullError);
    } else {
      isValidate += 1;
      setStockEmptyError('');
    }
    if (Quantity === '' || Quantity === 'Quantity') {
      isValidate -= 1;
      setQuantityEmptyError(Strings.QuantityNullError);
    } else if (Quantity < 1) {
      isValidate -= 1;
      setQuantityEmptyError(Strings.QuantityNullError);
    } else {
      isValidate += 1;
      setQuantityEmptyError('');
    }
    let TodayDate = moment().format();
    let MomentDate = moment(ScheduleDate).format('YYYY-MM-DD');
    let MomentTime = moment(ScheduleTime).format('HH:mm:ss');
    let MomentDateTime = moment(MomentDate + 'T' + MomentTime).format();
    if (MomentDateTime >= TodayDate) {
      console.log(true);
      isValidate += 1;
    } else {
      console.log(false);
      isValidate -= 1;
      setDateTimeError(Strings.ScheduleTimeInvalidError);
    }
    if (isValidate === 4) {
      console.log('Save');
      OnSubmitOrder();
    }
  };

  //Callback Functions
  const UpdateOrderCallback = response => {
    navigation.navigate('Home');
  };

  const StockCallback = (response, Division) => {
    const StockListArray = response?.data.map(item => {
      return { label: item.STOCKCODE, value: item.STOCKNAME };
    });
    setStockList(StockListArray);
  };

  const DivisionCallBack = response => {
    let res = response?.data.map((item, index) => {
      let divObj = {
        label: index + 1,
        value: item,
      };
      return divObj;
    }, {});
    setDivisionList(res);
  };

  const GetAllDivisionsList = UserToken => {
    console.log('Get All Divisions Called');
    let DivisionObject = {
      UserToken: UserToken,
    };
    GetAllDivisions(DivisionObject, DivisionCallBack);
  };

  const _keyboardDidShow = () => setKeyboardStatus('Keyboard Shown');
  const _keyboardDidHide = () => setKeyboardStatus('Keyboard Hidden');

  const getData = async () => {
    try {
      const UserToken = await AsyncStorage.getItem('access_token');
      console.log('Userinfo token', UserToken);
      if (UserToken !== null) {
        setUserToken(UserToken);
        GetAllDivisionsList(UserToken);
        // GetAllStockList(UpdateProductData?.DIVISION, UserToken);
        HandleScheduleTime();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const HandleScheduleTime = () => {
    let NewDateTime = moment.utc(UpdateProductData?.SCHEDULETIME, 'HH:mm:ss');
    setScheduleTime(NewDateTime);
  };

  const onClickSpecsType = SpecsType => {
    console.log('SpecsType', SpecsType);
    if (SpecsType === 'Ice') {
      setIceSpec(!IceSpec);
    } else if (SpecsType === 'Pump') {
      setPumpSpecs(!PumpSpecs);
    } else if (SpecsType === 'Pipefixing') {
      setpipeFixing(!pipeFixing);
    } else {
      setIceSpec(false);
      setPumpSpecs(false);
      setpipeFixing(false);
    }
  };

  const onChanggeTime = selectedValue => {
    console.log('selectedValue', selectedValue);
    if (ShowTimePicker) {
      setShowTimePicker(!ShowTimePicker);
      setScheduleTime(selectedValue);
      setDateTimeError('');
    }
  };

  const onChangeScheduleDate = selectedValue => {
    setShowScheduleDatePicker(!ShowScheduleDatePicker);
    setScheduleDate(selectedValue);
  };

  const OnSelectDivisionName = divisionname => {
    console.log('Division Name Called', divisionname);
    setShowDivisionList(false);
    setShowStockList(false);
    setStockName('Select Stock');
    setDivisionEmptyError('');
    setDivisionName(divisionname);
    setStockPrice('');
    GetAllStockList(divisionname, UserToken);
  };

  const GetAllStockList = (divisionname, UserToken) => {
    console.log('divisionname token', divisionname, UserToken);
    let StockObject = {
      Division: divisionname,
      UserToken: UserToken,
    };
    GetStocksByDivision(StockObject, StockCallback);
  };

  const OnSelectStocknName = (stockname, stockcode, stockprice) => {
    console.log('stockname Name Called', stockname);
    setShowStockList(false);
    setStockName(stockname === 'READYMIX' ? 'Ready Mix' : stockname);
    setStockCode(stockcode);
    setStockPrice(stockprice);
    setStockEmptyError('');
  };

  const OnChangeQuantity = text => {
    console.log('quantity', text);
    setQuantity(text);
    setQuantityEmptyError('');
  };

  const OnChangeRemark = text => {
    console.log('quantity', text);
    setRemark(text);
  };

  const OnSubmitOrder = () => {
    let MomentDate = moment(ScheduleDate).format();
    let DashScheduleDate = MomentDate.substr(0, 10);
    let MomentTime = moment(ScheduleTime).format();
    let DashScheduleTime = MomentTime.substr(11, 8);

    let UpdatedOrderObject = {
      ORDERID: UpdateProductData?.SLNO,
      ORDERDATE: UpdateProductData?.ORDERDATE,
      ORDERTYPE: UpdateProductData?.ORDERTYPE,
      NEWCUST: 0,
      CUSTCODE: UpdateProductData?.CUSTCODE,
      CUSTNAME: UpdateProductData?.CUSTNAME,
      PHONENO: UpdateProductData?.PHONENO,
      NEWSITE: 0,
      SITENAME: UpdateProductData?.SITENAME,
      DIVISION: DivisionName,
      STOCKCODE: StockCode,
      STOCKNAME: StockName,
      QTY: Quantity,
      ICE: IceSpec ? 1 : 0,
      PUMP: PumpSpecs ? 1 : 0,
      PIPEFIXING: pipeFixing ? 1 : 0,
      SCHEDULEDATE: DashScheduleDate,
      SCHEDULETIME: DashScheduleTime,
      REMARKS: Remark,
      STOCKPRICE: StockPrice,
      Rate: StockPrice,
    };
    console.log('UpdatedOrderObject', UpdatedOrderObject);
    UpdateOrders(UpdatedOrderObject, UpdateOrderCallback, UserToken);
  };

  //Render
  const RenderDivisionData = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => OnSelectDivisionName(item?.value)}
        style={{ width: '100%', height: 40, justifyContent: 'center' }}
      >
        <Text style={{ paddingLeft: 50 }}>{item?.value}</Text>
      </TouchableOpacity>
    );
  };

  const renderDivisionSeparator = () => {
    return <ListSeparator />;
  };

  const RenderDivisionListEmpty = () => {
    return (
      <View>
        <Text>No Divisions Found</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {UpdateProduct ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          enabled
          keyboardVerticalOffset={
            Platform.OS === 'ios'
              ? keyboardStatus === 'Keyboard Shown'
                ? 0
                : 200
              : keyboardStatus === 'Keyboard Shown'
              ? 0
              : 120
          }
        >
          <ScrollView>
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => setShowDivisionList(!ShowDivisionList)}
                style={styles.DateButtonStyle}
              >
                <Text style={styles.DivisionNameTextStyle}>
                  {DivisionName === 'READYMIX' ? 'Ready Mix' : DivisionName}
                </Text>
                <Image
                  resizeMode="contain"
                  source={GreyArrowDown}
                  style={styles.CalenderIconStyle}
                />
              </TouchableOpacity>
            </View>

            {ShowDivisionList ? (
              <FlatList
                data={DivisionList}
                extraData={DivisionList}
                ListEmptyComponent={RenderDivisionListEmpty}
                ItemSeparatorComponent={renderDivisionSeparator}
                renderItem={RenderDivisionData}
                keyExtractor={item => item.id}
              />
            ) : (
              false
            )}
            {DivisionEmptyError === '' ? (
              false
            ) : (
              <Text style={styles.InputErrorText}>{DivisionEmptyError}</Text>
            )}

            <View style={{ alignItems: 'center', marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => setShowStockList(!ShowStockList)}
                style={styles.StockButtonStyle}
              >
                <View style={{ width: W(280) }}>
                  {StockPrice ? (
                    <Text style={styles.DivisionNameTextStyle}>
                      {StockName} ({StockPrice})
                    </Text>
                  ) : (
                    <Text style={styles.DivisionNameTextStyle}>
                      {StockName}
                    </Text>
                  )}
                </View>
                <Image
                  resizeMode="contain"
                  source={GreyArrowDown}
                  style={styles.CalenderIconStyle}
                />
              </TouchableOpacity>
            </View>
            {StockEmptyError === '' ? (
              false
            ) : (
              <Text style={styles.InputErrorText}>{StockEmptyError}</Text>
            )}

            {DivisionName === 'Ready Mix' || DivisionName === 'READYMIX' ? (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.ScheduleDateText}>{Strings.Specs}</Text>

                <View style={styles.radioBtnRowStyle}>
                  {IceSpec ? (
                    <TouchableOpacity
                      onPress={() => onClickSpecsType('Ice')}
                      style={styles.radioBtnRowTouch}
                    >
                      <Image
                        source={CheckedTickIcon}
                        style={styles.selectRadioIcon}
                      />
                      <Text style={styles.radioBtnTxt}>{Strings.Ice}</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => onClickSpecsType('Ice')}
                      style={styles.radioBtnRowTouch}
                    >
                      <View style={styles.unspecButton} />
                      <Text style={styles.radioBtnTxt}>{Strings.Ice}</Text>
                    </TouchableOpacity>
                  )}
                  {PumpSpecs ? (
                    <TouchableOpacity
                      onPress={() => onClickSpecsType('Pump')}
                      style={styles.radioBtnRowTouch}
                    >
                      <Image
                        source={CheckedTickIcon}
                        style={styles.selectRadioIcon}
                      />
                      <Text style={styles.radioBtnTxt}>{Strings.Pump}</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => onClickSpecsType('Pump')}
                      style={styles.radioBtnRowTouch}
                    >
                      <View style={styles.unspecButton} />
                      <Text style={styles.radioBtnTxt}>{Strings.Pump}</Text>
                    </TouchableOpacity>
                  )}
                  {pipeFixing ? (
                    <TouchableOpacity
                      onPress={() => onClickSpecsType('Pipefixing')}
                      style={styles.radioBtnRowTouch}
                    >
                      <Image
                        source={CheckedTickIcon}
                        style={styles.selectRadioIcon}
                      />
                      <Text style={styles.radioBtnTxt}>
                        {Strings.PipeFixing}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => onClickSpecsType('Pipefixing')}
                      style={styles.radioBtnRowTouch}
                    >
                      <View style={styles.unspecButton} />
                      <Text style={styles.radioBtnTxt}>
                        {Strings.PipeFixing}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ) : (
              false
            )}

            <SimpleTextfield
              placeholder={Strings.Quantity}
              fontSize={16}
              placeholderTextColor={lightGreyTextColor}
              value={Quantity}
              keyboardType={'number-pad'}
              onChangeText={OnChangeQuantity}
            />
            {QuantityEmptyError === '' ? (
              false
            ) : (
              <Text style={[styles.InputErrorText, { marginTop: -2 }]}>
                {QuantityEmptyError}
              </Text>
            )}

            <Text style={styles.ScheduleTimeText}>{Strings.ScheduleTime}</Text>
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => setShowTimePicker(!ShowTimePicker)}
                style={styles.DateButtonStyle}
              >
                <Text style={styles.DivisionNameTextStyle}>
                  {moment(ScheduleTime).format('LT')}
                </Text>
                <Image
                  resizeMode="contain"
                  source={CalenderIcon}
                  style={styles.CalenderIconStyle}
                />
              </TouchableOpacity>
            </View>
            {DateTimeError === '' ? (
              false
            ) : (
              <Text style={styles.InputErrorText}>{DateTimeError}</Text>
            )}
            <Text style={styles.ScheduleTimeText}>{Strings.ScheduleDate}</Text>
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() =>
                  setShowScheduleDatePicker(!ShowScheduleDatePicker)
                }
                style={styles.DateButtonStyle}
              >
                <Text style={styles.DivisionNameTextStyle}>
                  {moment(ScheduleDate).format('LL')}
                </Text>
                <Image
                  resizeMode="contain"
                  source={CalenderIcon}
                  style={styles.CalenderIconStyle}
                />
              </TouchableOpacity>
            </View>

            <DatePicker
              modal
              open={ShowTimePicker}
              date={
                ScheduleTime instanceof Date
                  ? ScheduleTime
                  : new Date(ScheduleTime)
              }
              mode="time"
              onConfirm={onChanggeTime}
              onCancel={() => setShowTimePicker(!ShowTimePicker)}
            />

            <DatePicker
              modal
              open={ShowScheduleDatePicker}
              date={
                ScheduleDate instanceof Date
                  ? ScheduleDate
                  : new Date(ScheduleDate)
              }
              mode="date"
              minimumDate={new Date()}
              onConfirm={onChangeScheduleDate}
              onCancel={() =>
                setShowScheduleDatePicker(!ShowScheduleDatePicker)
              }
            />

            <View style={{ marginTop: 10 }}>
              <SimpleTextfield
                placeholder={Strings.Remark}
                fontSize={16}
                placeholderTextColor={lightGreyTextColor}
                value={Remark}
                onChangeText={OnChangeRemark}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          enabled
          keyboardVerticalOffset={
            Platform.OS === 'ios'
              ? keyboardStatus === 'Keyboard Shown'
                ? 0
                : 200
              : keyboardStatus === 'Keyboard Shown'
              ? 0
              : 120
          }
        >
          <ScrollView>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.TimeUpMessageText}>
                *{Strings.TimeUpMessage}
              </Text>
              <View
                onPress={() => setShowDivisionList(!ShowDivisionList)}
                style={styles.DateButtonStyle}
              >
                <Text style={styles.DivisionNameTextStyle}>
                  {DivisionName === 'READYMIX' ? 'Ready Mix' : DivisionName}
                </Text>
                <Image
                  resizeMode="contain"
                  source={GreyArrowDown}
                  style={styles.CalenderIconStyle}
                />
              </View>
            </View>

            {ShowDivisionList ? (
              <FlatList
                data={DivisionList}
                extraData={DivisionList}
                ListEmptyComponent={RenderDivisionListEmpty}
                ItemSeparatorComponent={renderDivisionSeparator}
                renderItem={RenderDivisionData}
                keyExtractor={item => item.id}
              />
            ) : (
              false
            )}
            {DivisionEmptyError === '' ? (
              false
            ) : (
              <Text style={styles.InputErrorText}>{DivisionEmptyError}</Text>
            )}

            <View style={{ alignItems: 'center', marginTop: 20 }}>
              <View
                onPress={() => setShowStockList(!ShowStockList)}
                style={styles.DateButtonStyle}
              >
                <Text style={styles.DivisionNameTextStyle}>{StockName}</Text>
                <Image
                  resizeMode="contain"
                  source={GreyArrowDown}
                  style={styles.CalenderIconStyle}
                />
              </View>
            </View>
            {StockEmptyError === '' ? (
              false
            ) : (
              <Text style={styles.InputErrorText}>{StockEmptyError}</Text>
            )}

            {DivisionName === 'Ready Mix' || DivisionName === 'READYMIX' ? (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.ScheduleDateText}>{Strings.Specs}</Text>

                <View style={styles.radioBtnRowStyle}>
                  {IceSpec ? (
                    <View
                      onPress={() => onClickSpecsType('Ice')}
                      style={styles.radioBtnRowTouch}
                    >
                      <Image
                        source={CheckedTickIcon}
                        style={styles.selectRadioIcon}
                      />
                      <Text style={styles.radioBtnTxt}>{Strings.Ice}</Text>
                    </View>
                  ) : (
                    <View
                      onPress={() => onClickSpecsType('Ice')}
                      style={styles.radioBtnRowTouch}
                    >
                      <View style={styles.unspecButton} />
                      <Text style={styles.radioBtnTxt}>{Strings.Ice}</Text>
                    </View>
                  )}
                  {PumpSpecs ? (
                    <View
                      onPress={() => onClickSpecsType('Pump')}
                      style={styles.radioBtnRowTouch}
                    >
                      <Image
                        source={CheckedTickIcon}
                        style={styles.selectRadioIcon}
                      />
                      <Text style={styles.radioBtnTxt}>{Strings.Pump}</Text>
                    </View>
                  ) : (
                    <View
                      onPress={() => onClickSpecsType('Pump')}
                      style={styles.radioBtnRowTouch}
                    >
                      <View style={styles.unspecButton} />
                      <Text style={styles.radioBtnTxt}>{Strings.Pump}</Text>
                    </View>
                  )}
                  {pipeFixing ? (
                    <View
                      onPress={() => onClickSpecsType('Pipefixing')}
                      style={styles.radioBtnRowTouch}
                    >
                      <Image
                        source={CheckedTickIcon}
                        style={styles.selectRadioIcon}
                      />
                      <Text style={styles.radioBtnTxt}>
                        {Strings.PipeFixing}
                      </Text>
                    </View>
                  ) : (
                    <View
                      onPress={() => onClickSpecsType('Pipefixing')}
                      style={styles.radioBtnRowTouch}
                    >
                      <View style={styles.unspecButton} />
                      <Text style={styles.radioBtnTxt}>
                        {Strings.PipeFixing}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ) : (
              false
            )}
            <View style={{ alignItems: 'center', marginTop: '10%' }}>
              <View
                style={{
                  width: W(320),
                  borderBottomColor: saperatorColor,
                  borderBottomWidth: 1,
                  paddingBottom: 10,
                  paddingLeft: 10,
                }}
              >
                <Text
                  style={{
                    color: lightGreyTextColor,
                    fontSize: 16,
                    fontFamily: fonts.Lato_Regular,
                  }}
                >
                  {Quantity}
                </Text>
              </View>
            </View>
            <Text style={styles.ScheduleTimeText}>{Strings.ScheduleTime}</Text>
            <View style={{ alignItems: 'center' }}>
              <View
                onPress={() => setShowTimePicker(!ShowTimePicker)}
                style={styles.DateButtonStyle}
              >
                <Text style={styles.DivisionNameTextStyle}>
                  {moment(ScheduleTime).format('LT')}
                </Text>
                <Image
                  resizeMode="contain"
                  source={CalenderIcon}
                  style={styles.CalenderIconStyle}
                />
              </View>
            </View>
            {DateTimeError === '' ? (
              false
            ) : (
              <Text style={styles.InputErrorText}>{DateTimeError}</Text>
            )}
            <Text style={styles.ScheduleTimeText}>{Strings.ScheduleDate}</Text>
            <View style={{ alignItems: 'center' }}>
              <View
                onPress={() =>
                  setShowScheduleDatePicker(!ShowScheduleDatePicker)
                }
                style={styles.DateButtonStyle}
              >
                <Text style={styles.DivisionNameTextStyle}>
                  {moment(ScheduleDate).format('LL')}
                </Text>
                <Image
                  resizeMode="contain"
                  source={CalenderIcon}
                  style={styles.CalenderIconStyle}
                />
              </View>
            </View>

            <DatePicker
              modal
              open={ShowTimePicker}
              date={
                ScheduleTime instanceof Date
                  ? ScheduleTime
                  : new Date(ScheduleTime)
              }
              mode="time"
              onConfirm={onChanggeTime}
              onCancel={() => setShowTimePicker(!ShowTimePicker)}
            />

            <DatePicker
              modal
              open={ShowScheduleDatePicker}
              date={
                ScheduleDate instanceof Date
                  ? ScheduleDate
                  : new Date(ScheduleDate)
              }
              mode="date"
              minimumDate={new Date()}
              onConfirm={onChangeScheduleDate}
              onCancel={() =>
                setShowScheduleDatePicker(!ShowScheduleDatePicker)
              }
            />

            <View style={{ alignItems: 'center', marginTop: '10%' }}>
              <View
                style={{
                  width: W(320),
                  borderBottomColor: saperatorColor,
                  borderBottomWidth: 1,
                  paddingBottom: 10,
                  paddingLeft: 10,
                }}
              >
                <Text
                  style={{
                    color: lightGreyTextColor,
                    fontSize: 16,
                    fontFamily: fonts.Lato_Regular,
                  }}
                >
                  {Remark}
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
      {keyboardStatus === 'Keyboard Shown' ? (
        false
      ) : (
        <View style={{ alignItems: 'center', marginBottom: '5%' }}>
          {UpdateProduct ? (
            <LoginButton
              title={'Submit'}
              onPress={() =>
                ValidateUpdateForm(
                  DivisionName,
                  StockName,
                  Quantity,
                  ScheduleTime,
                  ScheduleDate,
                  Remark,
                )
              }
            />
          ) : (
            <LoginButton
              title={'Submit'}
              onPress={() => navigation.navigate('Home')}
            />
          )}
        </View>
      )}
      <ModalShade
        isVisible={ShowStockList}
        onBackdropPress={() => setShowStockList(false)}
      >
        <StockListModal
          CloseStockModal={() => setShowStockList(false)}
          SetStockNameFunc={OnSelectStocknName}
          Division={DivisionName}
          CreditOrder={OrderType}
          CustomerName={CustomerName}
          SiteName={SiteName}
        />
      </ModalShade>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: whiteColor,
    paddingTop: '10%',
  },
  AddProductModalContainer: {
    flex: 0.95,
    backgroundColor: whiteColor,
    top: 80,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 70,
  },
  AddItemCancelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 30,
  },
  AddItemModalText: {
    fontSize: 18,
    fontFamily: fonts.Lato_Bold,
    color: BlackColor,
  },

  CancelIconStyle: {
    width: 18,
    height: 18,
  },
  DropdownIconStyle: {
    width: 20,
    height: 20,
  },
  CalenderIconStyle: {
    width: 18,
    height: 18,
    marginBottom: 4,
  },
  DateButtonStyle: {
    width: W(320),
    borderColor: whiteColor,
    borderWidth: 0.5,
    paddingLeft: 10,
    justifyContent: 'center',
    marginTop: 10,
    height: 35,
    borderLeftColor: whiteColor,
    borderRightColor: whiteColor,
    borderTopColor: whiteColor,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    borderBottomColor: lightGreyTextInputColor,
  },
  StockButtonStyle: {
    width: W(320),
    borderColor: whiteColor,
    borderWidth: 0.5,
    paddingLeft: 10,
    justifyContent: 'center',
    marginTop: 10,
    height: 60,
    borderLeftColor: whiteColor,
    borderRightColor: whiteColor,
    borderTopColor: whiteColor,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    borderBottomColor: lightGreyTextInputColor,
  },

  radioBtnRowTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  radioBtnRowStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginLeft: 25,
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
  ScheduleDateText: {
    fontFamily: fonts.Lato_Bold,
    marginTop: 20,
    marginLeft: 30,
    color: darkGreyTextColor,
  },
  ScheduleTimeText: {
    fontFamily: fonts.Lato_Bold,
    fontSize: 16,
    marginLeft: 30,
    color: darkGreyTextColor,
    marginTop: 20,
  },
  DivisionNameTextStyle: {
    fontFamily: fonts.Lato_Regular,
    fontSize: 16,
    color: lightGreyTextColor,
  },
  InputErrorText: {
    fontSize: 12,
    fontFamily: fonts.Lato_Regular,
    color: 'red',
    marginTop: 5,
    marginLeft: 35,
  },
  TimeUpMessageText: {
    color: RedTextColor,
    fontFamily: fonts.Lato_Bold,
    fontSize: 12,
    paddingBottom: 20,
  },
});

export default UpdateProducts;
