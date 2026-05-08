import moment from "moment";
import { Alert } from "react-native";
import { deleteSyncedSettledDriverOrder } from "../../Screens/db/driverOrders/crud";

// Staging url 15-jul-2024
// export const mainUrl = "https://kingdom.thatsmytask.com/";

// production url 15-jul-2024
export const mainUrl = "https://app.kingdom.bh:8443/";

const StagApiUrl = `${mainUrl}api`;
export const SignatureUrl = `${mainUrl}delivery-notes/`;
const countryCode = "+973";
const version = "/v2";
export const whatsappURL = `https://api.whatsapp.com/send?phone=${countryCode}`;

//Order V2

// Updating ZERO VAT
export const UpdateZeroVat = (
  NOTRANSPORT,
  ZEROVAT,
  SLNO,
  UserToken,
  CallBack
) => {
  fetch(`${StagApiUrl}/v2/order/${SLNO}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + UserToken,
    },
    body: JSON.stringify({
      ZEROVAT: ZEROVAT,
      NOTRANSPORT: NOTRANSPORT,
    }),
  })
    .then((response) => {
      if (response.status === 200) {
        response.json().then((responseJson) => {
          CallBack();
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

// Submit

export const SubmitOrder = (SLNO, UserToken, CallBack) => {
  fetch(`${StagApiUrl}/v2/order/${SLNO}/complete`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + UserToken,
    },
  })
    .then((response) => {
      if (response.status === 200 || response.status === 422) {
        response.json().then((responseJson) => {
          CallBack({ ...responseJson, status: response.status });
          // CallBack(responseJson)
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

// Delete Order

export const DeleteOrderToServer = (orderNo, UserToken, SuccessCallback) => {
  fetch(`${StagApiUrl}/v2/order/${orderNo}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + UserToken,
    },
  })
    .then((response) => {
      if (response.status === 200) {
        response.json().then((responseJson) => {
          SuccessCallback();
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

// Print item Receipt

export const GetSalesOrderItemReceipt = (
  OrderId,
  OrderType,
  ItemId,
  ERPOrderNo,
  Division,
  UserToken,
  CallBack,
  setloading
) => {
  fetch(
    `${StagApiUrl}/v2/orders/${OrderType}/${OrderId}/receipt/${ItemId}?ERPOrderNo=${ERPOrderNo}&Division=${Division}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + UserToken,
      },
    }
  )
    .then((response) => {
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          CallBack(responseJson);
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => setloading(false));
};

export const GetSalesOrderItemInvoice = (
  OrderId,
  OrderType,
  ItemId,
  ERPOrderNo,
  Division,
  InvoiceNo,
  UserToken,
  CallBack,
  setloading
) => {
  const url = `${StagApiUrl}/v2/invoices/${InvoiceNo}/details?division=${Division}`;
  // const url = `${StagApiUrl}/v2/orders/${OrderType}/${OrderId}/invoice/${ItemId}?ERPOrderNo=${ERPOrderNo}&Division=${Division}&InvoiceNo=${InvoiceNo}`;
  console.log({ url });
  fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + UserToken,
    },
  })
    .then((response) => {
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          CallBack(responseJson);
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => setloading(false));
};

// Print Receipt

export const GetSalesReceiptPdf = (
  OrderId,
  OrderType,
  UserToken,
  CallBack,
  setloading
) => {
  fetch(`${StagApiUrl}/v2/orders/${OrderType}/${OrderId}/receipt`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + UserToken,
    },
  })
    .then((response) => {
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          CallBack(responseJson);
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => setloading(false));
};

// Get Order Listing

export const GetAllOrdersFromServer = (OrderObject, CallBack, setloading) => {
  console.log(`${StagApiUrl}/v2/order/list?page=` + OrderObject?.page);
  fetch(`${StagApiUrl}/v2/order/list?page=` + OrderObject?.page, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + OrderObject?.UserToken,
    },
  })
    .then((response) => {
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          CallBack(responseJson);
        });
      } else {
        //Alert.alert("Something went wrong.");
        console.log("Sales person order response", response.status);
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => setloading(false));
};

// Update Item = {Step-2 Part-4}

export const UpdateItemToOrder = (
  orderNo,
  itemNo,
  UserToken,
  UpdateObject,
  SuccessCallback
) => {
  fetch(`${StagApiUrl}/v2/order/${orderNo}/item/${itemNo}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + UserToken,
    },
    body: JSON.stringify(UpdateObject),
  })
    .then((response) => {
      if (response?.status === 200) {
        response.text().then((responseJson) => {
          SuccessCallback();
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

// Delete Item - {Step-2 Part-3}

export const DeleteItemFromOrder = (
  orderNo,
  itemNo,
  remark,
  UserToken,
  SuccessCallback
) => {
  fetch(`${StagApiUrl}/v2/order/${orderNo}/item/${itemNo}?remark=${remark}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + UserToken,
    },
  })
    .then((response) => {
      if (response.status === 200) {
        response.json().then((responseJson) => {
          SuccessCallback();
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

// Add item - {Step-2 Part-2}

export const AddNewItemToOrder = (
  orderNo,
  ItemObject,
  UserToken,
  SuccessCallback,
  setLoaderFalse
) => {
  fetch(`${StagApiUrl}/v2/order/${orderNo}/item`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + UserToken,
    },
    body: JSON.stringify(ItemObject),
  })
    .then((response) => {
      setLoaderFalse();
      if (response.status === 200) {
        response.json().then((responseJson) => {
          SuccessCallback();
          // CallBack(responseJson)
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

// Get Order Detail - {Step-2 Part-1}

export const GetOrderDetailFromServer = (UserToken, orderNo, CallBack) => {
  fetch(`${StagApiUrl}/v2/order/${orderNo}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + UserToken,
    },
  })
    .then((response) => {
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          CallBack(responseJson);
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

// Send Customer Detail - {Step-1}
export const SendCustomerDetailtToServer = (
  CustomerDetailObject,
  UserToken,
  NextPage,
  setLoading
) => {
  fetch(`${StagApiUrl}/v2/order`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + UserToken,
    },
    body: JSON.stringify(CustomerDetailObject),
  })
    .then((response) => {
      setLoading(false);
      if (response.status === 200) {
        response.json().then((responseJson) => {
          NextPage(
            responseJson.data.SLNO,
            responseJson?.data?.ZEROVAT,
            CustomerDetailObject.NOTRANSPORT
          );
          // CallBack(responseJson)
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

//User

//Login User
export const loginUser = (UserObject, CallBack, setloading) => {
  let formdata = new FormData();
  formdata.append("username", UserObject?.UserName);
  formdata.append("password", UserObject?.Password);

  fetch(`${StagApiUrl}/login`, {
    method: "POST",

    body: formdata,
  })
    .then((response) => {
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          CallBack(responseJson);
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => setloading(false));
};

//LogOut User

export const logoutUser = (UserToken, CallBack) => {
  fetch(`${StagApiUrl}/logout`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + UserToken,
    },
  })
    .then((response) => {
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          CallBack(responseJson);
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

//Customers List as per Order Type

export const GetCustomersByOrderType = (OrderObject, CallBack, setloading) => {
  fetch(
    `${StagApiUrl}/customer?customer_type=${OrderObject?.OrderType}&keyword=` +
      OrderObject?.CustomerName,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + OrderObject?.UserToken,
      },
    }
  )
    .then((response) => {
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          CallBack(responseJson);
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => setloading(false));
};

export const GetCustomersWithPagination = (
  CustomerObject,
  CallBack,
  setloading
) => {
  console.log("Token", CustomerObject?.UserToken);

  console.log(
    `${StagApiUrl}/customer/list?customer_type=` +
      CustomerObject?.OrderType +
      "&page=" +
      CustomerObject?.Page +
      "&keyword=" +
      CustomerObject?.CustomerName
  );

  fetch(
    `${StagApiUrl}/customer/list?customer_type=` +
      CustomerObject?.OrderType +
      "&page=" +
      CustomerObject?.Page +
      "&keyword=" +
      CustomerObject?.CustomerName,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + CustomerObject?.UserToken,
      },
    }
  )
    .then((response) => {
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          CallBack(responseJson, CustomerObject?.SearchList);
        });
      } else {
        console.log("Customer list response", response.status);
        //  Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => setloading(false));
};

//Order List

export const GetAllOrders = (UserToken, CallBack, setloading) => {
  fetch(`${StagApiUrl}/order`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + UserToken,
    },
  })
    .then((response) => {
      console.log("Api response", response, response.status);
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          CallBack(responseJson);
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => setloading(false));
};

export const GetAllOrdersPagination = (OrderObject, CallBack, setloading) => {
  console.log(`${StagApiUrl}/order/list?page=` + OrderObject?.page);
  fetch(`${StagApiUrl}/order/list?page=` + OrderObject?.page, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + OrderObject?.UserToken,
    },
  })
    .then((response) => {
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          CallBack(responseJson);
        });
      } else {
        //Alert.alert("Something went wrong.");
        console.log("Sales person order response", response.status);
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => setloading(false));
};

//Create Order

export const CreateSendOrders = (SendOrderObject, UserToken, NavigateHome) => {
  fetch(`${StagApiUrl}/order`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + UserToken,
    },
    body: JSON.stringify(SendOrderObject),
  })
    .then((response) => {
      if (response.status === 200) {
        response.json().then((responseJson) => {
          NavigateHome();
          // CallBack(responseJson)
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

//Update Orders

export const UpdateOrders = (SendOrderObject, CallBack, UserToken) => {
  fetch(`${StagApiUrl}/order/` + SendOrderObject.ORDERID, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + UserToken,
    },
    body: JSON.stringify(SendOrderObject),
  })
    .then((response) => {
      if (response?.status === 200) {
        response.text().then((responseJson) => {
          CallBack(responseJson);
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

//Delete Orders

export const DeleteOrder = (
  OrderId,
  DeleteRemark,
  UserToken,
  GetDataCallFunc
) => {
  console.log(`${StagApiUrl}/order/` + OrderId + "?remark=" + DeleteRemark);
  fetch(`${StagApiUrl}/order/` + OrderId + "?remark=" + DeleteRemark, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + UserToken,
    },
  })
    .then((response) => {
      if (response?.status === 200) {
        response.text().then((responseJson) => {
          console.log("Delete order response", responseJson);
          GetDataCallFunc();
        });
      } else {
        response.json().then((responseJson) => {
          console.log("Delete order error response", responseJson);
          Alert.alert(responseJson?.message);
        });
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

//Site List

export const GetAllSites = (UserToken, SiteName, CallBack, setloading) => {
  fetch(`${StagApiUrl}/site?keyword=` + SiteName, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + UserToken,
    },
  })
    .then((response) => {
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          CallBack(responseJson);
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => setloading(false));
};

export const GetSitesPagination = (SiteObject, CallBack, setloading) => {
  let url =
    `${StagApiUrl}/site/list?keyword=` +
    SiteObject?.SiteName +
    "&page=" +
    SiteObject?.Page;

  if (SiteObject?.orderType && SiteObject?.customerCode) {
    url =
      `${StagApiUrl}/site/list?keyword=` +
      SiteObject?.SiteName +
      "&page=" +
      SiteObject?.Page +
      "&division=" +
      SiteObject?.orderType +
      "&custCode=" +
      SiteObject?.customerCode;
  }

  console.log(url);

  fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + SiteObject?.UserToken,
    },
  })
    .then((response) => {
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          CallBack(responseJson, SiteObject?.SearchList);
        });
      } else {
        console.log("Get Customer Site response", response.status);
        // Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => setloading(false));
};

// fetch site data
export const getSiteList = async (
  userToken,
  keyword,
  page,
  searchList,
  customerCode,
  division,
  siteList,
  setSiteList,
  setPage,
  setLoading,
  setFooterLoading,
  setNoMorePage
) => {
  setFooterLoading && setFooterLoading(true);
  setLoading && setLoading(true);
  const url = `${StagApiUrl}/site/list?keyword=${keyword}&page=${page}${
    searchList ? `&searchList=true` : ""
  }${customerCode ? `&custCode=${customerCode}` : ""}${
    division ? `&division=${division}` : ""
  }`;
  console.log({ url });
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + userToken,
      },
    });

    if (response?.status === 200) {
      setFooterLoading && setFooterLoading(false);
      setLoading && setLoading(false);
      const responseJson = await response.json();
      const lastPage = responseJson.pagination?.last_page;
      console.log({
        page,
        last_page: responseJson.pagination.last_page,
        length: responseJson.data.length,
        current: siteList.length,
      });

      if (page === lastPage) {
        setSiteList(
          siteList.length > 0
            ? [...siteList, ...responseJson.data]
            : responseJson.data
        );
        setNoMorePage(true);
      } else {
        setLoading && setLoading(false);
        setPage(page + 1);
        setSiteList(
          siteList.length > 0
            ? [...siteList, ...responseJson.data]
            : responseJson.data
        );
        setNoMorePage(false);
      }
    } else {
      setLoading && setLoading(false);
      setFooterLoading && setFooterLoading(false);
      throw new Error("Something went wrong.");
    }
  } catch (error) {
    console.error(error);
    setLoading && setLoading(false);
    throw error;
  }
};

// fetch customer data
export const getCustomerList = async (
  userToken,
  keyword,
  orderType,
  page,
  searchList,
  customerList,
  setCustomerList,
  setPage,
  setLoading,
  setFooterLoading,
  setNoMorePage
) => {
  setFooterLoading && setFooterLoading(true);
  setLoading && setLoading(true);
  const url = `${StagApiUrl}/customer/list?${
    orderType !== "" ? `customer_type=${orderType}` : ""
  }&page=${page}&keyword=${keyword}${searchList ? `&searchList=true` : ""}`;
  console.log({ url });
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + userToken,
      },
    });

    if (response?.status === 200) {
      setFooterLoading && setFooterLoading(false);
      setLoading && setLoading(false);
      const responseJson = await response.json();
      const lastPage = responseJson.pagination?.last_page;
      console.log("getCustomerList", {
        page,
        last_page: responseJson.pagination,
        length: responseJson.data.length,
        current: customerList.length,
      });

      if (page === lastPage) {
        setCustomerList(
          customerList.length > 0
            ? [...customerList, ...responseJson.data]
            : responseJson.data
        );
        setNoMorePage(true);
      } else {
        setLoading && setLoading(false);
        setPage(page + 1);
        setCustomerList(
          customerList.length > 0
            ? [...customerList, ...responseJson.data]
            : responseJson.data
        );
        setNoMorePage(false);
      }
    } else {
      setLoading && setLoading(false);
      setFooterLoading && setFooterLoading(false);
      throw new Error("Something went wrong.");
    }
  } catch (error) {
    console.error(error);
    setLoading && setLoading(false);
    throw error;
  }
};

// Division List
export const GetAllDivisions = (DivisionObject, CallBack) => {
  fetch(`${StagApiUrl}/getdivision`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + DivisionObject?.UserToken,
    },
  })
    .then((response) => {
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          CallBack(responseJson);
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

//Stock List

export const GetAllStocks = (StockObject, CallBack) => {
  fetch(`${StagApiUrl}/stock`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + StockObject?.UserToken,
    },
  })
    .then((response) => {
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          CallBack(responseJson, StockObject?.Division);
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

export const GetStocksByDivision = (StockObject, CallBack, setloading) => {
  console.log(
    "Stock Url",
    `${StagApiUrl}/stock/` +
      StockObject?.Division +
      "?keyword=" +
      encodeURIComponent(StockObject?.StockName) +
      "&page=" +
      StockObject?.Page +
      "&orderType=" +
      StockObject?.OrderType +
      "&custName=" +
      encodeURIComponent(StockObject?.CustomerName) +
      "&site=" +
      encodeURIComponent(StockObject?.SiteName)
  );
  fetch(
    `${StagApiUrl}/stock/` +
      StockObject?.Division +
      "?keyword=" +
      encodeURIComponent(StockObject?.StockName) +
      "&page=" +
      StockObject?.Page +
      "&orderType=" +
      StockObject?.OrderType +
      "&custName=" +
      encodeURIComponent(StockObject?.CustomerName) +
      "&site=" +
      encodeURIComponent(StockObject?.SiteName),
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + StockObject?.UserToken,
      },
    }
  )
    .then((response) => {
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          CallBack(responseJson, StockObject?.SearchList);
        });
      } else {
        console.log("Stock list", response.status);
        //Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => setloading(false));
};

//Validate Customer

export const ValidateCustomers = (CustomerObject, CallBack) => {
  let CustCodeWithoutComma = (CustomerObject?.CustomerCode).replace(",", "");
  fetch(
    `${StagApiUrl}/customer/validate?customer_code=${CustCodeWithoutComma}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + CustomerObject?.UserToken,
      },
    }
  )
    .then((response) => {
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          CallBack(responseJson);
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

//Driver Orders

export const GetAllDriverOrders = (UserToken, CallBack, setloading) => {
  fetch(`${StagApiUrl}/delivery/orders`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + UserToken,
    },
  })
    .then((response) => {
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          CallBack(responseJson);
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => setloading(false));
};

/* Driver orders api    */
export const GetDriverOrdersPagination = (
  OrderObject,
  CallBack,
  setloading,
  source
) => {
  setloading(true);
  console.log(
    `${StagApiUrl}${version}/delivery/orders/list?page=${OrderObject?.page}&source=${source}`
  );
  fetch(
    `${StagApiUrl}${version}/delivery/orders/list?page=${OrderObject?.page}&source=${source}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + OrderObject?.UserToken,
      },
    }
  )
    .then((response) => {
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          console.log("GetDriverOrdersPagination", response.status);
          CallBack(responseJson);
        });
      } else {
        //Alert.alert("Something went wrong.");
        console.log("Driver order listing", response.status);
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => setloading(false));
};

export const SendOrderSignature = (
  SendOrderObject,
  CallBack,
  setloading,
  setSignaturePresent,
  setEmptySignatureError
) => {
  setloading(true);
  console.log("SendOrderObject?.UserToken", SendOrderObject?.UserToken);
  let formdata = new FormData();
  formdata.append("signature", SendOrderObject?.Signature);
  formdata.append("customer_email_1", SendOrderObject?.UserEmail);
  formdata.append("customer_email_2", SendOrderObject?.UserEmail2);
  formdata.append("customer_email_3", SendOrderObject?.UserEmail3);
  formdata.append("SignatureRemarks", SendOrderObject?.SignatureRemarks);
  formdata.append("customer_mobile", SendOrderObject?.CustomerPhone);
  console.log("formdata", formdata);
  console.log(
    "url",
    `${StagApiUrl}/delivery/${SendOrderObject?.Division}/order/${SendOrderObject?.DeliveryNo}`
  );
  fetch(
    `${StagApiUrl}/delivery/${SendOrderObject?.Division}/order/${SendOrderObject?.DeliveryNo}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + SendOrderObject?.UserToken,
      },
      body: formdata,
    }
  )
    .then((response) => {
      console.log(
        "failed signature response",
        response.status,
        JSON.stringify(response)
      );
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          CallBack(setSignaturePresent, setEmptySignatureError, responseJson);
        });
      } else {
        response.json().then((responseJson) => {
          console.log(
            "failed signature",
            response.status,
            JSON.stringify(responseJson)
          );
        });
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => setloading(false));
};

export const SyncSendOrderSignature = (
  SendOrderObject,
  setSuccessErrorModal,
  setModalText
) => {
  let formdata = new FormData();
  formdata.append("signature", SendOrderObject?.Signature);
  formdata.append("customer_email_1", SendOrderObject?.UserEmail);
  formdata.append("customer_email_2", SendOrderObject?.UserEmail2);
  formdata.append("customer_email_3", SendOrderObject?.UserEmail3);
  formdata.append("SignatureRemarks", SendOrderObject?.SignatureRemarks);
  formdata.append("customer_mobile", SendOrderObject?.CustomerPhone);

  fetch(
    `${StagApiUrl}/delivery/${SendOrderObject?.Division}/order/${SendOrderObject?.DeliveryNo}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + SendOrderObject?.UserToken,
      },
      body: formdata,
    }
  )
    .then((response) => {
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          deleteSyncedSettledDriverOrder(SendOrderObject._id);
          console.log("responseJson success", responseJson);
        });
      } else {
        console.log(response);
        response.json().then((responseJson) => {
          console.log("responseJson failed", responseJson);
        });
        setSuccessErrorModal(true);
        setModalText({ type: "error", text: "Sync Failed! Please try again." });
      }
    })
    .catch((error) => {
      console.log(error);
      setSuccessErrorModal(true);
      setModalText({ type: "error", text: "Sync Failed! Please try again." });
    });
};

export const GetDriverInvoicePdf = (
  OrderPdfObject,
  UserToken,
  CallBack,
  setloading
) => {
  console.log(
    `${StagApiUrl}/v2/delivery/${OrderPdfObject?.Division}/${OrderPdfObject?.DeliveryNo}`
  );
  fetch(
    `${StagApiUrl}/v2/delivery/${OrderPdfObject?.Division}/${OrderPdfObject?.DeliveryNo}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + UserToken,
      },
    }
  )
    .then((response) => {
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          CallBack(responseJson);
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => setloading(false));
};

export const GetDriverReceiptPdf = (
  OrderPdfObject,
  UserToken,
  CallBack,
  setloading
) => {
  fetch(
    `${StagApiUrl}/receipt/${OrderPdfObject?.Division}/${OrderPdfObject?.DeliveryNo}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + UserToken,
      },
    }
  )
    .then((response) => {
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          CallBack(responseJson);
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => setloading(false));
};

//Resend Delivery Note

export const ResendDeliveryNote = (InvoiceObject, setloading) => {
  let formdata = new FormData();
  formdata.append("customer_email_1", InvoiceObject?.Email1);
  formdata.append("customer_email_2", InvoiceObject?.Email2);
  formdata.append("customer_email_3", InvoiceObject?.Email3);

  fetch(
    `${StagApiUrl}/delivery/resend/` +
      InvoiceObject?.Division +
      "/" +
      InvoiceObject?.DeliveryNo,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + InvoiceObject?.UserToken,
      },
      body: formdata,
    }
  )
    .then((response) => {
      //stop loader here
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          Alert.alert("Email Resent successfully.");
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => setloading(false));
};

//Get resend customer emails

export const GetResendEmails = (CustomerObject, setloading, CallBack) => {
  fetch(`${StagApiUrl}/customer/${CustomerObject?.CUSTCODE}/emails`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + CustomerObject?.UserToken,
    },
  })
    .then((response) => {
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          CallBack(responseJson);
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => setloading(false));
};

//VAT Percentage

export const getVatPercentage = (userToken, setVATPercentage) => {
  fetch(`${StagApiUrl}/settings`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + userToken,
    },
  })
    .then((response) => {
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          setVATPercentage(parseFloat(responseJson?.data?.VATPERCENTAGE));
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

export const getCreditLimitForCustomer = (
  userToken,
  custCode,
  divisionName,
  CallBack
) => {
  fetch(
    `${StagApiUrl}/checkCreditLimit?custId=${custCode}&division=${divisionName}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + userToken,
      },
    }
  )
    .then((response) => {
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          CallBack(responseJson);
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

export const getReadyMixTotal = (
  userToken,
  unitCost,
  divisionName,
  qty,
  type,
  specific,
  CallBack
) => {
  fetch(
    `${StagApiUrl}/getReadyMixTotal?unitCost=${unitCost}&division=${divisionName}&qty=${qty}&type=${type}&specific=${specific}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + userToken,
      },
    }
  )
    .then((response) => {
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          console.log({ responseJson });
          CallBack(responseJson);
        });
      } else {
        console.log("response?.status", response?.status);
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

export const getDivisionList = async (userToken) => {
  return fetch(`${StagApiUrl}/getdivision`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + userToken,
    },
  })
    .then((response) => {
      if (response?.status === 200) {
        return response.json(); // Return the parsed JSON response
      } else {
        console.log("getDivisionList error status", response?.status);
        Alert.alert("Something went wrong.");
        throw new Error("Division list request failed");
      }
    })
    .catch((error) => {
      console.error(error);
      throw error; // Re-throw the error for handling in the calling function
    });
};

// invoice list
export const getInvoiceList = async (
  userToken,
  division,
  keyword,
  invoiceList,
  setInvoiceList,
  Page,
  setPage,
  setFooterLoading,
  setNoMorePage,
  setLoading
) => {
  setFooterLoading && setFooterLoading(true);
  setLoading && setLoading(true);
  const url = `${StagApiUrl}/v2/invoices?division=${division}&page=${Page}${
    keyword ? `&keyword=${keyword}` : ""
  }`;
  console.log({ url });
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + userToken,
      },
    });
    console.log("getInvoiceList  status", response?.status);

    if (response?.status === 200) {
      setFooterLoading && setFooterLoading(false);
      setLoading && setLoading(false);
      const responseJson = await response.json();
      const lastPage = responseJson.pagination?.last_page;
      console.log("getInvoiceList  status", responseJson);
      if (Page === lastPage) {
        setInvoiceList(
          invoiceList?.length > 0
            ? [...invoiceList, ...responseJson.data]
            : responseJson.data
        );
        setNoMorePage(true);
      } else {
        setLoading && setLoading(false);
        setPage(Page + 1);
        setInvoiceList(
          invoiceList?.length > 0
            ? [...invoiceList, ...responseJson.data]
            : responseJson.data
        );
        setNoMorePage(false);
      }
    } else {
      console.log("getInvoiceList error status", response?.status);
      setFooterLoading && setFooterLoading(false);
      setLoading && setLoading(false);
      throw new Error("Something went wrong.");
    }
  } catch (error) {
    console.error(error);
    setFooterLoading && setFooterLoading(false);
    setLoading && setLoading(false);
    throw error; // Re-throw the error for handling in the calling function
  }
};

export const GetCurrentDriveOrderItemInvoice = (
  Division,
  InvoiceNo,
  UserToken,
  CallBack,
  setloading
) => {
  const url = `${StagApiUrl}/v2/invoices/${InvoiceNo}/details?division=${Division}`;
  console.log({ GetCurrentDriveOrderItemInvoice: url });
  fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + UserToken,
    },
  })
    .then((response) => {
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          CallBack(responseJson);
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => setloading(false));
};

export const getSalesManList = async (userToken, division) => {
  const url = `${StagApiUrl}/order/${division}/sales-man`;
  console.log({ url });
  return fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + userToken,
    },
  })
    .then((response) => {
      if (response?.status === 200) {
        return response.json(); // Return the parsed JSON response
      } else {
        console.log("getSalesManList error status", response?.status);
        Alert.alert("Something went wrong.");
        throw new Error("SalesMan list request failed");
      }
    })
    .catch((error) => {
      console.error(error);
      throw error; // Re-throw the error for handling in the calling function
    });
};

// Function to get the list of companies
export const getCompaniesList = async (userToken, form = false) => {
  return fetch(
    `${StagApiUrl}/company/list?${form == true ? `form=${form}` : ""}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + userToken,
      },
    }
  )
    .then((response) => {
      if (response?.status === 200) {
        return response.json(); // Return the parsed JSON response
      } else {
        console.log("getCompaniesList error status", response?.status);
        Alert.alert("Something went wrong.");
        throw new Error("Companies list request failed");
      }
    })
    .catch((error) => {
      console.error(error);
      throw error; // Re-throw the error for handling in the calling function
    });
};

// Function to get the list of cash receipts
export const getCashReceiptList = async (
  userToken,
  company,
  keyword,
  filterDate,
  cashReceiptList,
  setCashReceiptList,
  Page,
  setPage,
  setFooterLoading,
  setNoMorePage,
  setLoading
) => {
  setFooterLoading && setFooterLoading(true);
  setLoading && setLoading(true);
  const url = `${StagApiUrl}/cash-receipt/list?company=${company}&page=${Page}${
    keyword ? `&search=${keyword}` : ""
  }${filterDate ? `&date=${moment(filterDate).format("YYYY-MM-DD")}` : ""}`;
  console.log({ url });
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + userToken,
      },
    });
    console.log("getCashReceiptList  status", response?.status);

    if (response?.status === 200) {
      setFooterLoading && setFooterLoading(false);
      setLoading && setLoading(false);
      const responseJson = await response.json();
      const lastPage = responseJson.pagination?.last_page;
      console.log("getCashReceiptList  status", responseJson);
      if (Page === lastPage) {
        setCashReceiptList(
          cashReceiptList?.length > 0
            ? [...cashReceiptList, ...responseJson.data]
            : responseJson.data
        );
        setNoMorePage(true);
      } else {
        setLoading && setLoading(false);
        setPage(Page + 1);
        setCashReceiptList(
          cashReceiptList?.length > 0
            ? [...cashReceiptList, ...responseJson.data]
            : responseJson.data
        );
        setNoMorePage(false);
      }
    } else {
      console.log("getCashReceiptList error status", response?.status);
      setFooterLoading && setFooterLoading(false);
      setLoading && setLoading(false);
      throw new Error("Something went wrong.");
    }
  } catch (error) {
    console.error(error);
    setFooterLoading && setFooterLoading(false);
    setLoading && setLoading(false);
    throw error; // Re-throw the error for handling in the calling function
  }
};

export const GetCurrentDriveOrderItemCashReceipt = (
  SLNO,
  UserToken,
  CallBack,
  setloading
) => {
  const url = `${StagApiUrl}/cash-receipt/${SLNO}/receipt`;
  console.log({ GetCurrentDriveOrderItemCashReceipt: url });
  fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + UserToken,
    },
  })
    .then((response) => {
      if (response?.status === 200) {
        response.json().then((responseJson) => {
          CallBack(responseJson);
        });
      } else {
        Alert.alert("Something went wrong.");
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => setloading(false));
};

// Function to get the list of payment modes
export const getPaymentModeList = async (userToken) => {
  return fetch(`${StagApiUrl}/payment-modes/list`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + userToken,
    },
  })
    .then((response) => {
      if (response?.status === 200) {
        return response.json(); // Return the parsed JSON response
      } else {
        console.log("getPaymentModeList error status", response?.status);
        Alert.alert("Something went wrong.");
        throw new Error("Payment Mode List request failed");
      }
    })
    .catch((error) => {
      console.error(error);
      throw error; // Re-throw the error for handling in the calling function
    });
};

export const createCashReceipt = async (UserToken, receiptData) => {
  const url = `${StagApiUrl}/cash-receipt/create`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${UserToken}`,
      },
      body: JSON.stringify(receiptData),
    });
    return response;
  } catch (error) {
    console.error("Error creating cash receipt:", error);
    throw error;
  }
};

export const updateCashReceipt = async (UserToken, receiptData) => {
  const url = `${StagApiUrl}/cash-receipt/${receiptData.SLNO}/update`;
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${UserToken}`,
      },
      body: JSON.stringify(receiptData),
    });
    return response;
  } catch (error) {
    console.error("Error creating cash receipt:", error);
    throw error;
  }
};
