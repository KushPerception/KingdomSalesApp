import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { Component } from "react";
import {
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// TextField replaced with TextInput (react-native-material-textfield removed)
import ModalShade from "react-native-modal";
import DatePicker from 'react-native-date-picker';
import {
  AddProductIcon,
  CalenderIcon,
  CancelIcon,
  CheckedTickIcon,
  GreyArrowDown,
} from "../../../Images/index";
import {
  AddNewItemToOrder,
  DeleteItemFromOrder,
  GetAllDivisions,
  GetOrderDetailFromServer,
  SubmitOrder,
  UpdateItemToOrder,
} from "../../../utility/ApiHelpers/StagingApis";
import { W, fonts } from "../../../utility/GlobalStyles";
import {
  BlackColor,
  PurpleColor,
  darkGreyTextColor,
  lightGreyTextColor,
  lightGreyTextInputColor,
  primaryColor,
  saperatorColor,
  whiteColor,
} from "../../../utility/colors";
import { formatPrice } from "../../../utility/helpers";
import Strings from "../../../utility/strings";
import ListSeparator from "../../CommonComponents/ListSeparator";
import LoaderComponent from "../../CommonComponents/LoaderComponent";
import LoginButton from "../../CommonComponents/LoginButton";
import SaveButton from "../../CommonComponents/SaveButton";
import StockListModal from "../../CommonComponents/StockListModal";
import ProductListCard from "./ProductListCard";
const moment = require("moment");

export class ProductList extends Component {
  constructor(props) {
    super(props);
    this.OnChangeQuantity = this.OnChangeQuantity.bind(this);
    this.OnChangeDiscount = this.OnChangeDiscount.bind(this); // added new
    this.OnChangeRemark = this.OnChangeRemark.bind(this);
    this.StockCallback = this.StockCallback.bind(this);
    this.GetAllDivisionsList = this.GetAllDivisionsList.bind(this);
    this.DivisionCallBack = this.DivisionCallBack.bind(this);
    this.OnSelectStocknName = this.OnSelectStocknName.bind(this);
    this.QuantityInput = React.createRef();
    this.DiscountInput = React.createRef(); // added new
    this.RemarkInput = React.createRef();
    this.getOrderDetail = this.getOrderDetail.bind(this);
    this.getOrderDetails = this.getOrderDetails.bind(this);
    this.submitResponse = this.submitResponse.bind(this);

    this.state = {
      ProductData: [],
      DivisionsList: [],
      StockList: [],
      modalVisible: false,
      newInput: "",
      DivisionName: "Select Division",
      ShowDivisionList: false,
      ShowStockList: false,
      StockName: "Select Stock Item",
      IceSpec: false,
      PumpSpecs: false,
      PipeFixing: false,
      Transport: false,
      Quantity: "",
      Discount: "", // added new
      ShowTimePicker: false,
      OrderTime: moment().add(5, "minutes").format(),
      ScheduleDate: new Date(),
      OrderDate: new Date(),
      ShowScheduleDatePicker: false,
      Remark: "",
      keyboardStatus: false,
      UpdateOrders: false,
      UserToken: null,
      StockCode: "",
      setloading: false,
      DivisionEmptyError: "",
      StockEmptyError: "",
      QuantityEmptyError: "",
      DiscountEmptyError: "", //added new
      ScheduleDateTimeError: "",
      StockPrice: "",
      TotalCost: 0,
      StockRate: "",
      readymixItemTotal: null,
      OrderDetail: {
        subtotal: "",
        total: "",
        vat: "",
        vatPercentage: "",
        totalCharges: "",
        canEdit: false,
        canDelete: false,
      },
      refreshLoading: false,
      addLoader: false,
    };
  }

  //Functions
  //Keyboard Handler

  async componentDidMount() {
    const UserToken = await AsyncStorage.getItem("access_token");
    this.setState({ UserToken: UserToken });
    this.GetAllDivisionsList(UserToken);
    this.keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      this._keyboardDidShow
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      this._keyboardDidHide
    );
    this.getOrderDetails(UserToken);
  }

  async componentDidUpdate(prevProps, prevState, snapShot) {
    if (
      this.state.modalVisible === false &&
      prevState.modalVisible !== this.state.modalVisible
    ) {
      this.getOrderDetails(this.state.UserToken);
    }
  }

  getOrderDetails(UserToken) {
    this.setState({ setloading: true });
    GetOrderDetailFromServer(UserToken, this.props.Slno, this.getOrderDetail);
  }

  getOrderDetail(response) {
    this.setState({
      setloading: false,
      ProductData: response?.data?.stocks,
      OrderDetail: {
        subtotal: response?.data?.SUBTOTAL,
        vat: response?.data?.VATAMOUNT,
        total: response?.data?.TOTAL,
        vatPercentage: response?.data?.VATPERCENTAGE,
        totalCharges: response?.data?.TOTALCHARGES,
        canEdit: response?.data?.CANEDIT,
        canDelete: response?.data?.CANDELETE,
      },
    });
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  _keyboardDidShow = () => {
    this.setState({ keyboardStatus: true });
  };

  _keyboardDidHide = () => {
    this.setState({ keyboardStatus: false });
  };

  //Callbacks

  DivisionCallBack(response) {
    let res = response?.data.map((item, index) => {
      let divObj = {
        label: index + 1,
        value: item,
      };

      return divObj;
    }, {});
    this.setState({ DivisionsList: res });
  }

  GetAllDivisionsList(UserToken) {
    let DivisionObject = {
      UserToken: UserToken,
    };
    GetAllDivisions(DivisionObject, this.DivisionCallBack);
  }

  StockCallback(response, Division) {
    const StockListArray = response.data.map((item) => {
      return { label: item.STOCKCODE, value: item.STOCKNAME };
    });
    this.setState({ StockList: StockListArray });
  }

  onClickSpecsType(SpecsType) {
    if (SpecsType === "Ice") {
      this.setState({ IceSpec: !this.state.IceSpec });
    } else if (SpecsType === "Pump") {
      this.setState({ PumpSpecs: !this.state.PumpSpecs });
    } else if (SpecsType === "Pipefixing") {
      this.setState({ PipeFixing: !this.state.PipeFixing });
    } else if (SpecsType === "Transport") {
      this.setState({ Transport: !this.state.Transport });
    } else {
      this.setState({ IceSpec: false });
      this.setState({ PumpSpecs: false });
      this.setState({ PipeFixing: false });
      this.setState({ Transport: false });
    }
  }

  onChanggeTime = (selectedValue) => {
    console.log("Selected Value", selectedValue);
    console.log("moment time", moment(selectedValue).format("HH:mm:ss"));
    let selectedmomenttime = moment(selectedValue).format("HH:mm:ss");

    this.setState({ ShowTimePicker: false });
    this.setState({ OrderTime: selectedValue });
    this.setState({ ScheduleDateTimeError: "" });
  };

  onChangeScheduleDate = (selectedValue) => {
    this.setState({ ShowScheduleDatePicker: false });
    this.setState({ ScheduleDate: selectedValue });
    this.setState({ ScheduleDateTimeError: "" });
  };

  // creditLimitCallback = (response) => {
  //   let res = response?.data.map((item, index) => {
  //     return item;
  //   }, {});
  //   console.log({ res });
  //   this.setState({ customerCreditLimit: res[0]?.creditlimit });
  //   this.setState({ customerTotalAmount: res[0]?.totalamount });
  // };

  // redimixCallback = (response) => {
  //   console.log("response?.data?.itemTotal", response?.data?.itemTotal);
  //   // let res = response?.data.map((item, index) => {
  //   //   return item;
  //   // });
  //   // console.log({ res });
  //   this.setState({ readymixItemTotal: response?.data?.itemTotal });
  // };

  OnSelectDivisionName = (divisionname) => {
    //   this.GetAllStockListing(divisionname)
    this.setState({ ShowDivisionList: false });
    this.setState({ ShowStockList: false });
    this.setState({ StockName: "Select Stock Item" });
    this.setState({ DivisionName: divisionname });
    this.setState({ Discount: "" });
    this.setState({ DiscountEmptyError: "" });
    this.DiscountInput.current.setValue("");
    // getCreditLimitForCustomer(
    //   this.state.UserToken,
    //   this.props.CustomerDetailsObject["CUSTCODE"],
    //   divisionname,
    //   this.creditLimitCallback
    // );
    this.setState({ DivisionEmptyError: "" });
  };

  OnSelectStocknName(stockname, stockcode, stockRate, stockprice) {
    console.log(
      "stockname, stockcode,stockRate, stockprice",
      stockname,
      stockcode,
      stockRate,
      stockprice
    );
    this.setState({ ShowStockList: false });
    this.setState({ StockName: stockname });
    this.setState({ StockPrice: stockprice });
    this.setState({ StockRate: stockRate });
    this.setState({ Discount: stockRate });
    this.DiscountInput.current.setValue(stockRate);
    this.setState({ StockCode: stockcode });
    this.setState({ StockEmptyError: "" });
  }

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
    this.setState({ DivisionName: "Select Division" });
    this.setState({ StockName: "Select Stock Item" });
    this.setState({ ScheduleDate: new Date() });
    this.setState({ OrderTime: moment().add(5, "minutes").format() });
    this.setState({ Quantity: "" });
    this.setState({ Discount: "" });
    this.setState({ StockList: [] });
    this.setState({ IceSpecs: false });
    this.setState({ PumpSpecs: false });
    this.setState({ PipeFixing: false });
    this.setState({ Transport: false });
    this.setState({ DivisionEmptyError: "" });
    this.setState({ StockEmptyError: "" });
    this.setState({ QuantityEmptyError: "" });
    this.setState({ ScheduleDateTimeError: "" });
    this.setState({ DiscountEmptyError: "" });
    this.setState({ StockPrice: "" });
  }

  OnChangeQuantity(text) {
    this.setState({ Quantity: text });
    this.setState({ QuantityEmptyError: "" });
  }

  OnChangeDiscount(text) {
    this.setState({ Discount: text });
    this.setState({ DiscountEmptyError: "" });
  }

  OnChangeRemark(text) {
    this.setState({ Remark: text });
  }

  HandleEditProductItem = (UpdatedItemObject, callback) => {
    console.log("UpdatedItemObject", UpdatedItemObject);
    let MomentDate = moment(UpdatedItemObject?.SCHEDULEDATE).format(
      "YYYY-MM-DD"
    );
    //let DashScheduleDate =  MomentDate.substr(0,10)
    let MomentTime = moment(UpdatedItemObject?.SCHEDULETIME).format("HH:mm:ss");
    console.log(" Edit Moment Time", MomentTime);
    //  let DashScheduleTime =  MomentTime
    let updateObject = UpdatedItemObject;
    if (updateObject) {
      updateObject.QTY = UpdatedItemObject?.QTY;
      updateObject.SLNO = UpdatedItemObject?.SLNO;
      updateObject.DIVISION = UpdatedItemObject?.DIVISION;
      updateObject.STOCKNAME = UpdatedItemObject?.STOCKNAME;
      updateObject.STOCKCODE = UpdatedItemObject?.STOCKCODE;
      updateObject.SCHEDULETIME = MomentTime;
      updateObject.ICE = UpdatedItemObject?.ICE;
      updateObject.PUMP = UpdatedItemObject?.PUMP;
      updateObject.PIPEFIXING = UpdatedItemObject?.PIPEFIXING;
      // updateObject.TRANSPORT = UpdatedItemObject?.TRANSPORT;
      updateObject.SCHEDULEDATE = MomentDate;
      updateObject.REMARKS = UpdatedItemObject?.REMARKS;
      updateObject.STOCKPRICE = UpdatedItemObject?.STOCKPRICE;
      updateObject.Rate = UpdatedItemObject?.Rate;
      updateObject.DISRATE = UpdatedItemObject?.DISRATE;
    }

    UpdateItemToOrder(
      this.props.Slno,
      updateObject.SLNO,
      this.state.UserToken,
      updateObject,
      () => {
        this.getOrderDetails(this.state.UserToken);
        callback();
      }
    );
    // this.setState({ ProductData: this.state.ProductData });
  };

  // save button click
  handleModalClick = () => {
    let DashScheduleDate = moment(this.state.ScheduleDate).format("YYYY-MM-DD");
    let selectedmomenttime = moment(this.state.OrderTime).format("HH:mm:ss");
    // total cost for readymix
    // let allSpec = [];
    // if (this.state.DivisionName === "READYMIX") {
    //   if (this.state.IceSpec == 1) {
    //     allSpec.push("Ice");
    //   }
    //   if (this.state.PumpSpecs == 1) {
    //     allSpec.push("Pump");
    //   }
    //   if (this.state.PipeFixing == 1) {
    //     allSpec.push("Pipefixing");
    //   }
    //   if (this.state.Transport == 1) {
    //     allSpec.push("Transport");
    //   }
    //   console.log(allSpec.length, allSpec);
    // }

    // getReadyMixTotal(
    //   this.state.UserToken,
    //   this.state.StockPrice.replace("BD", ""),
    //   this.state.DivisionName,
    //   this.state.Quantity,
    //   this.props.CustomerDetailsObject["CUSTCODE"],
    //   allSpec,
    //   this.redimixCallback
    // );

    // console.log("readymixItemTotal", this.state?.readymixItemTotal);

    const itemObejct = {
      DIVISION: this.state.DivisionName,
      STOCKNAME: this.state.StockName,
      STOCKCODE: this.state.StockCode,
      QTY: this.state.Quantity,
      SCHEDULETIME: selectedmomenttime,
      ICE: this.state.IceSpec ? 1 : 0,
      PUMP: this.state.PumpSpecs ? 1 : 0,
      PIPEFIXING: this.state.PipeFixing ? 1 : 0,
      // TRANSPORT: this.state.Transport ? 1 : 0,
      SCHEDULEDATE: DashScheduleDate,
      REMARKS: this.state.Remark,
      Rate: this.state.StockRate,
      DISRATE: this.state.Discount,
      NOTRANSPORT: this.props.notransport,
    };

    AddNewItemToOrder(
      this.props.Slno,
      itemObejct,
      this.state.UserToken,
      () => {
        this.DiscountInput.current.setValue("");
        this.QuantityInput.current.setValue("");
        this.setState({
          DivisionName: "Select Division",
          StockName: "Select Stock Item",
          Quantity: "",
          OrderTime: moment().add(5, "minutes").format(),
          ScheduleDate: new Date(),
          OrderDate: new Date(),
          IceSpec: false,
          PumpSpecs: false,
          PipeFixing: false,
          Transport: false,
          Remark: "",
          Discount: "",
          // modalVisible:false,
          StockCode: "",
          StockPrice: "",
          StockRate: "",
        });
        this.setModalVisible(false);
        Alert.alert("Item successfully added.");
      },
      () => {
        this.setState({ addLoader: false });
      }
    );
  };

  // Add button click
  handleModalSavePlusClick = () => {
    let DashScheduleDate = moment(this.state.ScheduleDate).format("YYYY-MM-DD");
    let selectedmomenttime = moment(this.state.OrderTime).format("HH:mm:ss");
    this.QuantityInput.current.focus();
    this.RemarkInput.current.focus();
    // this.setState(
    //   {
    //     ProductData: [
    //       ...this.state.ProductData,
    //       {
    //         SRNO: this.state.ProductData.length + 1,
    //         DIVISION: this.state.DivisionName,
    //         STOCKNAME: this.state.StockName,
    //         STOCKCODE: this.state.StockCode,
    //         QTY: this.state.Quantity,
    //         SCHEDULETIME: selectedmomenttime,
    //         ICE: this.state.IceSpec ? 1 : 0,
    //         PUMP: this.state.PumpSpecs ? 1 : 0,
    //         PIPEFIXING: this.state.PipeFixing ? 1 : 0,
    //         TRANSPORT: this.state.Transport ? 1 : 0,
    //         SCHEDULEDATE: DashScheduleDate,
    //         REMARKS: this.state.Remark,
    //         STOCKPRICE: this.state.StockPrice,
    //         Rate: this.state.StockRate,
    //       },
    //     ],
    //   },

    const itemObejct = {
      DIVISION: this.state.DivisionName,
      STOCKNAME: this.state.StockName,
      STOCKCODE: this.state.StockCode,
      QTY: this.state.Quantity,
      SCHEDULETIME: selectedmomenttime,
      ICE: this.state.IceSpec ? 1 : 0,
      PUMP: this.state.PumpSpecs ? 1 : 0,
      PIPEFIXING: this.state.PipeFixing ? 1 : 0,
      // TRANSPORT: this.state.Transport ? 1 : 0,
      SCHEDULEDATE: DashScheduleDate,
      REMARKS: this.state.Remark,
      Rate: this.state.StockRate,
      DISRATE: this.state.Discount,
      NOTRANSPORT: this.props.notransport,
    };

    AddNewItemToOrder(
      this.props.Slno,
      itemObejct,
      this.state.UserToken,
      () => {
        this.DiscountInput.current.setValue("");
        this.QuantityInput.current.setValue("");
        this.setState({
          DivisionName: "Select Division",
          StockName: "Select Stock Item",
          Quantity: "",
          OrderTime: moment().add(5, "minutes").format(),
          ScheduleDate: new Date(),
          OrderDate: new Date(),
          IceSpec: false,
          PumpSpecs: false,
          PipeFixing: false,
          Transport: false,
          Remark: "",
          StockCode: "",
          StockPrice: "",
          StockRate: "",
          Discount: "",
        });
        Alert.alert("Item successfully added.");
      },
      () => {
        this.setState({ addLoader: false });
      }
    );

    //this.setModalVisible(true);
  };

  OnClickDeleteOrderItem = (itemSLNO, remarkText, closeDeleteModal) => {
    DeleteItemFromOrder(
      this.props.Slno,
      itemSLNO,
      remarkText,
      this.state.UserToken,
      () => {
        this.getOrderDetails(this.state.UserToken);
        closeDeleteModal();
      }
    );
  };

  OnClickSubmitOrder() {
    // console.log("submit", this.state.ProductData);
    // for (var i = 0; i < this.state.ProductData.length; i++) {
    //   delete this.state.ProductData[i].SRNO;
    //   delete this.state.ProductData[i].STOCKPRICE;
    // }
    // let SubmitOrderObject = this.props.CustomerDetailsObject;
    // SubmitOrderObject["STOCKS"] = this.state.ProductData;
    // console.log("SubmitOrderObject", SubmitOrderObject);
    SubmitOrder(this.props.Slno, this.state.UserToken, this.submitResponse);

    // CreateSendOrders(
    //   SubmitOrderObject,
    //   this.state.UserToken,
    //   this.props.GobackHome
    // );
  }

  submitResponse(response) {
    if (response.status === 422) {
      alert(response.message);
    } else {
      this.props.GobackHome();
    }
  }

  ValidateProductListModal(
    DivisionName,
    StockName,
    ScheduleDate,
    OrderTime,
    Quantity,
    Remark,
    Discount,
    Save
  ) {
    var isValidate = 0;

    let TodayDate = moment().format();
    let MomentDate = moment(ScheduleDate).format("YYYY-MM-DD");
    let MomentTime = moment(OrderTime).format("HH:mm:ss");
    let MomentDateTime = moment(MomentDate + "T" + MomentTime).format();

    if (MomentDateTime >= TodayDate) {
      console.log(true);
      isValidate += 1;
    } else {
      console.log(false);
      isValidate -= 1;
      this.setState({
        ScheduleDateTimeError: Strings.ScheduleTimeInvalidError,
      });
    }

    if (DivisionName === "Select Division") {
      isValidate -= 1;
      this.setState({ DivisionEmptyError: Strings.DivisionNullError });
    } else {
      isValidate += 1;
      this.setState({ DivisionEmptyError: "" });
    }
    if (StockName === "Select Stock Item") {
      isValidate -= 1;
      this.setState({ StockEmptyError: Strings.StockNullError });
    } else {
      isValidate += 1;
      this.setState({ StockEmptyError: "" });
    }
    if (Quantity === "" || Quantity === "0") {
      isValidate -= 1;
      this.setState({ QuantityEmptyError: Strings.QuantityNullError });
    } else {
      isValidate += 1;
      this.setState({ QuantityEmptyError: "" });
    }
    if (Number(Discount) > Number(this.state.StockRate) || Discount === "") {
      isValidate -= 1;
      this.setState({
        DiscountEmptyError: "Please Enter Valid Discount Amount",
      });
    } else {
      isValidate += 1;
      this.setState({ DiscountEmptyError: "" });
    }
    if (isValidate === 5) {
      this.setState({ addLoader: true });
      Save ? this.handleModalClick() : this.handleModalSavePlusClick();
    }
  }

  //Render

  RenderDropdownIcon() {
    return (
      <Image
        resizeMode="contain"
        source={GreyArrowDown}
        style={styles.DropdownIconStyle}
      />
    );
  }

  RenderDivisionData(item, index) {
    return (
      <TouchableOpacity
        onPress={() => this.OnSelectDivisionName(item?.value)}
        style={{ width: "100%", height: 40, justifyContent: "center" }}
      >
        <Text style={{ paddingLeft: 50 }}>{item?.value}</Text>
      </TouchableOpacity>
    );
  }

  renderDivisionSeparator() {
    return <ListSeparator />;
  }

  RenderDivisionListEmpty() {
    return (
      <View style={{ alignItems: "center", marginTop: 10 }}>
        <Text>No Divisions Found</Text>
      </View>
    );
  }

  RenderStocksEmpty() {
    return (
      <View style={{ alignItems: "center", marginTop: 10 }}>
        <Text>No Stock Found</Text>
      </View>
    );
  }

  render() {
    // const { VATPercentage = 0 } = this.props.CustomerDetailsObject;
    let {
      modalVisible,
      DivisionName,
      OrderTime,
      DivisionsList,
      ProductData,
      ShowDivisionList,
      StockList,
      ShowStockList,
      StockName,
      IceSpec,
      PumpSpecs,
      PipeFixing,
      Transport,
      Quantity,
      Discount, // added new
      DiscountEmptyError, // added new
      ShowTimePicker,
      ScheduleDate,
      ShowScheduleDatePicker,
      Remark,
      keyboardStatus = false,
      StockCode,
      setloading,
      Save,
      DivisionEmptyError,
      StockEmptyError,
      QuantityEmptyError,
      ScheduleDateTimeError,
      ValidDate,
      StockPrice,
      TotalCost,
      OrderDetail,
      addLoader,
    } = this.state;
    // console.log(
    //   "Customer Details ============",
    //   this.props.CustomerDetailsObject,
    //   ProductData
    // );

    // const subTotal =
    //   ProductData.length !== 0 &&
    //   formatPrice(
    //     ProductData?.map(
    //       (key) => key.STOCKPRICE.replace("BD", "") * Number(key.QTY)
    //     )
    //       ?.reduce((acc, key) => Number(key) + Number(acc))
    //       ?.toFixed(3)
    //   );

    // const subTotalFloat = subTotal && parseFloat(subTotal?.split(" ")[1]);

    // const totalCost =
    //   subTotalFloat &&
    //   (subTotalFloat + subTotalFloat * (VATPercentage / 100)).toFixed(3);
    // const VATValue = (subTotalFloat * (VATPercentage / 100)).toFixed(3);

    return (
      <View style={styles.container}>
        <View style={styles.AddItemTopCenterMargin}>
          {this.props.isSubmitted === false && (
            <TouchableOpacity
              onPress={() => {
                if (DivisionsList.length === 0) {
                  this.GetAllDivisionsList(this.state.UserToken);
                  this.setModalVisible(!this.state.modalVisible);
                } else {
                  this.setModalVisible(!this.state.modalVisible);
                }
              }}
              style={styles.AddItemTouch}
            >
              <Image
                source={AddProductIcon}
                style={{ width: 20, height: 20, marginRight: 10 }}
              />
              <Text style={styles.AddItemText}>{Strings.AddItem}</Text>
            </TouchableOpacity>
          )}

          <View
            style={{
              width: "100%",
              borderWidth: 0.5,
              borderColor: saperatorColor,
              marginTop: 20,
            }}
          />
        </View>
        {setloading ? (
          <LoaderComponent />
        ) : ProductData.length === 0 ? (
          false
        ) : (
          <View>
            <View style={styles.TotalCostTotalItemsRowContainer}>
              <View>
                <Text
                  style={[styles.TotalItemAddedTextStyle, { marginLeft: 40 }]}
                >
                  Sub Total: {formatPrice(OrderDetail.subtotal)}
                </Text>
                <Text
                  style={[styles.TotalItemAddedTextStyle, { marginLeft: 40 }]}
                >
                  VAT({OrderDetail?.vatPercentage}%):
                  {formatPrice(OrderDetail.vat)}
                </Text>
                <Text
                  style={[styles.TotalItemAddedTextStyle, { marginLeft: 40 }]}
                >
                  Total Cost: {formatPrice(OrderDetail.total)}
                </Text>
              </View>

              <View>
                <Text
                  style={[styles.TotalItemAddedTextStyle, { marginRight: 40 }]}
                >
                  Total Items: {ProductData?.length}
                </Text>
                <Text
                  style={[styles.TotalItemAddedTextStyle, { marginRight: 40 }]}
                >
                  Total Charges: {formatPrice(OrderDetail?.totalCharges)}
                </Text>
              </View>
            </View>
            <View
              style={{
                width: "100%",
                borderWidth: 0.5,
                borderColor: saperatorColor,
                marginTop: 20,
              }}
            />
          </View>
        )}

        {!setloading && (
          <View style={{ flex: 1, paddingBottom: 10, marginTop: 10 }}>
            <FlatList
              data={ProductData}
              renderItem={({ item, index }) => (
                <ProductListCard
                  key={index}
                  ProductListItem={item}
                  HandleEditProductItem={this.HandleEditProductItem}
                  RemoveOrderItem={this.OnClickDeleteOrderItem}
                  CreditOrder={this.props.CustomerType}
                  CustomerName={this.props.CustomerName}
                  SiteName={this.props.SiteName}
                  Slno={this.props.Slno}
                  canEdit={OrderDetail?.canEdit}
                  canDelete={OrderDetail?.canDelete}
                  notransport={this.props.notransport}
                />
              )}
              refreshControl={
                <RefreshControl
                  refreshing={this.state.refreshLoading}
                  onRefresh={() => this.getOrderDetails(this.state.UserToken)}
                />
              }
              keyExtractor={(item) => item.id}
            />
          </View>
        )}
        {ProductData?.length === 0 || this.props.isSubmitted === true ? (
          false
        ) : (
          <View style={{ marginBottom: 20 }}>
            <LoginButton
              title="Submit"
              onPress={() => this.OnClickSubmitOrder()}
            />
          </View>
        )}
        <ModalShade
          style={{ margin: 0 }}
          isVisible={modalVisible}
          onBackdropPress={() => this.setModalVisible(false)}
        >
          {addLoader && (
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
          <ModalShade
            isVisible={ShowStockList}
            onBackdropPress={() => this.setState({ ShowStockList: false })}
          >
            <StockListModal
              Division={DivisionName}
              CreditOrder={this.props.CustomerType}
              CloseStockModal={() => this.setState({ ShowStockList: false })}
              SetStockNameFunc={this.OnSelectStocknName}
              StockData={StockList}
              CustomerName={this.props.CustomerName}
              SiteName={this.props.SiteName}
            />
          </ModalShade>

          {/* Primary Modal */}

          <View style={styles.AddProductModalContainer}>
            <View style={styles.AddItemCancelRow}>
              <Text style={styles.AddItemModalText}>{Strings.AddItem}</Text>
              <TouchableOpacity onPress={() => this.setModalVisible(false)}>
                <Image source={CancelIcon} style={styles.CancelIconStyle} />
              </TouchableOpacity>
            </View>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              enabled
              keyboardVerticalOffset={
                Platform.OS === "ios"
                  ? keyboardStatus
                    ? 0
                    : 200
                  : keyboardStatus
                  ? 120
                  : 0
              }
            >
              <ScrollView>
                <View style={{ alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({ ShowDivisionList: !ShowDivisionList })
                    }
                    style={styles.DateButtonStyle}
                  >
                    <Text style={styles.DivisionNameTextStyle}>
                      {DivisionName}
                    </Text>
                    <Image
                      resizeMode="contain"
                      source={GreyArrowDown}
                      style={styles.CalenderIconStyle}
                    />
                  </TouchableOpacity>
                </View>
                {DivisionEmptyError === "" ? (
                  false
                ) : (
                  <Text style={[styles.InputErrorText, { marginLeft: 35 }]}>
                    {DivisionEmptyError}
                  </Text>
                )}

                {ShowDivisionList ? (
                  <FlatList
                    data={DivisionsList}
                    extraData={DivisionsList}
                    ListEmptyComponent={() => this.RenderDivisionListEmpty()}
                    ItemSeparatorComponent={() =>
                      this.renderDivisionSeparator()
                    }
                    renderItem={({ item, index }) =>
                      this.RenderDivisionData(item, index)
                    }
                    keyExtractor={(item) => item.id}
                  />
                ) : (
                  false
                )}

                <View style={{ alignItems: "center", marginTop: 20 }}>
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({ ShowStockList: !ShowStockList })
                    }
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
                {StockEmptyError === "" ? (
                  false
                ) : (
                  <Text style={[styles.InputErrorText, { marginLeft: 35 }]}>
                    {StockEmptyError}
                  </Text>
                )}

                {DivisionName === "READYMIX" ? (
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.OrderDateText}>{Strings.Specs}</Text>

                    <View style={styles.radioBtnRowStyle}>
                      {IceSpec ? (
                        <TouchableOpacity
                          onPress={() => this.onClickSpecsType("Ice")}
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
                          onPress={() => this.onClickSpecsType("Ice")}
                          style={styles.radioBtnRowTouch}
                        >
                          <View style={styles.unspecButton} />
                          <Text style={styles.radioBtnTxt}>{Strings.Ice}</Text>
                        </TouchableOpacity>
                      )}
                      {PumpSpecs ? (
                        <TouchableOpacity
                          onPress={() => this.onClickSpecsType("Pump")}
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
                          onPress={() => this.onClickSpecsType("Pump")}
                          style={styles.radioBtnRowTouch}
                        >
                          <View style={styles.unspecButton} />
                          <Text style={styles.radioBtnTxt}>{Strings.Pump}</Text>
                        </TouchableOpacity>
                      )}
                      {PipeFixing ? (
                        <TouchableOpacity
                          onPress={() => this.onClickSpecsType("Pipefixing")}
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
                          onPress={() => this.onClickSpecsType("Pipefixing")}
                          style={styles.radioBtnRowTouch}
                        >
                          <View style={styles.unspecButton} />
                          <Text style={styles.radioBtnTxt}>
                            {Strings.PipeFixing}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    {/* <View style={styles.radioBtnRowStyle}>
                      {Transport ? (
                        <TouchableOpacity
                          onPress={() => this.onClickSpecsType("Transport")}
                          style={styles.radioBtnRowTouch}
                        >
                          <Image
                            source={CheckedTickIcon}
                            style={styles.selectRadioIcon}
                          />
                          <Text style={styles.radioBtnTxt}>
                            {Strings.Transport}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={() => this.onClickSpecsType("Transport")}
                          style={styles.radioBtnRowTouch}
                        >
                          <View style={styles.unspecButton} />
                          <Text style={styles.radioBtnTxt}>
                            {Strings.Transport}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View> */}
                  </View>
                ) : (
                  false
                )}
                <View style={{ alignItems: "center" }}>
                  <View style={{ width: W(320) }}>
                    <TextInput
                      ref={this.QuantityInput}
                      style={{paddingLeft: 10, fontSize: 16, borderBottomWidth: 1, borderBottomColor: PurpleColor}}
                      placeholder={Strings.Quantity}
                      placeholderTextColor={lightGreyTextColor}
                      returnKeyType="done"
                      value={Quantity}
                      keyboardType={"number-pad"}
                      onChangeText={this.OnChangeQuantity}
                    />
                  </View>
                </View>
                {QuantityEmptyError === "" ? (
                  false
                ) : (
                  <Text
                    style={[
                      styles.InputErrorText,
                      { marginLeft: 35, marginTop: -5 },
                    ]}
                  >
                    {QuantityEmptyError}
                  </Text>
                )}

                {/* New field add discount */}

                <View style={{ alignItems: "center" }}>
                  <View style={{ width: W(320) }}>
                    <TextInput
                      ref={this.DiscountInput}
                      style={{paddingLeft: 10, fontSize: 16, borderBottomWidth: 1, borderBottomColor: PurpleColor}}
                      placeholder={Strings.Discount}
                      placeholderTextColor={lightGreyTextColor}
                      returnKeyType="done"
                      keyboardType={"number-pad"}
                      onChangeText={this.OnChangeDiscount}
                      editable={this.props.CustomerType ? false : true}
                    />
                  </View>
                </View>
                {DiscountEmptyError === "" ? (
                  false
                ) : (
                  <Text
                    style={[
                      styles.InputErrorText,
                      { marginLeft: 35, marginTop: -5 },
                    ]}
                  >
                    {DiscountEmptyError}
                  </Text>
                )}

                <Text style={styles.OrderTimeText}>{Strings.ScheduleDate}</Text>
                <View style={{ alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({
                        ShowScheduleDatePicker: !ShowScheduleDatePicker,
                      })
                    }
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

                <Text style={styles.OrderTimeText}>{Strings.ScheduleTime}</Text>
                <View style={{ alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({ ShowTimePicker: !ShowTimePicker })
                    }
                    style={styles.DateButtonStyle}
                  >
                    <Text style={styles.DivisionNameTextStyle}>
                      {moment(OrderTime).format("LT")}
                    </Text>
                    <Image
                      resizeMode="contain"
                      source={CalenderIcon}
                      style={styles.CalenderIconStyle}
                    />
                  </TouchableOpacity>
                </View>
                {ScheduleDateTimeError === "" ? (
                  false
                ) : (
                  <Text style={[styles.InputErrorText, { marginLeft: 35 }]}>
                    {ScheduleDateTimeError}
                  </Text>
                )}

                <DatePicker
                  modal
                  open={ShowTimePicker}
                  date={OrderTime ? new Date(OrderTime) : new Date()}
                  mode="time"
                  onConfirm={this.onChanggeTime}
                  onCancel={() =>
                    this.setState({ ShowTimePicker: !ShowTimePicker })
                  }
                />

                <DatePicker
                  modal
                  open={ShowScheduleDatePicker}
                  date={ScheduleDate instanceof Date ? ScheduleDate : new Date(ScheduleDate)}
                  mode="date"
                  minimumDate={new Date()}
                  onConfirm={this.onChangeScheduleDate}
                  onCancel={() =>
                    this.setState({
                      ShowScheduleDatePicker: !ShowScheduleDatePicker,
                    })
                  }
                />

                <View style={{ alignItems: "center", marginTop: 10 }}>
                  <View style={{ width: W(320) }}>
                    <TextInput
                      ref={this.RemarkInput}
                      placeholder={Strings.Remark}
                      style={{paddingLeft: 10, fontSize: 16, borderBottomWidth: 1, borderBottomColor: PurpleColor}}
                      returnKeyType="done"
                      placeholderTextColor={lightGreyTextColor}
                      value={Remark}
                      onChangeText={this.OnChangeRemark}
                    />
                  </View>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
            {keyboardStatus ? (
              false
            ) : (
              <View style={{ alignItems: "center" }}>
                <View style={{ flexDirection: "row", marginBottom: "5%" }}>
                  <View style={{ marginRight: 5 }}>
                    {/* <SaveButton onPress={this.handleModalClick} BgColor = {whiteColor} borderColor = {primaryColor} title = {"Save"} TitleColor = {primaryColor}/> */}

                    <SaveButton
                      onPress={() =>
                        this.ValidateProductListModal(
                          DivisionName,
                          StockName,
                          ScheduleDate,
                          OrderTime,
                          Quantity,
                          Remark,
                          Discount,
                          (Save = true)
                        )
                      }
                      BgColor={whiteColor}
                      borderColor={primaryColor}
                      title={"Save"}
                      TitleColor={primaryColor}
                    />
                  </View>
                  <View style={{ marginLeft: 5 }}>
                    <SaveButton
                      onPress={() =>
                        this.ValidateProductListModal(
                          DivisionName,
                          StockName,
                          ScheduleDate,
                          OrderTime,
                          Quantity,
                          Remark,
                          Discount,
                          (Save = false)
                        )
                      }
                      title={"Add"}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        </ModalShade>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: whiteColor,
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 18,
  },
  input: {
    borderWidth: 2,
  },
  AddItemTopCenterMargin: {
    alignItems: "center",
    marginTop: 20,
  },
  AddItemTouch: {
    width: 220,
    height: 60,
    borderWidth: 1,
    borderColor: primaryColor,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  AddItemText: {
    fontFamily: fonts.Lato_Regular,
    fontSize: 18,
    color: primaryColor,
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
  OrderDateText: {
    fontFamily: fonts.Lato_Bold,
    marginTop: 20,
    marginLeft: 30,
    color: darkGreyTextColor,
  },
  OrderTimeText: {
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
    marginTop: 5,
  },
  TotalItemAddedTextStyle: {
    color: lightGreyTextColor,
    fontFamily: fonts.Font_Medium,
    marginVertical: 2,
  },
  TotalCostTotalItemsRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
});

export default ProductList;
