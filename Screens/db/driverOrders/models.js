import Realm from "realm";

export class DriverOrders extends Realm.Object {}
export class PastDriverOrders extends Realm.Object {}
export class SettledDriverOrders extends Realm.Object {}
export class Print extends Realm.Object {}
export class company_info extends Realm.Object {}
export class order extends Realm.Object {}
export class Customer extends Realm.Object {}
export class Driver extends Realm.Object {}
export class OrderItems extends Realm.Object {}

DriverOrders.schema = {
  name: "DriverOrders",
  primaryKey: "_id",
  properties: {
    _id: "int",
    DIVISION: "string",
    CUSTNAME: "string?",
    CUSTPHONE: "string?",
    CUSTEMAIL: "string?",
    TABLENAME: "string",
    DELIVERYNO: "string",
    DELIVERYDATE: "string",
    STOCKNAME: "string",
    CUSTCODE: "string",
    TRUCKNO: "string",
    SITENAME: "string?",
    SIGNED: "string",
    orderPdf: "string",
    receiptPdf: "string",
    receiptData: "Print",
    tag: "string?",
    primaryEmail: "string",
    SYNCED: { type: "bool", default: false },
  },
};

PastDriverOrders.schema = {
  name: "PastDriverOrders",
  primaryKey: "_id",
  properties: {
    _id: "int",
    DIVISION: "string",
    CUSTNAME: "string?",
    CUSTPHONE: "string?",
    CUSTEMAIL: "string?",
    TABLENAME: "string",
    DELIVERYNO: "string",
    DELIVERYDATE: "string",
    STOCKNAME: "string",
    CUSTCODE: "string",
    TRUCKNO: "string",
    SITENAME: "string?",
    SIGNED: "string",
    orderPdf: "string",
    receiptPdf: "string",
    receiptData: "Print",
    tag: "string?",
    primaryEmail: "string",
    SYNCED: { type: "bool", default: false },
  },
};

SettledDriverOrders.schema = {
  name: "SettledDriverOrders",
  primaryKey: "_id",
  properties: {
    _id: "int",
    Signature: "string",
    UserToken: "string",
    UserEmail: "string",
    UserEmail2: "string?",
    UserEmail3: "string?",
    Division: "string",
    DeliveryNo: "string",
    SignatureRemarks: "string?",
    CustomerPhone: "string?",
    SYNCED: { type: "bool", default: false },
  },
};

Print.schema = {
  name: "Print",
  embedded: true,
  properties: {
    title: "string?",
    company_info: "company_info",
    order: "order",
  },
};

company_info.schema = {
  name: "company_info",
  embedded: true,
  properties: {
    title: "string?",
    group_vat: "string?",
    address: "string?",
    phone: "string?",
    email: "string?",
  },
};

order.schema = {
  name: "order",
  embedded: true,
  properties: {
    DELIVERYNO: "string?",
    DELIVERYDATE: "string?",
    DELIVERYTIME: "string?",
    ORDERNO: "string?",
    CUSTOMER: "Customer",
    SITE: "string?",
    LPO: "string?",
    DRIVER: "Driver",
    ITEMS: "OrderItems[]",
  },
};

Customer.schema = {
  name: "Customer",
  embedded: true,
  properties: {
    NAME: "string?",
    SIGNATURE: "string?",
  },
};

Driver.schema = {
  name: "Driver",
  embedded: true,
  properties: {
    NAME: "string?",
    SIGNATURE: "string?",
    SignatureRemarks: "string?",
  },
};

OrderItems.schema = {
  name: "OrderItems",
  embedded: true,
  properties: {
    NAME: "string?",
    QTY: "string?",
  },
};
