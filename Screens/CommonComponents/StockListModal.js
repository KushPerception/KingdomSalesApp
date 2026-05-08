import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CancelIcon, CancelSiteIcon } from "../../Images/index";
import { GetStocksByDivision } from "../../utility/ApiHelpers/StagingApis";
import { W, fonts } from "../../utility/GlobalStyles";
import {
  BlackColor,
  PurpleColor,
  darkGreyTextColor,
  lightGreyColor,
  lightGreyTextInputColor,
  whiteColor,
} from "../../utility/colors";
import { formatPrice } from "../../utility/helpers";
import ListEmptyComponent from "../CommonComponents/ListEmptyComponent";
import ListSeparator from "../CommonComponents/ListSeparator";
import LoaderComponent from "../CommonComponents/LoaderComponent";

const StockListModal = (props) => {
  // Props
  let {
    Division,
    CloseStockModal,
    SetStockNameFunc,
    StockData,
    CreditOrder,
    CustomerName,
    SiteName,
  } = props;

  // States
  const [UserToken, setUserToken] = useState(null);
  const [StockList, setStockList] = useState([]);
  const [loading, setloading] = useState(true);
  const [StockName, setStockName] = useState("");
  const [Page, setPage] = useState(1);
  const [NextPageUrl, setNextPageUrl] = useState("");
  const [SearchList, setSearchList] = useState(false);
  const inputRef = useRef();

  // Effect
  useEffect(() => {
    if (SearchList === true && Page === 1) {
      return false;
    } else if (Page === 1) {
      console.log("Effect Page", Page);
      getData();
    }
  }, [Page, SearchList]);

  const getData = async () => {
    try {
      const UserToken = await AsyncStorage.getItem("access_token");
      setloading(true);
      if (UserToken !== null) {
        setUserToken(UserToken);
        GetStockListing(UserToken, Division, StockName, Page, SearchList);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const StockListCallback = (response, SearchList) => {
    console.log("SearchList=========", SearchList);
    if (SearchList === true) {
      setNextPageUrl(response?.pagination?.next_page_url);
      setStockList(response?.data);
    } else if (Page === 1) {
      setNextPageUrl(response?.pagination?.next_page_url);
      setStockList(response?.data);
    } else {
      setNextPageUrl(response?.pagination?.next_page_url);
      const NewStockList = [...StockList, ...response.data];
      setStockList(NewStockList);
    }
  };

  const GetStockListing = async (
    UserToken,
    Division,
    StockName,
    Page,
    SearchList
  ) => {
    if (SearchList === true) {
      let StockObject = {
        Division: Division,
        UserToken: UserToken,
        StockName: StockName,
        Page: 1,
        SearchList: SearchList,
        OrderType: CreditOrder === true ? "CREDIT" : "CASH",
        CustomerName: CustomerName,
        SiteName: SiteName,
      };

      console.log("StockObject ==== ", StockObject);
      GetStocksByDivision(StockObject, StockListCallback, setloading);
    } else {
      setPage(Page + 1);

      let StockObject = {
        Division: Division,
        UserToken: UserToken,
        StockName: StockName,
        Page: Page,
        SearchList: SearchList,
        OrderType: CreditOrder === true ? "CREDIT" : "CASH",
        CustomerName: CustomerName,
        SiteName: SiteName,
      };

      GetStocksByDivision(StockObject, StockListCallback, setloading);
    }
  };

  const OnChageStockname = async (stockname) => {
    if (stockname !== "") {
      setPage("");
      setSearchList(true);
      setStockName(stockname);
      GetStockListing(UserToken, Division, stockname, 1, true);
    } else {
      clearInput();
    }
  };

  const OnClickCloseModal = async () => {
    clearInput();
    CloseStockModal();
  };

  const clearInput = async () => {
    setPage(1);
    setStockName("");
    setSearchList(false);
    if (inputRef.current) {
      inputRef.current.clear();
    }
  };

  const OnReachEnd = async (Division, SearchList) => {
    if (SearchList === true) {
      GetStockListing(UserToken, Division, StockName, Page, true);
    } else {
      GetStockListing(UserToken, Division, StockName, Page, false);
    }
  };

  //Renders
  const renderSeparator = () => {
    return <ListSeparator />;
  };

  const RenderFootorComponent = () => {
    return (
      <View style={styles.footer}>
        {NextPageUrl === null || SearchList === true ? (
          false
        ) : (
          <ActivityIndicator size={25} color={PurpleColor} />
        )}
      </View>
    );
  };

  const RenderCustomerData = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() =>
          SetStockNameFunc(
            item?.STOCKNAME,
            item?.STOCKCODE,
            item?.CASHRATE,
            formatPrice(item?.CASHRATE, CreditOrder)
          )
        }
        style={styles.StockItemTouch}
      >
        <View style={{ width: "80%" }}>
          <Text>
            {item?.STOCKNAME} ({formatPrice(item?.CASHRATE, CreditOrder)})
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.ModalContainer}>
      {loading ? (
        <LoaderComponent />
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.HeaderRowTitleClose}>
            <Text style={styles.HeaderTitleText}>Stock List</Text>
            <TouchableOpacity
              onPress={() => OnClickCloseModal()}
              style={styles.CancelIconTouch}
            >
              <Image source={CancelIcon} style={styles.CancelIconStyle} />
            </TouchableOpacity>
          </View>
          {/* <ListSeparator/> */}
          <View style={styles.CenterTopMargin}>
            <TextInput
              ref={inputRef}
              style={styles.TextInputWidth}
              placeholder={"Search Stock Items"}
              placeholderTextColor={lightGreyTextInputColor}
              underlineColorAndroid="transparent"
              clearTextOnFocus={true}
              onFocus={() => setStockName("")}
              value={StockName}
              onChangeText={(StockName) => OnChageStockname(StockName)}

              // renderRightAccessory = {()=>RenderCustomerCancel()}
            />
            {StockName === "" ? (
              <View style={styles.InputCancelIconTouch} />
            ) : (
              <TouchableOpacity
                onPress={() => clearInput(UserToken, Division, "")}
                style={styles.InputCancelIconTouch}
              >
                <Image source={CancelSiteIcon} style={styles.CancelIconStyle} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.FlatlistContainer}>
            <FlatList
              data={StockList}
              extraData={StockList}
              keyExtractor={(item, index) => index + ""}
              ListFooterComponent={RenderFootorComponent}
              onEndReached={() =>
                NextPageUrl === null ? false : OnReachEnd(Division, SearchList)
              }
              onEndReachedThreshold={0}
              removeClippedSubviews={true}
              ItemSeparatorComponent={renderSeparator}
              ListEmptyComponent={
                <ListEmptyComponent EmptyTitle="No Stock Found" />
              }
              renderItem={RenderCustomerData}
            />
          </View>
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  ModalContainer: {
    flex: 0.9,
    backgroundColor: whiteColor,
  },
  HeaderRowTitleClose: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },
  CancelIconStyle: {
    width: 18,
    height: 18,
  },
  CancelIconTouch: {
    width: 50,
    height: 50,
  },
  HeaderTitleText: {
    color: darkGreyTextColor,
    fontFamily: fonts.Font_Bold,
    fontSize: 16,
    paddingLeft: 20,
  },
  FlatlistContainer: {
    flex: 1,
    marginTop: 20,
  },
  FlatlistItemTouch: {
    width: "100%",
    flexDirection: "row",
    height: 50,
    alignItems: "center",
  },
  CustomerCodeText: {
    color: lightGreyColor,
    paddingLeft: 20,
    paddingRight: 10,
    fontFamily: fonts.Font_Medium,
  },
  CustomerNameWidth: {
    width: "65%",
  },
  CenterTopMargin: {
    alignItems: "center",
    flexDirection: "row",
    marginLeft: 20,
  },
  TextInputWidth: {
    width: W(260),
    height: 40,
    borderWidth: 1,
    borderBottomColor: lightGreyTextInputColor,
    borderColor: whiteColor,
    color: BlackColor,
  },
  InputCancelIconTouch: {
    borderColor: whiteColor,
    borderWidth: 1,
    height: 40,
    width: 40,
    justifyContent: "center",
    borderBottomColor: lightGreyTextInputColor,
  },
  StockItemTouch: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  footer: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
});

export default StockListModal;
