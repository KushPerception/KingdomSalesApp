import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  primaryColor,
  whiteColor,
  lightGreyTextColor,
} from '../../../../utility/colors';
import { fonts } from '../../../../utility/GlobalStyles';
import HeaderComponent from '../../../CommonComponents/Header';
import QuotationList from './QuotationList';
import PurchaseOrderList from '../Shared/PurchaseOrderList';

const TABS = ['quotation', 'purchaseOrder'];

const PurchaseManager = props => {
  const [activeTab, setActiveTab] = useState(
    props.route?.params?.initialTab ?? 'quotation',
  );

  const handleLogout = () => {
    Alert.alert('Hold on!', 'Are you sure you want to Logout from App?', [
      { text: 'NO', style: 'cancel' },
      {
        text: 'YES',
        onPress: async () => {
          await AsyncStorage.clear();
          props.navigation.replace('Login');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <HeaderComponent
        HomeScreenHeader={true}
        Title="Purchase Manager"
        onPressRight2={handleLogout}
      />
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab === 'quotation' ? 'Quotation' : 'Purchase Order'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {activeTab === 'purchaseOrder' ? (
        <PurchaseOrderList navigation={props.navigation} />
      ) : (
        <QuotationList navigation={props.navigation} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: whiteColor,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: primaryColor },
  tabText: {
    fontSize: 14,
    fontFamily: fonts.Lato_Regular,
    color: lightGreyTextColor,
  },
  tabTextActive: {
    fontFamily: fonts.Lato_Bold,
    color: primaryColor,
  },
});

export default PurchaseManager;
