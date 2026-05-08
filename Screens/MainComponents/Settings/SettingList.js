import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { whiteColor, lightGreyTextColor } from '../../../utility/colors';
import Header from '../../CommonComponents/Header';
import SettingListCard from './SettingListCard';
import { clearAllData } from '../../../utility/helpers';
import Strings from '../../../utility/strings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { logoutUser } from '../../../utility/ApiHelpers/StagingApis';
import OfflineNotice from '../../CommonComponents/OfflineNotice';
import DeviceInfo from 'react-native-device-info';

const SettingList = props => {
  const Role = props.route.params?.Role;

  const SettingListData = [
    {
      title: Strings.SwitchDriverApp,
      onPress: () => {
        OnClickLogout(Role);
      },
    },
    {
      title: Strings.AddNewCustomer,
      onPress: () => {
        props.navigation.navigate('AddNewCustomer');
      },
    },
  ];

  const DriverSettingListData = [
    {
      title: 'Switch To Sales Person',
      onPress: () => {
        OnClickLogout(Role);
      },
    },
  ];

  //States
  const [VersionBuild, setVersionBuild] = useState(0.0);
  const [UserToken, setUserToken] = useState('');
  const [InternetStatus, setInternetStatus] = useState(true);

  useEffect(() => {
    NetInfo.addEventListener(state => {
      setInternetStatus(state.isConnected);
    });
  }, [InternetStatus]);
  //Effect
  useEffect(() => {
    getData();
  }, []);

  //Function
  const GetBuildNumber = () => {
    let version = DeviceInfo.getVersion();
    setVersionBuild(version);
  };

  const getData = async () => {
    try {
      const UserToken = await AsyncStorage.getItem('access_token');
      console.log('Userinfo token', UserToken);
      setUserToken(UserToken);
      GetBuildNumber();
    } catch (e) {
      console.error(e);
    }
  };

  const LogoutCallback = response => {
    console.log('Response after Login Api calling', response);
    if (response === 500) {
      Alert.alert('Server Issue');
    } else {
      onClickSwitchDriverSalesMan(Role);
    }
  };

  const OnClickLogout = () => {
    console.log('UserToken', UserToken);
    logoutUser(UserToken, LogoutCallback);
  };

  const onClickSwitchDriverSalesMan = Role => {
    if (Role === 'Driver') {
      clearAllData();
      props.navigation.navigate('Login', { Role: 'Sales' });
    } else {
      clearAllData();
      props.navigation.navigate('Login', { Role: 'Driver' });
    }
  };

  //Render
  const RenderFooter = () => {
    return (
      <View>
        <Text style={styles.VersionTextStyle}>
          {Strings.AppVersion} {VersionBuild}
        </Text>
      </View>
    );
  };

  const RenderSettingData = ({ item, index }) => {
    return <SettingListCard SettingListItem={item} onPress={item.onPress} />;
  };

  return (
    <View style={styles.container}>
      <Header
        BackTitle={true}
        Title="Setting"
        onBackPress={() => props.navigation.goBack()}
      />
      <OfflineNotice
        isConnected={InternetStatus}
        setIsConnected={setInternetStatus}
      />
      <FlatList
        data={Role === 'Driver' ? DriverSettingListData : SettingListData}
        keyExtractor={(item, index) => index + ''}
        extraData={Role === 'Driver' ? DriverSettingListData : SettingListData}
        ListFooterComponent={RenderFooter}
        //ItemSeparatorComponent = {renderSeparator}
        renderItem={RenderSettingData}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: whiteColor,
  },
  VersionTextStyle: {
    textAlign: 'center',
    color: lightGreyTextColor,
    marginTop: 10,
    fontSize: 12,
  },
});
export default SettingList;
