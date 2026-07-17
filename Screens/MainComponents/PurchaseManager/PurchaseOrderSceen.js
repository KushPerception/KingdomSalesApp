import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { mainUrl } from '../../../utility/ApiHelpers/StagingApis';
import { primaryColor, lightGreyTextColor } from '../../../utility/colors';
import { fonts } from '../../../utility/GlobalStyles';
import HeaderComponent from '../../CommonComponents/Header';
import BottomSheetModal from '../../CommonComponents/BottomSheetModal';
import ApproveModal from '../../CommonComponents/ApproveModal';
import PurchaseOrderTab from './PurchaseOrderTab';

const PurchaseOrderScreen = props => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [poBottomSheet, setPOBottomSheet] = useState({
    visible: false,
    po: null,
  });
  const [poActionModal, setPOActionModal] = useState({
    visible: false,
    po: null,
    mode: 'approve',
  });
  const [poActionRemarks, setPOActionRemarks] = useState('');
  const [poActioning, setPOActioning] = useState(false);

  const handlePOAction = async () => {
    const poNo = poActionModal.po?.PONO;
    const mode = poActionModal.mode;
    const url = `${mainUrl}api/purchase-order/${poNo}/${mode}`;
    setPOActioning(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({ remarks: poActionRemarks }),
      });
      const json = await res.json();
      if (res.status === 200 || res.status === 201) {
        setPOActionModal({ visible: false, po: null, mode: 'approve' });
        fetchData();
      } else {
        console.error(
          '[PurchaseOrderScreen] handlePOAction: failed =',
          json?.message,
        );
      }
    } catch (e) {
      console.error('[PurchaseOrderScreen] handlePOAction: error =', e.message);
    } finally {
      setPOActioning(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setList([]);
    const token = await AsyncStorage.getItem('access_token');
    fetch(
      `${mainUrl}api/purchase-order/list?pono=&department=&supname=&from_date=&to_date=&approved_only=&rejected_only=&per_page=20`,
      { method: 'GET', headers: { Authorization: `Bearer ${token}` } },
    )
      .then(res => res.json())
      .then(data => setList(data.data?.data ?? []))
      .catch(err => console.error('[PurchaseOrderScreen] error =', err))
      .finally(() => setLoading(false));
  };

  const openPOSheet = po => setPOBottomSheet({ visible: true, po });
  const closePOSheet = () => setPOBottomSheet({ visible: false, po: null });

  const poSheetButtons = [
    {
      label: 'Enquiry Details',
      onPress: () => {
        const poNo = poBottomSheet.po?.PONO;
        closePOSheet();
        props.navigation.navigate('PMCommonScreen', {
          title: 'Enquiry Details',
          apiUrl: `${mainUrl}api/purchase-order/${poNo}/eq-details`,
          isEqDetails: true,
        });
      },
    },
    {
      label: 'MR Details',
      onPress: () => {
        const poNo = poBottomSheet.po?.PONO;
        closePOSheet();
        props.navigation.navigate('PMCommonScreen', {
          title: 'MR Details',
          apiUrl: `${mainUrl}api/purchase-order/${poNo}/mr-details`,
          isMrDetails: true,
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
    {
      label: 'Reject',
      onPress: () => {
        const po = poBottomSheet.po;
        closePOSheet();
        setPOActionRemarks('');
        setPOActionModal({ visible: true, po, mode: 'reject' });
      },
      danger: true,
    },
    {
      label: 'Approve',
      onPress: () => {
        const po = poBottomSheet.po;
        closePOSheet();
        setPOActionRemarks('');
        setPOActionModal({ visible: true, po, mode: 'approve' });
      },
      accent: true,
    },
  ];

  return (
    <View style={styles.container}>
      <ApproveModal
        visible={poActionModal.visible}
        eqNo={poActionModal.po?.PONO}
        remarks={poActionRemarks}
        onChangeRemarks={setPOActionRemarks}
        onCancel={() =>
          setPOActionModal({ visible: false, po: null, mode: 'approve' })
        }
        onConfirm={handlePOAction}
        loading={poActioning}
        mode={poActionModal.mode}
      />
      <BottomSheetModal
        visible={poBottomSheet.visible}
        onClose={closePOSheet}
        buttons={poSheetButtons}
      />
      <HeaderComponent
        HomeScreenHeader={true}
        Title="Purchase Orders"
        onPressRight2={async () => {
          await AsyncStorage.clear();
          props.navigation.replace('Login');
        }}
      />
      {loading ? (
        <ActivityIndicator
          style={styles.loader}
          size="large"
          color={primaryColor}
        />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loader: { flex: 1, justifyContent: 'center' },
  listContent: { padding: 12 },
  empty: { flex: 1, alignItems: 'center', marginTop: 40 },
  emptyText: { color: lightGreyTextColor, fontFamily: fonts.Lato_Regular },
});

export default PurchaseOrderScreen;
