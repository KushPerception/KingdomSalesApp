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
import { getSiteList } from "../../utility/ApiHelpers/StagingApis";
import { W, fonts } from "../../utility/GlobalStyles";
import {
  BlackColor,
  darkGreyTextColor,
  lightGreyColor,
  lightGreyTextInputColor,
  whiteColor,
} from "../../utility/colors";
import ListSeparator from "../CommonComponents/ListSeparator";
import LoaderComponent from "../CommonComponents/LoaderComponent";
import ButtonWithLoader from "./ButtonLoader";

const CustomerSiteModal = (props) => {
  let { CloseSiteModal, OtherSite, ClickSiteName, orderType, customerCode } =
    props;

  // states
  const [userToken, setUserToken] = useState(null);
  const [siteList, setSiteList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [siteName, setSiteName] = useState("");
  const [page, setPage] = useState(1);
  const [searchList, setSearchList] = useState(false);
  const [footerLoading, setFooterLoading] = useState(false);
  const [noMorePage, setNoMorePage] = useState(false);

  // Ref
  const inputRef = useRef();

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const UserToken = await AsyncStorage.getItem("access_token");
      setLoading(true);
      if (UserToken !== null) {
        setUserToken(UserToken);
        loadSiteData(siteName, siteList, page, searchList, setLoading);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Function to load site data
  const loadSiteData = async (
    siteName,
    siteList,
    Page,
    SearchList,
    setLoading
  ) => {
    const UserToken = await AsyncStorage.getItem("access_token");
    try {
      await getSiteList(
        UserToken,
        siteName,
        Page,
        SearchList,
        customerCode,
        orderType,
        siteList,
        setSiteList,
        setPage,
        setLoading,
        setFooterLoading,
        setNoMorePage
      );
    } catch (error) {
      console.error(error);
    }
  };

  const OnPressOthers = () => {
    CloseSiteModal();
    OtherSite();
  };

  const OnClickCloseModal = async () => {
    clearInput();
    CloseSiteModal();
  };

  const onChangeSite = async (SiteName) => {
    if (SiteName !== "") {
      setPage(1);
      setSiteList([]);
      setSearchList(true);
      setSiteName(SiteName);
      loadSiteData(SiteName, [], 1, true);
    } else {
      clearInput();
    }
  };

  const clearInput = () => {
    setSearchList(true);
    setPage(1);
    setSiteName("");
    setSearchList(false);
    loadSiteData("", [], 1, false);
    inputRef.current.clear();
  };

  //Renders
  const renderSeparator = () => {
    return <ListSeparator />;
  };

  const RenderFootorComponent = () => {
    return (
      <View>
        <ListSeparator />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/*  <View style={styles.footer}>
            <ButtonWithLoader
              onPress={() => OnPressOthers()}
              title={"Add New"}
            />
          </View> */}
          {siteList?.length > 0 ? ( //Footer View with Load More button
            noMorePage === false ? (
              <View style={styles.footer}>
                <ButtonWithLoader
                  onPress={async () => {
                    await loadSiteData(siteName, siteList, page, searchList);
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
          )}
        </View>
      </View>
    );
  };

  const RenderCustomerData = ({ item, index }) => {
    let { SITE } = item;
    return (
      <TouchableOpacity
        onPress={() => ClickSiteName(SITE)}
        style={styles.FlatlistItemTouch}
      >
        <View style={styles.CustomerNameWidth}>
          <Text style={{ marginLeft: "20%" }} numberOfLines={1}>
            {`${SITE}`}
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
            <Text style={styles.HeaderTitleText}>Site List</Text>
            <TouchableOpacity
              onPress={() => OnClickCloseModal()}
              style={styles.CancelIconTouch}
            >
              <Image source={CancelIcon} style={styles.CancelIconStyle} />
            </TouchableOpacity>
          </View>

          <View style={styles.CenterTopMargin}>
            <TextInput
              ref={inputRef}
              style={styles.TextInputWidth}
              placeholder={"Search Site"}
              underlineColorAndroid="transparent"
              placeholderTextColor={lightGreyTextInputColor}
              value={siteName}
              onChangeText={(SiteName) => onChangeSite(SiteName)}
            />
            {siteName === "" ? (
              <View style={styles.InputCancelIconTouch} />
            ) : (
              <TouchableOpacity
                onPress={() => clearInput()}
                style={styles.InputCancelIconTouch}
              >
                <Image source={CancelSiteIcon} style={styles.CancelIconStyle} />
              </TouchableOpacity>
            )}
          </View>

          {siteList.length > 0 && loading === false ? (
            <View style={styles.FlatlistContainer}>
              <FlatList
                data={siteList} // Use SiteList instead of CustomerSite
                extraData={siteList}
                keyExtractor={(item, index) => index.toString()} // Change the keyExtractor
                ListFooterComponent={RenderFootorComponent}
                onEndReachedThreshold={1} // Adjust the threshold as needed
                removeClippedSubviews={true}
                ItemSeparatorComponent={renderSeparator}
                renderItem={RenderCustomerData}
              />
            </View>
          ) : !siteList.length > 0 && loading === false ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text>{"No Site(s) found.."}</Text>
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
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  ModalContainer: {
    flex: 0.8,
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
  footer: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
});

export default CustomerSiteModal;
