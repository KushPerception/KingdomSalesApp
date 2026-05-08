import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  FlatList,
  Keyboard,
  Alert,
} from "react-native";
import {
  darkGreyTextColor,
  lightGreyTextColor,
  primaryColor,
  whiteColor,
  lightGreyTextInputColor,
  BlackColor,
} from "../../utility/colors";
import {
  CancelIcon,
  GreyArrowDown,
  CalenderIcon,
  CheckedTickIcon,
} from "../../Images/index";
import SimpleTextfield from "../CommonComponents/SimpleTextfield";
import DatePicker from "react-native-date-picker";
import ListSeparator from "../CommonComponents/ListSeparator";
import { fonts, W } from "../../utility/GlobalStyles";
const moment = require("moment");
import ModalShade from "react-native-modal";
import SaveButton from "../CommonComponents/SaveButton";
const { width, height } = Dimensions.get("window");
import Strings from "../../utility/strings";
import { GetAllDivisions } from "../../utility/ApiHelpers/StagingApis";
import AsyncStorage from "@react-native-async-storage/async-storage";
import StockListModal from "./StockListModal";
import LoginButton from "../CommonComponents/LoginButton";
import { formatPrice } from "../../utility/helpers";
import LoaderComponent from "./LoaderComponent";

const AddEditProductModal = (props) => {
  let {
    CloseModal,
    EditProductListItem,
    HandleEditProductItem,
    CreditOrder,
    CustomerName,
    SiteName,
    notransport,
  } = props;
  useEffect(() => {
    let EditTimeDate =
      EditProductListItem?.SCHEDULEDATE +
      "T" +
      EditProductListItem?.SCHEDULETIME;
    let MomentTime = moment(EditTimeDate).format();
    setScheduleTime(MomentTime);
  }, []);

  //States

  const discountInput = useRef(null);

  const [loading, setLoading] = useState(false);

  const [DivisionName, setDivisionName] = useState(
    EditProductListItem ? EditProductListItem.DIVISION : "Select Division"
  );
  const [ScheduleTime, setScheduleTime] = useState(moment().format());
  const [ShowDivisionList, setShowDivisionList] = useState(false);
  const [ShowStockList, setShowStockList] = useState(false);
  const [StockName, setStockName] = useState(
    EditProductListItem ? EditProductListItem?.STOCKNAME : "Select Stock"
  );
  const [IceSpec, setIceSpec] = useState(
    EditProductListItem?.ICE == 1 ? true : false
  );
  const [Transport, setTransport] = useState(
    EditProductListItem?.TRANSPORT == 1 ? true : false
  );
  const [PumpSpecs, setPumpSpecs] = useState(
    EditProductListItem?.PUMP == 1 ? true : false
  );
  const [pipeFixing, setpipeFixing] = useState(
    EditProductListItem?.PIPEFIXING == 1 ? true : false
  );
  const [Quantity, setQuantity] = useState(
    EditProductListItem?.QTY ? EditProductListItem?.QTY : "Quantity"
  );
  const [Discount, setDiscount] = useState(
    EditProductListItem?.DISRATE ? EditProductListItem?.DISRATE : "Discount"
  );
  const [ShowTimePicker, setShowTimePicker] = useState(false);
  const [ShowScheduleDatePicker, setShowScheduleDatePicker] = useState(false);
  const [Remark, setRemark] = useState(
    EditProductListItem ? EditProductListItem?.REMARKS : ""
  );
  const [ScheduleDate, setScheduleDate] = useState(
    EditProductListItem ? EditProductListItem.SCHEDULEDATE : moment().format()
  );
  const [DivisionList, setDivisionList] = useState([]);
  const [StockList, setStockList] = useState([]);
  const [keyboardStatus, setKeyboardStatus] = useState(undefined);
  const [UserToken, setUserToken] = useState(null);
  const [StockCode, setStockCode] = useState(
    EditProductListItem?.STOCKCODE
      ? EditProductListItem?.STOCKCODE
      : "Select Stock"
  );
  const [ProductSrNo, setProductSrNo] = useState(
    EditProductListItem?.SLNO ? EditProductListItem?.SLNO : ""
  );
  const [DivisionNameError, setDivisionNameError] = useState("");
  const [StockNameError, setStockNameError] = useState("");
  const [QuantityError, setQuantityError] = useState("");
  const [DiscountError, setDiscountError] = useState("");
  const [RemarkError, setRemarkError] = useState("");
  const [DateTimeError, setDateTimeError] = useState("");
  const [StockPrice, setStockPrice] = useState(
    EditProductListItem ? EditProductListItem?.Rate : "0.000"
  );
  //Effects

  useEffect(() => {
    getData();
    Keyboard.addListener("keyboardDidShow", _keyboardDidShow);
    Keyboard.addListener("keyboardDidHide", _keyboardDidHide);
    // cleanup function
    return () => {
      Keyboard.removeListener("keyboardDidShow", _keyboardDidShow);
      Keyboard.removeListener("keyboardDidHide", _keyboardDidHide);
    };
  }, []);

  //Function

  const ValidateEditForm = (
    DivisionName,
    StockName,
    Quantity,
    ScheduleTime,
    ScheduleDate,
    Remark,
    Discount
  ) => {
    var isValidate = 0;

    let TodayDate = moment().format();
    let MomentDate = moment(ScheduleDate).format("YYYY-MM-DD");
    let MomentTime = moment(ScheduleTime).format("HH:mm:ss");
    let MomentDateTime = moment(MomentDate + "T" + MomentTime).format();
    if (MomentDateTime >= TodayDate) {
      console.log(true);
      isValidate += 1;
    } else {
      console.log(false);
      isValidate -= 1;
      setDateTimeError(Strings.ScheduleTimeInvalidError);
    }
    if (DivisionName === "Select Division") {
      isValidate -= 1;
      setDivisionNameError(Strings.DivisionNullError);
    } else {
      isValidate += 1;
      setDivisionNameError("");
    }
    if (StockName === "Select Stock") {
      isValidate -= 1;
      setStockNameError(Strings.StockNullError);
    } else {
      isValidate += 1;
      setStockNameError("");
    }
    if (Quantity === "" || Quantity === "Quantity") {
      isValidate -= 1;
      setQuantityError(Strings.QuantityNullError);
    } else if (Quantity === "0") {
      isValidate -= 1;
      setQuantityError(Strings.QuantityNullError);
    } else {
      isValidate += 1;
      setQuantityError("");
    }
    if (Number(Discount) > Number(StockPrice) || Discount === "Discount") {
      isValidate -= 1;
      setDiscountError("Please enter valid discount value.");
    } else if (Discount === "") {
      isValidate -= 1;
      setDiscountError("Please enter valid discount value.");
    } else {
      isValidate += 1;
      setDiscountError("");
    }

    if (isValidate === 5) {
      console.log("Save");
      OnClickSave();
    }
  };

  //Callback Functions

  const DivisionCallBack = (response) => {
    let res = response?.data.map((item, index) => {
      let divObj = {
        label: index + 1,
        value: item,
      };

      return divObj;
    }, {});
    console.log("res", res);
    setDivisionList(res);
  };

  const _keyboardDidShow = () => setKeyboardStatus("Keyboard Shown");
  const _keyboardDidHide = () => setKeyboardStatus("Keyboard Hidden");
  const getData = async () => {
    try {
      const UserToken = await AsyncStorage.getItem("access_token");
      if (UserToken !== null) {
        setUserToken(UserToken);
        GetAllDivisionsList(UserToken);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const onClickSpecsType = (SpecsType) => {
    if (SpecsType === "Ice") {
      setIceSpec(!IceSpec);
    } else if (SpecsType === "Pump") {
      setPumpSpecs(!PumpSpecs);
    } else if (SpecsType === "Pipefixing") {
      setpipeFixing(!pipeFixing);
    } else if (SpecsType === "Transport") {
      setTransport(!Transport);
    } else {
      setIceSpec(false);
      setPumpSpecs(false);
      setpipeFixing(false);
      setTransport(false);
    }
  };

  const onChanggeTime = (selectedValue) => {
    console.log("On Select Edit time", selectedValue);
    if (ShowTimePicker) {
      if (ShowTimePicker) {
        setShowTimePicker(!ShowTimePicker);
        setScheduleTime(selectedValue);
        setDateTimeError("");
      }
    }
  };

  const onChangeScheduleDate = (selectedValue) => {
    setShowScheduleDatePicker(!ShowScheduleDatePicker);
    setScheduleDate(selectedValue);
  };

  const OnSelectDivisionName = (divisionname) => {
    setShowDivisionList(false);
    setShowStockList(false);
    setDiscount("");
    setDiscountError("");
    setStockName("Select Stock");
    setStockPrice("");
    setDivisionName(divisionname);
    setDivisionNameError("");
  };

  const GetAllDivisionsList = (UserToken) => {
    let DivisionObject = {
      UserToken: UserToken,
    };
    GetAllDivisions(DivisionObject, DivisionCallBack);
  };

  const OnSelectStocknName = (stockname, stockcode, stockprice) => {
    console.log("stockprice", stockprice);
    setShowStockList(false);
    setStockName(stockname);
    setStockCode(stockcode);
    setStockPrice(stockprice);
    setDiscount(stockprice);
    setStockNameError("");
  };

  const OnChangeQuantity = (text) => {
    setQuantity(text);
    setQuantityError("");
  };
  const OnChangeDiscount = (text) => {
    setDiscount(text);
    setDiscountError("");
  };

  const OnChangeRemark = (text) => {
    setRemark(text);
  };

  const OnClickSave = () => {
    setLoading(true);
    let UpdatedItemObject = {
      DIVISION: DivisionName,
      STOCKNAME: StockName,
      STOCKCODE: StockCode,
      QTY: Quantity,
      SCHEDULETIME: ScheduleTime,
      ICE: IceSpec ? 1 : 0,
      PUMP: PumpSpecs ? 1 : 0,
      PIPEFIXING: pipeFixing ? 1 : 0,
      // TRANSPORT: Transport ? 1 : 0,
      SCHEDULEDATE: ScheduleDate,
      REMARKS: Remark,
      SLNO: ProductSrNo,
      Rate: StockPrice,
      DISRATE: Discount,
      NOTRANSPORT: notransport,
    };

    HandleEditProductItem(UpdatedItemObject, () => {
      setLoading(false);
      CloseModal();
    });
  };

  //Render

  const RenderDivisionData = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => OnSelectDivisionName(item?.value)}
        style={{ width: "100%", height: 40, justifyContent: "center" }}
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
    <View style={styles.AddProductModalContainer}>
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
      <View style={styles.AddItemCancelRow}>
        <Text style={styles.AddItemModalText}>{Strings.EditItem}</Text>
        <TouchableOpacity onPress={() => CloseModal()}>
          <Image source={CancelIcon} style={styles.CancelIconStyle} />
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        enabled
        keyboardVerticalOffset={
          Platform.OS === "ios"
            ? keyboardStatus === "Keyboard Shown"
              ? 0
              : 200
            : keyboardStatus === "Keyboard Shown"
            ? 0
            : 120
        }
      >
        <ScrollView>
          <View style={{ alignItems: "center" }}>
            <TouchableOpacity
              onPress={() =>
                setShowDivisionList({ ShowDivisionList: !ShowDivisionList })
              }
              style={styles.DateButtonStyle}
            >
              <Text style={styles.DivisionNameTextStyle}>{DivisionName}</Text>
              <Image
                resizeMode="contain"
                source={GreyArrowDown}
                style={styles.CalenderIconStyle}
              />
            </TouchableOpacity>
          </View>
          {DivisionNameError === "" ? (
            false
          ) : (
            <Text style={[styles.InputErrorText, { marginLeft: 35 }]}>
              {DivisionNameError}
            </Text>
          )}

          {ShowDivisionList ? (
            <FlatList
              data={DivisionList}
              extraData={DivisionList}
              ListEmptyComponent={RenderDivisionListEmpty}
              ItemSeparatorComponent={renderDivisionSeparator}
              renderItem={RenderDivisionData}
              keyExtractor={(item) => item.id}
            />
          ) : (
            false
          )}

          <View style={{ alignItems: "center", marginTop: 20 }}>
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
                  <Text style={styles.DivisionNameTextStyle}>{StockName}</Text>
                )}
              </View>
              <Image
                resizeMode="contain"
                source={GreyArrowDown}
                style={styles.CalenderIconStyle}
              />
            </TouchableOpacity>
          </View>
          {StockNameError === "" ? (
            false
          ) : (
            <Text style={[styles.InputErrorText, { marginLeft: 35 }]}>
              {StockNameError}
            </Text>
          )}
          {DivisionName === "READYMIX" ? (
            <View style={{ marginTop: 10 }}>
              <Text style={styles.ScheduleDateText}>{Strings.Specs}</Text>

              <View style={styles.radioBtnRowStyle}>
                {IceSpec ? (
                  <TouchableOpacity
                    onPress={() => onClickSpecsType("Ice")}
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
                    onPress={() => onClickSpecsType("Ice")}
                    style={styles.radioBtnRowTouch}
                  >
                    <View style={styles.unspecButton} />
                    <Text style={styles.radioBtnTxt}>{Strings.Ice}</Text>
                  </TouchableOpacity>
                )}
                {PumpSpecs ? (
                  <TouchableOpacity
                    onPress={() => onClickSpecsType("Pump")}
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
                    onPress={() => onClickSpecsType("Pump")}
                    style={styles.radioBtnRowTouch}
                  >
                    <View style={styles.unspecButton} />
                    <Text style={styles.radioBtnTxt}>{Strings.Pump}</Text>
                  </TouchableOpacity>
                )}
                {pipeFixing ? (
                  <TouchableOpacity
                    onPress={() => onClickSpecsType("Pipefixing")}
                    style={styles.radioBtnRowTouch}
                  >
                    <Image
                      source={CheckedTickIcon}
                      style={styles.selectRadioIcon}
                    />
                    <Text style={styles.radioBtnTxt}>{Strings.PipeFixing}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => onClickSpecsType("Pipefixing")}
                    style={styles.radioBtnRowTouch}
                  >
                    <View style={styles.unspecButton} />
                    <Text style={styles.radioBtnTxt}>{Strings.PipeFixing}</Text>
                  </TouchableOpacity>
                )}
                {/* {Transport ? (
                  <TouchableOpacity
                    onPress={() => onClickSpecsType("Transport")}
                    style={styles.radioBtnRowTouch}
                  >
                    <Image
                      source={CheckedTickIcon}
                      style={styles.selectRadioIcon}
                    />
                    <Text style={styles.radioBtnTxt}>{Strings.Transport}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => onClickSpecsType("Transport")}
                    style={styles.radioBtnRowTouch}
                  >
                    <View style={styles.unspecButton} />
                    <Text style={styles.radioBtnTxt}>{Strings.Transport}</Text>
                  </TouchableOpacity>
                )} */}
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
            keyboardType={"number-pad"}
            onChangeText={OnChangeQuantity}
          />

          {QuantityError === "" ? (
            false
          ) : (
            <Text style={[styles.InputErrorText, { marginLeft: 35 }]}>
              {QuantityError}
            </Text>
          )}

          <SimpleTextfield
            placeholder={Strings.Discount}
            fontSize={16}
            ref={discountInput}
            placeholderTextColor={lightGreyTextColor}
            value={Discount}
            keyboardType={"number-pad"}
            onChangeText={OnChangeDiscount}
            editable={CreditOrder ? false : true}
          />

          {DiscountError === "" ? (
            false
          ) : (
            <Text style={[styles.InputErrorText, { marginLeft: 35 }]}>
              {DiscountError}
            </Text>
          )}

          <Text style={styles.ScheduleTimeText}>{Strings.ScheduleDate}</Text>
          <View style={{ alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => setShowScheduleDatePicker(!ShowScheduleDatePicker)}
              style={styles.DateButtonStyle}
            >
              <Text style={styles.DivisionNameTextStyle}>
                {moment(ScheduleDate).format("LL")}
              </Text>
              <Image
                resizeMode="contain"
                source={CalenderIcon}
                style={styles.CalenderIconStyle}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.ScheduleTimeText}>{Strings.ScheduleTime}</Text>
          <View style={{ alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => setShowTimePicker(!ShowTimePicker)}
              style={styles.DateButtonStyle}
            >
              <Text style={styles.DivisionNameTextStyle}>
                {moment(ScheduleTime).format("LT")}
              </Text>
              <Image
                resizeMode="contain"
                source={CalenderIcon}
                style={styles.CalenderIconStyle}
              />
            </TouchableOpacity>
          </View>
          {DateTimeError === "" ? (
            false
          ) : (
            <Text
              style={[styles.InputErrorText, { marginLeft: 35, marginTop: 5 }]}
            >
              {DateTimeError}
            </Text>
          )}

          <DatePicker
            modal
            open={ShowTimePicker}
            date={new Date(ScheduleTime)}
            mode="time"
            onConfirm={onChanggeTime}
            onCancel={() => setShowTimePicker(!ShowTimePicker)}
          />

          <DatePicker
            modal
            open={ShowScheduleDatePicker}
            date={new Date(ScheduleDate)}
            mode="date"
            minimumDate={new Date()}
            onConfirm={onChangeScheduleDate}
            onCancel={() => setShowScheduleDatePicker(!ShowScheduleDatePicker)}
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

      {keyboardStatus === "Keyboard Shown" ? (
        false
      ) : (
        <View style={{ alignItems: "center" }}>
          <View style={{ flexDirection: "row", marginBottom: "5%" }}>
            <View style={{ marginRight: 5 }}>
              <LoginButton
                onPress={() =>
                  ValidateEditForm(
                    DivisionName,
                    StockName,
                    Quantity,
                    ScheduleTime,
                    ScheduleDate,
                    Remark,
                    Discount
                  )
                }
                BgColor={primaryColor}
                borderColor={primaryColor}
                title={"Save"}
                TitleColor={whiteColor}
              />
            </View>
            {/* <View style = {{marginLeft:5}}>
         <SaveButton  title = {"Save + "}/>
         </View> */}
          </View>
        </View>
      )}

      <ModalShade
        isVisible={ShowStockList}
        onBackdropPress={() => setShowStockList(false)}
      >
        <StockListModal
          CloseStockModal={() => setShowStockList(false)}
          SetStockNameFunc={OnSelectStocknName}
          CreditOrder={CreditOrder}
          Division={DivisionName}
          CustomerName={CustomerName}
          SiteName={SiteName}
        />
      </ModalShade>
    </View>
  );
};

const styles = StyleSheet.create({
  AddProductModalContainer: {
    flex: 0.95,
    backgroundColor: whiteColor,
    top: 80,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 70,
  },
  AddItemCancelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    justifyContent: "center",
    marginTop: 10,
    height: 35,
    borderLeftColor: whiteColor,
    borderRightColor: whiteColor,
    borderTopColor: whiteColor,
    flexDirection: "row",
    justifyContent: "space-between",
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
    justifyContent: "center",
    marginTop: 10,
    height: 60,
    borderLeftColor: whiteColor,
    borderRightColor: whiteColor,
    borderTopColor: whiteColor,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    borderBottomColor: lightGreyTextInputColor,
  },

  radioBtnRowTouch: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  radioBtnRowStyle: {
    flexDirection: "row",
    alignItems: "center",
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
    color: "red",
    marginTop: 2,
  },
});

export default AddEditProductModal;
