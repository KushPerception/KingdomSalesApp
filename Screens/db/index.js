import Realm from "realm";
import {
  company_info,
  Customer,
  Driver,
  DriverOrders,
  order,
  OrderItems,
  PastDriverOrders,
  Print,
  SettledDriverOrders,
} from "./driverOrders/models";

let realmdb = new Realm({
  schema: [
    DriverOrders,
    PastDriverOrders,
    SettledDriverOrders,
    Print,
    company_info,
    order,
    Customer,
    Driver,
    OrderItems,
  ],
  path: "kingdom.realm",
  deleteRealmIfMigrationNeeded: true,
  schemaVersion: 4,
});

export default realmdb;
