import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AddPurpleIcon, searchIcon } from '../../../Images/index';
import {
  GetAllOrdersFromServer,
  logoutUser,
} from '../../../utility/ApiHelpers/StagingApis';
import { W, fonts } from '../../../utility/GlobalStyles';
import {
  PurpleColor,
  lightGreyTextColor,
  primaryColor,
  whiteColor,
} from '../../../utility/colors';
import Strings from '../../../utility/strings';
import HeaderComponent from '../../CommonComponents/Header';
import LoaderComponent from '../../CommonComponents/LoaderComponent';
import OfflineNotice from '../../CommonComponents/OfflineNotice';
import HomeListCard from './HomeListCard';
import DeviceInfo from 'react-native-device-info';

const Home = props => {
  //Props

  //States
  const [AllOrderList, setAllOrderList] = useState([]);
  const [loading, setloading] = useState(true);
  const [UserToken, setUserToken] = useState('');
  const [AccessInvoices, setAccessInvoices] = useState('');
  const [VersionBuild, setVersionBuild] = useState(0.0);
  const [Page, setPage] = useState(1);
  const [NextPageUrl, setNextPageUrl] = useState('');
  //Effect
  const [InternetStatus, setInternetStatus] = useState(true);

  useEffect(() => {
    NetInfo.addEventListener(state => {
      setInternetStatus(state.isConnected);
    });
  }, [InternetStatus]);
  useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      // The screen is focused
      // Call any action
      console.log('Focus called');
      setPage(1);
      //getData();
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [props.navigation]);

  useEffect(() => {
    if (Page === 1) {
      getData();
    }
  }, [Page]);

  const getData = async () => {
    try {
      console.log('Get Data Called');
      const UserToken = await AsyncStorage.getItem('access_token');
      const accessInvoices = await AsyncStorage.getItem('access_invoices');
      setAccessInvoices(accessInvoices);
      setloading(true);
      if (UserToken !== null) {
        await setUserToken(UserToken);
        await GetAllOrdersList(UserToken, Page);
        GetBuildNumber();
      }
    } catch (e) {
      console.error(e);
    }
  };

  //Function

  const LogoutCallback = async response => {
    await AsyncStorage.removeItem('UserMPIN');
    await AsyncStorage.removeItem('userinfo');
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('UserType');
    await AsyncStorage.removeItem('password');
    await AsyncStorage.removeItem('access_invoices');
    await AsyncStorage.getAllKeys().then(keys =>
      AsyncStorage.multiRemove(keys),
    );
    props.navigation.navigate('Login');
  };

  const OnClickLogout = () => {
    Alert.alert('Hold on!', 'Are you sure you want to Logout from App?', [
      {
        text: 'Cancel',
        onPress: () => null,
        style: 'cancel',
      },
      { text: 'YES', onPress: () => logoutUser(UserToken, LogoutCallback) },
    ]);
  };

  const OrderListCallback = response => {
    console.log('Order Listing', response);
    if (Page === 1) {
      setNextPageUrl(response?.pagination?.next_page_url);
      setAllOrderList(response?.data);
    } else {
      setNextPageUrl(response?.pagination?.next_page_url);
      const NewOrderListList = [...AllOrderList, ...response.data];
      setAllOrderList(NewOrderListList);
    }
  };

  const GetBuildNumber = () => {
    let version = DeviceInfo.getVersion();
    setVersionBuild(version);
  };

  const GetAllOrdersList = async (UserToken, Page) => {
    console.log('Get order listing called');
    await setPage(Page + 1);
    let OrderObject = {
      UserToken: UserToken,
      page: Page,
    };
    GetAllOrdersFromServer(OrderObject, OrderListCallback, setloading);
  };

  const OnReachEnd = async () => {
    GetAllOrdersList(UserToken, Page);
  };

  const OnRefreshList = () => {
    setPage(1);
  };

  const OnClickAddCustomerIcon = () => {
    props.navigation.navigate('AddNewCustomer');
  };

  //Render

  const RenderOrderData = ({ item, index }) => {
    return (
      <HomeListCard
        OrderListItem={item}
        UserToken={UserToken}
        GetDataCallFunc={() => OnRefreshList()}
      />
    );
  };

  const RenderOrderListEmpty = ({ item, index }) => {
    return (
      <View
        style={{
          marginTop: '40%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text>No Data Found!</Text>
      </View>
    );
  };

  const RenderFootorComponent = () => {
    return (
      <View style={styles.footer}>
        {NextPageUrl === null ? (
          false
        ) : (
          <ActivityIndicator size={25} color={PurpleColor} />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderComponent
        HomeScreenHeader={true}
        Title={'Recent Orders'}
        onPressRight={OnClickAddCustomerIcon}
        onPressRight2={OnClickLogout}
      />
      <OfflineNotice
        isConnected={InternetStatus}
        setIsConnected={setInternetStatus}
      />
      {loading ? (
        <LoaderComponent />
      ) : (
        <View style={styles.container}>
          <View style={[styles.container, { marginBottom: 20, marginTop: 5 }]}>
            <FlatList
              data={AllOrderList}
              keyExtractor={(item, index) => index + ''}
              refreshControl={
                <RefreshControl
                  refreshing={loading}
                  onRefresh={() => OnRefreshList()}
                />
              }
              ListFooterComponent={RenderFootorComponent}
              onEndReached={() => (NextPageUrl === null ? false : OnReachEnd())}
              onEndReachedThreshold={1}
              removeClippedSubviews={true}
              extraData={AllOrderList}
              ListEmptyComponent={RenderOrderListEmpty}
              renderItem={RenderOrderData}
            />
          </View>
          <View
            style={{
              flexDirection: 'column',
              position: 'absolute',
              bottom: 20,
              right: 25,
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
            }}
          >
            <TouchableOpacity
              onPress={() => {
                props.navigation.navigate('AddEditScheduleOrder');
              }}
            >
              <Image source={AddPurpleIcon} style={{ width: 60, height: 60 }} />
            </TouchableOpacity>
            {AccessInvoices === 'true' && (
              <TouchableOpacity
                onPress={() => {
                  props.navigation.navigate('Invoice');
                }}
                style={{
                  backgroundColor: primaryColor,
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  borderRadius: 10,
                  width: W(110),
                  height: 50,
                  marginTop: 10,
                  flexDirection: 'row',
                  padding: 10,
                }}
              >
                <Image source={searchIcon} style={{ width: 20, height: 20 }} />
                <Text
                  style={{
                    color: whiteColor,
                    fontFamily: fonts.Lato_Regular,
                    fontSize: 18,
                    marginLeft: 7,
                  }}
                >
                  {'Invoice'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => {
                props.navigation.navigate('CashReceipt');
              }}
              style={{
                backgroundColor: primaryColor,
                justifyContent: 'space-around',
                alignItems: 'center',
                borderRadius: 10,
                width: W(130),
                height: 50,
                marginTop: 10,
                flexDirection: 'row',
                padding: 10,
              }}
            >
              <Image source={searchIcon} style={{ width: 20, height: 20 }} />
              <Text
                style={{
                  color: whiteColor,
                  fontFamily: fonts.Lato_Regular,
                  fontSize: 14,
                  marginLeft: 7,
                }}
              >
                {'Cash Receipt'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View style={{ marginBottom: 10 }}>
        <Text style={styles.VersionTextStyle}>
          {Strings.AppVersion} {VersionBuild}
        </Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  VersionTextStyle: {
    textAlign: 'center',
    color: lightGreyTextColor,
    marginTop: 2,
    fontSize: 12,
    fontFamily: fonts.Lato_Regular,
  },
  footer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
export default Home;
