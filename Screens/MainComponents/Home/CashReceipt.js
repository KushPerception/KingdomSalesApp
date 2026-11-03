// CashReceipt.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import {
  AddPurpleIcon,
  CalenderIcon,
  CancelIcon,
  EditIcon,
  PrintIcon,
  searchIcon,
} from "../../../Images";
import {
  getCashReceiptList,
  getCompaniesList,
} from "../../../utility/ApiHelpers/StagingApis";
import {
  BlackColor,
  modalBackgroundColor,
  primaryColor,
} from "../../../utility/colors";
import ButtonWithLoader from "../../CommonComponents/ButtonLoader";
import HeaderComponent from "../../CommonComponents/Header";
import LoaderComponent from "../../CommonComponents/LoaderComponent";
import OfflineNotice from "../../CommonComponents/OfflineNotice";
import moment from "moment";
import { W } from "../../../utility/GlobalStyles";
import DatePicker from 'react-native-date-picker';
import CompanyDropdownComponent from "../../CommonComponents/CompanyDropdownComponent";

const CashReceipt = (props) => {
  //Effect
  const [InternetStatus, setInternetStatus] = useState(true);
  const [cashReceiptList, setCashReceiptList] = useState([]);
  const [companiesList, setCompaniesList] = useState([]);
  const [company, setCompany] = useState("");
  const [keyword, setKeyword] = useState("");
  const [UserToken, setUserToken] = useState("");
  const [Page, setPage] = useState(1);
  const [footerLoading, setFooterLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [noMorePage, setNoMorePage] = useState(false);
  const [isCompanyModalVisible, setIsCompanyModalVisible] = useState(false);
  const [ShowDatePicker, setShowDatePicker] = useState(false);
  const [filterDate, setFilterDate] = useState(null);

  useEffect(() => {
    NetInfo.addEventListener((state) => {
      setInternetStatus(state.isConnected);
    });
  }, [InternetStatus]);

  // useEffect(() => {
  //   // Check if there's a refreshData callback passed from navigation
  //   const refreshDataCallback = props.route.params?.refreshData;
  //   if (refreshDataCallback) {
  //     console.log("calllews");
  //     setCompaniesList([]);
  //     getData();
  //   }
  // }, [props.route.params?.refreshData]);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const UserToken = await AsyncStorage.getItem("access_token");
      if (UserToken !== null) {
        setUserToken(UserToken);

        // Fetch division list
        const companiesResponse = await getCompaniesList(UserToken);
        const campaniesData = companiesResponse?.data;
        console.log({ campaniesData });
        setCompaniesList(campaniesData);
        if (campaniesData?.length > 0) {
          // Set the division state to the first division in the list
          setCompany(campaniesData[0].Division);
          // Fetch cash receipt list using the first division
          await getCashReceipts(
            campaniesData[0].Division, // Pass the first division as the parameter
            keyword,
            filterDate,
            cashReceiptList,
            Page,
            setLoading
          );
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getCashReceipts = async (
    company,
    keyword,
    filterDate,
    cashReceiptList,
    Page,
    setLoading
  ) => {
    const UserToken = await AsyncStorage.getItem("access_token");
    await getCashReceiptList(
      UserToken,
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
    );
  };

  const RenderFootorComponent = () => {
    return cashReceiptList?.length > 0 ? (
      //Footer View with Load More button
      noMorePage === false ? (
        <View style={styles.footer}>
          <ButtonWithLoader
            onPress={async () => {
              await getCashReceipts(
                company,
                keyword,
                filterDate,
                cashReceiptList,
                Page,
                setLoading
              );
            }}
            title={"Load More"}
            loading={footerLoading}
          />
        </View>
      ) : null
    ) : (
      <View style={{ marginVertical: 20 }}>
        <ActivityIndicator color="black" size="large" />
      </View>
    );
  };

  const RenderOrderData = ({ item, index }) => {
    console.log("cash receipts", { item, index });
    return (
      <View
        style={{
          flexDirection: "column",
          borderBottomWidth: 0.5,
          borderBottomColor: modalBackgroundColor,
        }}
      >
        <View
          key={index}
          style={{
            flexDirection: "column",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              padding: 25,
            }}
          >
            <View
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "space-between",
                padding: 25,
              }}
            >
              <Text
                style={{ paddingTop: 5, fontSize: 16 }}
              >{`No: ${item?.RCPNO}`}</Text>
              <Text style={{ paddingTop: 2, fontSize: 16 }}>{`Date: ${moment(
                item?.ReceiptDate
              ).format("YYYY-MM-DD")}`}</Text>
              <Text
                style={{ paddingTop: 2, fontSize: 16 }}
              >{`Customer: ${item.CustName}`}</Text>
              <Text
                style={{ paddingTop: 2, fontSize: 16 }}
              >{`Amount: ${item.Amount}`}</Text>
            </View>
            <View>
              <TouchableOpacity
                onPress={() => {
                  props.navigation.replace("DriverCashReceipt", {
                    SLNO: item?.SLNO,
                  });
                }}
                style={{ padding: 5 }}
              >
                <Image
                  resizeMode={"contain"}
                  source={PrintIcon}
                  style={{ width: 24, height: 24 }}
                />
              </TouchableOpacity>
              {item.Printed == null || item.Printed == false ? (
                <TouchableOpacity
                  onPress={() => {
                    props.navigation.replace("EditCashReceipt", {
                      cashReceipt: item,
                    });
                  }}
                  style={{ padding: 5, paddingTop: 20 }}
                >
                  <Image
                    resizeMode={"contain"}
                    source={EditIcon}
                    style={{ width: 24, height: 24 }}
                  />
                </TouchableOpacity>
              ) : (
                <></>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const toggleDivisionModal = () => {
    setIsCompanyModalVisible(!isCompanyModalVisible);
  };

  const onChangeFilterDate = (selectedValue) => {
    setShowDatePicker(!ShowDatePicker);
    setFilterDate(selectedValue);
  };

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const clearRefDate = () => {
    setFilterDate(null);
  };

  return (
    <View style={styles.container}>
      <HeaderComponent
        BackTitle={true}
        Title={"Cash Receipt"}
        onBackPress={() => props.navigation.goBack()}
      />
      <OfflineNotice
        isConnected={InternetStatus}
        setIsConnected={setInternetStatus}
      />
      {isCompanyModalVisible && (
        <CompanyDropdownComponent
          companyList={companiesList}
          isModalVisible={isCompanyModalVisible}
          setIsModalVisible={setIsCompanyModalVisible}
          onSelectDivision={(item) => {
            setCompany(item.Division);
            toggleDivisionModal();
          }}
        />
      )}
      {ShowDatePicker && (
        <DatePicker
          modal
          open={ShowDatePicker}
          date={filterDate ? new Date(filterDate) : new Date()}
          mode="date"
          minimumDate={oneYearAgo}
          maximumDate={new Date()}
          onConfirm={onChangeFilterDate}
          onCancel={() => setShowDatePicker(!ShowDatePicker)}
        />
      )}
      <View style={styles.filterContainer}>
        {/* Division Dropdown */}
        <TouchableOpacity
          style={styles.divisionSelect}
          onPress={toggleDivisionModal}
        >
          <Text>{company}</Text>
        </TouchableOpacity>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            onPress={() => setShowDatePicker(!ShowDatePicker)}
            style={{ ...styles.DateButtonStyle, width: W(200) }}
          >
            <Text style={styles.DivisionNameTextStyle}>
              {filterDate ? moment(filterDate).format("LL") : "Date"}
            </Text>
            <Image
              resizeMode="contain"
              source={CalenderIcon}
              style={styles.CalenderIconStyle}
            />
            {filterDate && (
              <TouchableOpacity onPress={clearRefDate}>
                <Image
                  resizeMode="contain"
                  source={CancelIcon}
                  style={styles.CalenderIconStyle}
                />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.filterContainer}>
        {/* Keyword Search Input */}
        <TextInput
          style={styles.keywordInput}
          placeholder="Search"
          value={keyword}
          onChangeText={(text) => setKeyword(text)}
        />
        {/* Search Button */}
        <TouchableOpacity
          onPress={() => {
            setCashReceiptList([]);
            // Call the getCashReceipts API with selected division and keyword
            getCashReceipts(company, keyword, filterDate, [], 1, setLoading);
          }}
          style={{
            marginLeft: 5,
            marginRight: 5,
            height: 40,
            backgroundColor: primaryColor,
            justifyContent: "center",
            alignItems: "center",
            borderColor: primaryColor,
            borderWidth: 1,
            borderRadius: 5,
            paddingHorizontal: 10,
          }}
        >
          <Image source={searchIcon} style={{ width: 25, height: 25 }} />
        </TouchableOpacity>
      </View>
      {cashReceiptList.length > 0 && loading === false ? (
        <View style={[styles.container, { marginBottom: 20, marginTop: 5 }]}>
          <FlatList
            data={cashReceiptList}
            keyExtractor={(item, index) => index + ""}
            ListFooterComponent={RenderFootorComponent}
            onEndReachedThreshold={1}
            removeClippedSubviews={true}
            extraData={cashReceiptList}
            renderItem={RenderOrderData}
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              setCashReceiptList([]);
              await getCashReceipts(company, keyword, filterDate, [], 1, setLoading);
              setRefreshing(false);
            }}
          />
        </View>
      ) : !cashReceiptList.length > 0 && loading === false ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text>{"No Cash Receipt(s) found.."}</Text>
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <LoaderComponent />
        </View>
      )}
      <View
        style={{
          flexDirection: "column",
          position: "absolute",
          bottom: 20,
          right: 25,
          justifyContent: "flex-end",
          alignItems: "flex-end",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            props.navigation.replace("CreateCashReceipt");
            setCompaniesList([]);
          }}
        >
          <Image source={AddPurpleIcon} style={{ width: 60, height: 60 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CashReceipt;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    margin: 10,
  },
  keywordInput: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  footer: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  CalenderIconStyle: {
    width: 18,
    height: 18,
    marginBottom: 4,
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    margin: 10,
  },
  divisionSelect: {
    flex: 1,
    marginLeft: 5,
    marginRight: 5,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  keywordInput: {
    flex: 1,
    marginLeft: 5,
    marginRight: 5,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  DateButtonStyle: {
    borderColor: BlackColor,
    marginLeft: 10,
    marginRight: 10,
    height: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
});
