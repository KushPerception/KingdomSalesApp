import moment from "moment";
import { ToastAndroid } from "react-native";
import realmdb from "../index";

/* get today's order */
let getTodayDriverOrdersList = () => {
  return realmdb.objects("DriverOrders");
};

/* get past order */
let getPastDriverOrdersList = () => {
  return realmdb.objects("PastDriverOrders");
};

/* get all settled order */
let getSettledDriverOrders = () => {
  return realmdb.objects("SettledDriverOrders");
};

/* add today single driver order */
let addTodaySingleDriverOrders = (
  DIVISION,
  CUSTNAME,
  CUSTPHONE,
  CUSTEMAIL,
  TABLENAME,
  DELIVERYNO,
  DELIVERYDATE,
  STOCKNAME,
  CUSTCODE,
  TRUCKNO,
  SITENAME,
  SIGNED,
  orderPdf,
  receiptPdf,
  receiptData,
  tag,
  primaryEmail
) => {
  console.log("inside addTodaySingleDriverOrders");
  let _id = getTodayDriverOrdersList()?.length + 1;
  realmdb.write(() => {
    realmdb.create(
      "DriverOrders",
      {
        _id: _id,
        DIVISION: DIVISION,
        CUSTNAME: CUSTNAME,
        CUSTPHONE: CUSTPHONE,
        CUSTEMAIL: CUSTEMAIL,
        TABLENAME: TABLENAME,
        DELIVERYNO: DELIVERYNO,
        DELIVERYDATE: DELIVERYDATE,
        STOCKNAME: STOCKNAME,
        CUSTCODE: CUSTCODE,
        TRUCKNO: TRUCKNO,
        SITENAME: SITENAME,
        SIGNED: SIGNED,
        orderPdf: orderPdf,
        receiptPdf: receiptPdf,
        receiptData: receiptData,
        tag: tag,
        primaryEmail: primaryEmail,
      },
      "modified"
    );
  });
};

/* add past single driver order */
let addPastSingleDriverOrders = (
  DIVISION,
  CUSTNAME,
  CUSTPHONE,
  CUSTEMAIL,
  TABLENAME,
  DELIVERYNO,
  DELIVERYDATE,
  STOCKNAME,
  CUSTCODE,
  TRUCKNO,
  SITENAME,
  SIGNED,
  orderPdf,
  receiptPdf,
  receiptData,
  tag,
  primaryEmail
) => {
  console.log("inside addPastSingleDriverOrders");
  let _id = getPastDriverOrdersList()?.length + 1;
  realmdb.write(() => {
    realmdb.create(
      "PastDriverOrders",
      {
        _id: _id,
        DIVISION: DIVISION,
        CUSTNAME: CUSTNAME,
        CUSTPHONE: CUSTPHONE,
        CUSTEMAIL: CUSTEMAIL,
        TABLENAME: TABLENAME,
        DELIVERYNO: DELIVERYNO,
        DELIVERYDATE: DELIVERYDATE,
        STOCKNAME: STOCKNAME,
        CUSTCODE: CUSTCODE,
        TRUCKNO: TRUCKNO,
        SITENAME: SITENAME,
        SIGNED: SIGNED,
        orderPdf: orderPdf,
        receiptPdf: receiptPdf,
        receiptData: receiptData,
        tag: tag,
        primaryEmail: primaryEmail,
      },
      "modified"
    );
  });
};

/* updating driver order after storing signature */
let updateSingleDriverOrder = (_id, SIGNED, tag) => {
  var obj;

  if (tag === "today") {
    obj = realmdb.objects("DriverOrders").filtered("_id =" + _id);
  } else {
    obj = realmdb.objects("PastDriverOrders").filtered("_id =" + _id);
  }
  if (obj.length > 0) {
    obj[0].SIGNED = SIGNED;
    ToastAndroid.show("Order Saved successfully", ToastAndroid.SHORT);
  }
};

/* Adding settled driver order  */
let addSingleSettledDriverOrder = (
  delilveryObj,
  callback,
  setloading,
  setSignaturePresent,
  setEmptySignatureError,
  OrderId,
  SIGNED,
  tag
) => {
  console.log("inside addSingleSettledDriverOrder", delilveryObj);
  let _id =
    getSettledDriverOrders().length > 0
      ? getSettledDriverOrders().length + 1
      : 1;
  console.log({ _id });
  setloading(true);
  realmdb.write(() => {
    try {
      realmdb.create(
        "SettledDriverOrders",
        {
          _id: _id,
          Signature: delilveryObj.Signature,
          UserToken: delilveryObj.UserToken,
          UserEmail: delilveryObj.UserEmail,
          UserEmail2: delilveryObj.UserEmail2,
          UserEmail3: delilveryObj.UserEmail3,
          Division: delilveryObj.Division,
          DeliveryNo: delilveryObj.DeliveryNo,
          SignatureRemarks: delilveryObj.SignatureRemarks,
          CustomerPhone: delilveryObj.CustomerPhone,
        },
        "modified"
      );
    } catch (error) {
      console.log({ error });
    }
    setloading(false);
    updateSingleDriverOrder(OrderId, SIGNED, tag);
    callback(setSignaturePresent, setEmptySignatureError);
  });
};

/* Adding past orders */
let addPastDriverOrdersListInDb = (orderList) => {
  console.log("inside addPastDrive1rOrdersListInDb");
  getPastDriverOrdersList()?.length > 0 && deletePastDiverOrder();
  orderList.forEach((item) => {
    addPastSingleDriverOrders(
      item.DIVISION,
      item.CUSTNAME,
      item.CUSTPHONE,
      item.CUSTEMAIL,
      item.TABLENAME,
      item.DELIVERYNO,
      item.DELIVERYDATE,
      item.STOCKNAME,
      item.CUSTCODE,
      item.TRUCKNO,
      item.SITENAME,
      item.SIGNED,
      item.orderPdf,
      item.receiptPdf,
      item.receiptData,
      moment(item?.DELIVERYDATE).format("LL") === moment().format("LL")
        ? "today"
        : "past",
      item.primary_email
    );
  });
};

/* Adding today order */
let addTodayDriverOrdersListInDb = (orderList) => {
  console.log("inside addTodayDriverOrdersListInDb");
  getTodayDriverOrdersList()?.length > 0 && deleteTodayDiverOrder();
  orderList.forEach((item) => {
    addTodaySingleDriverOrders(
      item.DIVISION,
      item.CUSTNAME,
      item.CUSTPHONE,
      item.CUSTEMAIL,
      item.TABLENAME,
      item.DELIVERYNO,
      item.DELIVERYDATE,
      item.STOCKNAME,
      item.CUSTCODE,
      item.TRUCKNO,
      item.SITENAME,
      item.SIGNED,
      item.orderPdf,
      item.receiptPdf,
      item.receiptData,
      moment(item?.DELIVERYDATE).format("LL") === moment().format("LL")
        ? "today"
        : "past",
      item.primary_email
    );
  });
};

/* deleting taday order */
let deleteTodayDiverOrder = () => {
  console.log("inside deleteTodayDiverOrder");
  realmdb.write(() => {
    realmdb.delete(getTodayDriverOrdersList());
  });
};

/* deleting past order */
let deletePastDiverOrder = () => {
  console.log("inside deletePastDiverOrder");
  realmdb.write(() => {
    realmdb.delete(getPastDriverOrdersList());
  });
};

/* deleting settled order of specific id */
let deleteSyncedSettledDriverOrder = (_id) => {
  realmdb.write(() => {
    realmdb.delete(
      realmdb.objects("SettledDriverOrders").filtered("_id =" + _id)
    );
  });
};

export {
  addPastDriverOrdersListInDb,
  addPastSingleDriverOrders,
  addSingleSettledDriverOrder,
  addTodayDriverOrdersListInDb,
  addTodaySingleDriverOrders,
  deletePastDiverOrder,
  deleteSyncedSettledDriverOrder,
  deleteTodayDiverOrder,
  getPastDriverOrdersList,
  getSettledDriverOrders,
  getTodayDriverOrdersList,
  updateSingleDriverOrder,
};

