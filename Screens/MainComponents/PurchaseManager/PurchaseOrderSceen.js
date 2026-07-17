import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Alert, FlatList, StyleSheet, Text, View} from 'react-native';
import {mainUrl} from '../../../utility/ApiHelpers/StagingApis';
import {primaryColor, lightGreyTextColor, whiteColor} from '../../../utility/colors';
import {fonts} from '../../../utility/GlobalStyles';
import HeaderComponent from '../../CommonComponents/Header';
import BottomSheetModal from '../../CommonComponents/BottomSheetModal';
import PurchaseOrderTab from './PurchaseOrderTab';

const PurchaseOrderScreen = props => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [poBottomSheet, setPOBottomSheet] = useState({visible: false, po: null});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setList([]);
    const token = await AsyncStorage.getItem('access_token');
    fetch(
      `${mainUrl}api/purchase-order/list?pono=&department=&supname=&from_date=&to_date=&approved_only=&rejected_only=&per_page=20`,
      {method: 'GET', headers: {Authorization: `Bearer ${token}`}},
    )
      .then(res => res.json())
      .then(data => setList(data.data?.data ?? []))
      .catch(err => console.error('[PurchaseOrderScreen] error =', err))
      .finally(() => setLoading(false));
  };

  const openPOSheet = po => setPOBottomSheet({visible: true, po});
  const closePOSheet = () => setPOBottomSheet({visible: false, po: null});

  const poSheetButtons = [
    {
      label: 'Enquiry Details',
      onPress: () => {
        const eqNo = poBottomSheet.po?.eq_details?.eq_no;
        closePOSheet();
        props.navigation.navigate('PMCommonScreen', {
          title: 'Enquiry Details',
          apiUrl: `${mainUrl}api/enquiry/${eqNo}/detail`,
          isDetail: true,
        });
      },
    },
    {
      label: 'Enquiry Attach',
      onPress: () => {
        const eqNo = poBottomSheet.po?.eq_attachment?.eq_no;
        closePOSheet();
        props.navigation.navigate('PMCommonScreen', {
          title: 'Enquiry Attachments',
          apiUrl: `${mainUrl}api/enquiry/${eqNo}/attachments`,
          isDetail: false,
        });
      },
    },
    {
      label: 'MR Details',
      onPress: () => {
        const mrNo = poBottomSheet.po?.mr_details?.mr_no;
        closePOSheet();
        props.navigation.navigate('PMCommonScreen', {
          title: 'MR Details',
          apiUrl: `${mainUrl}api/material-request/${mrNo}/detail`,
          isDetail: true,
        });
      },
    },
    {
      label: 'MR Attach',
      onPress: () => {
        const mrNo = poBottomSheet.po?.mr_attachment?.mr_no;
        closePOSheet();
        props.navigation.navigate('PMCommonScreen', {
          title: 'MR Attachments',
          apiUrl: `${mainUrl}api/material-request/${mrNo}/attachments`,
          isDetail: false,
        });
      },
    },
    {
      label: 'Purchase Order Details',
      onPress: () => {
        const poNo = poBottomSheet.po?.PONO;
        closePOSheet();
        props.navigation.navigate('PMCommonScreen', {
          title: 'Purchase Order Details',
          apiUrl: `${mainUrl}api/purchase-order/${poNo}/detail`,
          isDetail: true,
        });
      },
    },
    {
      label: 'Purchase Order Attach',
      onPress: () => {
        const poNo = poBottomSheet.po?.PONO;
        closePOSheet();
        props.navigation.navigate('PMCommonScreen', {
          title: 'Purchase Order Attachments',
          apiUrl: `${mainUrl}api/purchase-order/${poNo}/attachments`,
          isDetail: false,
        });
      },
    },
  ];

  return (
    <View style={styles.container}>
      <BottomSheetModal
        visible={poBottomSheet.visible}
        onClose={closePOSheet}
        buttons={poSheetButtons}
      />
      <HeaderComponent
        HomeScreenHeader={true}
        Title="Purchase Orders"
        onPressRight2={() =>
          Alert.alert('Hold on!', 'Are you sure you want to Logout from App?', [
            {text: 'NO', style: 'cancel'},
            {text: 'YES', onPress: async () => {
              await AsyncStorage.clear();
              props.navigation.replace('Login');
            }},
          ])
        }
      />
      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={primaryColor} />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({item}) => (
            <PurchaseOrderTab item={item} onPressMenu={openPOSheet} />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No data found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  loader: {flex: 1, justifyContent: 'center'},
  listContent: {padding: 12},
  empty: {flex: 1, alignItems: 'center', marginTop: 40},
  emptyText: {color: lightGreyTextColor, fontFamily: fonts.Lato_Regular},
});

export default PurchaseOrderScreen;
