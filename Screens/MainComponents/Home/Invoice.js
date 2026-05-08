// Invoice.js
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
import { PrintIcon, searchIcon } from "../../../Images";
import {
  getDivisionList,
  getInvoiceList,
} from "../../../utility/ApiHelpers/StagingApis";
import { modalBackgroundColor, primaryColor } from "../../../utility/colors";
import ButtonWithLoader from "../../CommonComponents/ButtonLoader";
import DropDownComponent from "../../CommonComponents/DropDownComponent";
import HeaderComponent from "../../CommonComponents/Header";
import LoaderComponent from "../../CommonComponents/LoaderComponent";
import OfflineNotice from "../../CommonComponents/OfflineNotice";

const Invoice = (props) => {
  //Effect
  const [InternetStatus, setInternetStatus] = useState(true);
  const [invoiceList, setInvoiceList] = useState([]);
  const [divisionList, setdivisionList] = useState([]);
  const [division, setdivision] = useState("");
  const [salesManList, setSalesManList] = useState([]);
  const [salesMan, setSalesMan] = useState("");
  const [keyword, setKeyword] = useState("");
  const [UserToken, setUserToken] = useState("");
  const [Page, setPage] = useState(1);
  const [footerLoading, setFooterLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [noMorePage, setNoMorePage] = useState(false);
  const [isDivisionModalVisible, setIsDivisionModalVisible] = useState(false);
  const [isSalesManModalVisible, setIsSalesManModalVisible] = useState(false);

  useEffect(() => {
    NetInfo.addEventListener((state) => {
      setInternetStatus(state.isConnected);
    });
  }, [InternetStatus]);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const UserToken = await AsyncStorage.getItem("access_token");
      if (UserToken !== null) {
        setUserToken(UserToken);

        // Fetch division list
        const divisionResponse = await getDivisionList(UserToken);
        const divisionData = divisionResponse?.data;
        setdivisionList(divisionData);
        if (divisionData?.length > 0) {
          // Set the division state to the first division in the list
          setdivision(divisionData[0]);
          // Fetch invoice list using the first division
          await getInvoices(
            divisionData[0], // Pass the first division as the parameter
            keyword,
            invoiceList,
            Page,
            setLoading
          );
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  /*   const getSalesMan = async (division) => {
    const UserToken = await AsyncStorage.getItem("access_token");
    const salesmanResponse = await getSalesManList(UserToken, division);
    const salesManData = salesmanResponse?.data;
    console.log({ salesmanResponse, salesManData });
    setSalesManList(salesManData);
  }; */

  const getInvoices = async (
    division,
    keyword,
    invoiceList,
    Page,
    setLoading
  ) => {
    const UserToken = await AsyncStorage.getItem("access_token");
    await getInvoiceList(
      UserToken,
      division, // Pass the first division as the parameter
      keyword,
      invoiceList,
      setInvoiceList,
      Page,
      setPage,
      setFooterLoading,
      setNoMorePage,
      setLoading
    );
  };

  const RenderFootorComponent = () => {
    return invoiceList?.length > 0 ? (
      //Footer View with Load More button
      noMorePage === false ? (
        <View style={styles.footer}>
          <ButtonWithLoader
            onPress={async () => {
              await getInvoices(division, keyword, invoiceList, Page);
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
            <Text
              style={{ paddingTop: 5, fontSize: 16 }}
            >{`Invoice No: ${item?.CMID}`}</Text>
            <TouchableOpacity
              onPress={() => {
                props.navigation.navigate("DriverInvoice", {
                  Division: item?.division,
                  InvoiceNo: item?.CMID,
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
          </View>
        </View>
      </View>
    );
  };

  const toggleDivisionModal = () => {
    setIsDivisionModalVisible(!isDivisionModalVisible);
  };

  /*  const toggleSalesManModal = () => {
    setSalesManList([]);
    getSalesMan(division);
    setIsSalesManModalVisible(!isSalesManModalVisible);
  }; */

  return (
    <View style={styles.container}>
      <HeaderComponent
        BackTitle={true}
        Title={"Invoice"}
        onBackPress={() => props.navigation.goBack()}
      />
      <OfflineNotice
        isConnected={InternetStatus}
        setIsConnected={setInternetStatus}
      />
      {isDivisionModalVisible && (
        <DropDownComponent
          divisionList={divisionList}
          isModalVisible={isDivisionModalVisible}
          setIsModalVisible={setIsDivisionModalVisible}
          SalesMan={false}
          onSelectDivision={(item) => {
            setdivision(item);
            // setSalesManList([]);
            // setSalesMan("");
            toggleDivisionModal();
          }}
        />
      )}
      {/*  {isSalesManModalVisible && (
        <DropDownComponent
          divisionList={salesManList}
          isModalVisible={isSalesManModalVisible}
          setIsModalVisible={setIsSalesManModalVisible}
          SalesMan={true}
          onSelectDivision={(item) => {
            setSalesMan(item?.SalesMan);
            toggleSalesManModal();
          }}
        />
      )} */}
      <View style={styles.filterContainer}>
        {/* Division Dropdown */}
        <TouchableOpacity
          style={styles.divisionSelect}
          onPress={toggleDivisionModal}
        >
          <Text>{division}</Text>
        </TouchableOpacity>
        {/* Sales man Dropdown */}
        {/* <TouchableOpacity
          style={styles.divisionSelect}
          onPress={toggleSalesManModal}
        >
          <Text>{salesMan ? salesMan : "Select sales man"}</Text>
        </TouchableOpacity> */}
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
            setInvoiceList([]);
            // Call the getInvoiceList API with selected division and keyword
            getInvoices(division, keyword, [], 1, setLoading);
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
      {invoiceList.length > 0 && loading === false ? (
        <View style={[styles.container, { marginBottom: 20, marginTop: 5 }]}>
          <FlatList
            data={invoiceList}
            keyExtractor={(item, index) => index + ""}
            ListFooterComponent={RenderFootorComponent}
            onEndReachedThreshold={1}
            removeClippedSubviews={true}
            extraData={invoiceList}
            renderItem={RenderOrderData}
          />
        </View>
      ) : !invoiceList.length > 0 && loading === false ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text>{"No Invoice(s) found.."}</Text>
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
    </View>
  );
};

export default Invoice;

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
});
