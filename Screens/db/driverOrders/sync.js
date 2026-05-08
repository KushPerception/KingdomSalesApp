import {
  addPastDriverOrdersListInDb,
  addTodayDriverOrdersListInDb,
} from "./crud";

export const syncTodayDriverOrders = (orderList) => {
  addTodayDriverOrdersListInDb(orderList);
};

export const syncPastDriverOrders = (orderList) => {
  addPastDriverOrdersListInDb(orderList);
};
