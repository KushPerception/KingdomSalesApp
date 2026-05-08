import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CancelIcon, CancelSiteIcon } from '../../Images/index';
import { getCustomerList } from '../../utility/ApiHelpers/StagingApis';
import { W, fonts } from '../../utility/GlobalStyles';
import {
  BlackColor,
  darkGreyTextColor,
  lightGreyColor,
  lightGreyTextInputColor,
  whiteColor,
} from '../../utility/colors';
import ListSeparator from '../CommonComponents/ListSeparator';
import LoaderComponent from '../CommonComponents/LoaderComponent';
import ButtonWithLoader from './ButtonLoader';

const CustomerListModal = props => {
  let {
    CloseCustomerModal,
    SetCustomerDetailsFunc,
    GetOrderType,
    OtherCustomer,
  } = props;

  // states
  const [UserToken, setUserToken] = useState(null);
  const [customerList, setCustomerList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customername, setCustomername] = useState('');
  const [page, setPage] = useState(1);
  const [searchList, setSearchList] = useState(false);
  const [footerLoading, setFooterLoading] = useState(false);
  const [noMorePage, setNoMorePage] = useState(false);

  // Ref
  const inputRef = useRef();

  // Effect
  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const UserToken = await AsyncStorage.getItem('access_token');
      setLoading(true);
      if (UserToken !== null) {
        setUserToken(UserToken);
        loadCustomerData(
          customername,
          customerList,
          page,
          searchList,
          setLoading,
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Function to load site data
  const loadCustomerData = async (
    customername,
    customerList,
    Page,
    SearchList,
    setLoading,
  ) => {
    const UserToken = await AsyncStorage.getItem('access_token');
    try {
      await getCustomerList(
        UserToken,
        customername,
        GetOrderType,
        Page,
        SearchList,
        customerList,
        setCustomerList,
        setPage,
        setLoading,
        setFooterLoading,
        setNoMorePage,
      );
    } catch (error) {
      console.error(error);
    }
  };

  const OnClickCloseModal = async () => {
    clearInput();
    CloseCustomerModal();
  };

  const OnChangeCustomerName = async Customername => {
    if (Customername !== '') {
      setPage(1);
      setCustomerList([]);
      setSearchList(true);
      setCustomername(Customername);
      loadCustomerData(Customername, [], 1, true);
    } else {
      clearInput();
    }
  };

  const clearInput = () => {
    setSearchList(true);
    setPage(1);
    setCustomername('');
    setSearchList(false);
    loadCustomerData('', [], 1, false);
    inputRef.current.clear();
  };

  //Renders
  const renderSeparator = () => {
    return <ListSeparator />;
  };

  const RenderFootorComponent = () => {
    return (
      <View style={styles.footer}>
        {customerList?.length > 0 ? ( //Footer View with Load More button
          noMorePage === false ? (
            <View style={styles.footer}>
              <ButtonWithLoader
                onPress={async () => {
                  await loadCustomerData(
                    customername,
                    customerList,
                    page,
                    searchList,
                  );
                }}
                title={'Load More'}
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
    );
  };

  const RenderCustomerData = ({ item, index }) => {
    let { CUSTCODE, CUSTNAME, CUSTPHONE, EMAIL } = item;
    return (
      <TouchableOpacity
        onPress={() =>
          SetCustomerDetailsFunc(CUSTCODE, CUSTNAME, CUSTPHONE, EMAIL)
        }
        style={styles.FlatlistItemTouch}
      >
        <View style={{ width: '20%' }}>
          <Text numberOfLines={2} style={styles.CustomerCodeText}>
            {CUSTCODE}
          </Text>
        </View>
        <View style={styles.CustomerNameWidth}>
          <Text numberOfLines={1}>{CUSTNAME}</Text>
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
            <Text style={styles.HeaderTitleText}>Customer List</Text>
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
              placeholder={'Search Customers'}
              underlineColorAndroid="transparent"
              placeholderTextColor={lightGreyTextInputColor}
              value={customername}
              onChangeText={Customername => OnChangeCustomerName(Customername)}

              // renderRightAccessory = {()=>RenderCustomerCancel()}
            />
            {customername === '' ? (
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

          {customerList.length > 0 && loading === false ? (
            <View style={styles.FlatlistContainer}>
              <FlatList
                data={customerList}
                extraData={customerList}
                keyExtractor={(item, index) => index.toString()} // Change the keyExtractor
                ListFooterComponent={RenderFootorComponent}
                onEndReachedThreshold={1} // Adjust the threshold as needed
                removeClippedSubviews={true}
                ItemSeparatorComponent={renderSeparator}
                renderItem={RenderCustomerData}
              />
            </View>
          ) : !customerList.length > 0 && loading === false ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text>{'No Customer(s) found..'}</Text>
            </View>
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    width: '100%',
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
  },
  CustomerCodeText: {
    color: lightGreyColor,
    paddingLeft: 20,
    paddingRight: 10,
    fontFamily: fonts.Font_Medium,
  },
  CustomerNameWidth: {
    width: '65%',
  },
  CenterTopMargin: {
    alignItems: 'center',
    flexDirection: 'row',
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
    justifyContent: 'center',
    borderBottomColor: lightGreyTextInputColor,
  },
  footer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
export default CustomerListModal;
