import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {mainUrl} from '../../../utility/ApiHelpers/StagingApis';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import HeaderComponent from '../../CommonComponents/Header';
import {primaryColor, whiteColor, lightGreyTextColor} from '../../../utility/colors';
import {fonts} from '../../../utility/GlobalStyles';
import PurchaseOrderTab from './PurchaseOrderTab';
import QuotationTab from './QuotationTab';
import BottomSheetModal from '../../CommonComponents/BottomSheetModal';
import ApproveModal from '../../CommonComponents/ApproveModal';

const PurchaseManager = props => {
  const [activeTab, setActiveTab] = useState(
    props.route?.params?.initialTab ?? 'quotation',
  );
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [bottomSheet, setBottomSheet] = useState({visible: false, eq: null});
  const [poBottomSheet, setPOBottomSheet] = useState({visible: false, po: null});
  const [approveModal, setApproveModal] = useState({visible: false, eq: null});
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [approving, setApproving] = useState(false);
  const [poActionModal, setPOActionModal] = useState({visible: false, po: null, mode: 'approve'});
  const [poActionRemarks, setPOActionRemarks] = useState('');
  const [poActioning, setPOActioning] = useState(false);

  const openApproveModal = eq => {
    console.log('[PurchaseManager] openApproveModal: eq_no =', eq?.eq_no);
    setApprovalRemarks('');
    setApproveModal({visible: true, eq});
  };
  const closeApproveModal = () => setApproveModal({visible: false, eq: null});

  const handleApprove = async () => {
    const eqNo = approveModal.eq?.eq_no;
    const url = `${mainUrl}api/enquiry/${eqNo}/approve`;
    console.log('[PurchaseManager] handleApprove: eqNo =', eqNo);
    console.log('[PurchaseManager] handleApprove: url =', url);
    console.log('[PurchaseManager] handleApprove: approval_remarks =', approvalRemarks);
    setApproving(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({approval_remarks: approvalRemarks}),
      });
      const json = await res.json();
      console.log('[PurchaseManager] handleApprove: status =', res.status);
      console.log('[PurchaseManager] handleApprove: response =', JSON.stringify(json, null, 2));
      if (res.status === 200 || res.status === 201) {
        closeApproveModal();
        fetchData();
      } else {
        console.error('[PurchaseManager] handleApprove: failed =', json?.message);
      }
    } catch (e) {
      console.error('[PurchaseManager] handleApprove: error =', e.message);
    } finally {
      setApproving(false);
    }
  };

  const handlePOAction = async () => {
    const poNo = poActionModal.po?.PONO;
    const mode = poActionModal.mode;
    const url = `${mainUrl}api/purchase-order/${poNo}/${mode}`;
    console.log('[PurchaseManager] handlePOAction: poNo =', poNo, '| mode =', mode, '| url =', url);
    setPOActioning(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Authorization: 'Bearer ' + token},
        body: JSON.stringify({remarks: poActionRemarks}),
      });
      const json = await res.json();
      console.log('[PurchaseManager] handlePOAction: status =', res.status, '| response =', JSON.stringify(json, null, 2));
      if (res.status === 200 || res.status === 201) {
        setPOActionModal({visible: false, po: null, mode: 'approve'});
        fetchData();
      } else {
        console.error('[PurchaseManager] handlePOAction: failed =', json?.message);
      }
    } catch (e) {
      console.error('[PurchaseManager] handlePOAction: error =', e.message);
    } finally {
      setPOActioning(false);
    }
  };

  const openSheet = eq => {
    console.log('[PurchaseManager] openSheet: full eq =', JSON.stringify(eq, null, 2));
    console.log('[PurchaseManager] openSheet: eq_no =', eq?.eq_no);
    console.log('[PurchaseManager] openSheet: mr_details.mr_no =', eq?.mr_details?.mr_no);
    console.log('[PurchaseManager] openSheet: mr_attachment.mr_no =', eq?.mr_attachment?.mr_no);
    console.log('[PurchaseManager] openSheet: eq_details.eq_no =', eq?.eq_details?.eq_no);
    console.log('[PurchaseManager] openSheet: eq_attachment.eq_no =', eq?.eq_attachment?.eq_no);
    setBottomSheet({visible: true, eq});
  };
  const closeSheet = () => {
    console.log('[PurchaseManager] closeSheet');
    setBottomSheet({visible: false, eq: null});
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tab = activeTab) => {
    console.log('[PurchaseManager] fetchData: tab =', tab);
    setLoading(true);
    setList([]);
    const token = await AsyncStorage.getItem('access_token');
    console.log('[PurchaseManager] fetchData: token =', token ? 'present' : 'missing');
    const myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${token}`);
    const endpoint = tab === 'quotation'
      ? 'https://kingdom.thatsmytask.com/api/enquiry/quotation-list'
      : 'https://kingdom.thatsmytask.com/api/purchase-order/list?pono=&department=&supname=&from_date=&to_date=&approved_only=&rejected_only=&per_page=20';
    console.log('[PurchaseManager] fetchData: endpoint =', endpoint);
    fetch(endpoint, {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    })
      .then(res => {
        console.log('[PurchaseManager] fetchData: response status =', res.status);
        return res.json();
      })
      .then(data => {
        console.log('[PurchaseManager] fetchData: raw data =', JSON.stringify(data, null, 2));
        const items = data.data?.data ?? [];
        console.log('[PurchaseManager] fetchData: items count =', items.length);
        setList(items);
      })
      .catch(err => console.error('[PurchaseManager] fetchData: error =', err))
      .finally(() => {
        console.log('[PurchaseManager] fetchData: done, loading = false');
        setLoading(false);
      });
  };

  const handleLogout = () => {
    Alert.alert('Hold on!', 'Are you sure you want to Logout from App?', [
      { text: 'NO', style: 'cancel' },
      { text: 'YES', onPress: async () => { await AsyncStorage.clear(); props.navigation.replace('Login'); } },
    ]);
  };

  const toggleExpand = index => {
    setExpandedIndex(prev => {
      const next = prev === index ? null : index;
      console.log(`[PurchaseManager] toggleExpand: index ${index} -> ${next === null ? 'collapsed' : 'expanded'}`);
      return next;
    });
  };

  const openPOSheet = po => {
    console.log('[PurchaseManager] openPOSheet: PONO =', po?.PONO);
    console.log('[PurchaseManager] openPOSheet: full po =', JSON.stringify(po, null, 2));
    setPOBottomSheet({visible: true, po});
  };
  const closePOSheet = () => {
    console.log('[PurchaseManager] closePOSheet');
    setPOBottomSheet({visible: false, po: null});
  };

  const poSheetButtons = [
    {
      label: 'Enquiry Details',
      onPress: () => {
        const poNo = poBottomSheet.po?.PONO;
        const apiUrl = `${mainUrl}api/purchase-order/${poNo}/eq-details`;
        console.log('[PurchaseManager] PO Enquiry Details: poNo =', poNo, '| apiUrl =', apiUrl);
        closePOSheet();
        props.navigation.navigate('PMCommonScreen', {title: 'Enquiry Details', apiUrl, isEqDetails: true});
      },
    },
    {
      label: 'MR Details',
      onPress: () => {
        const poNo = poBottomSheet.po?.PONO;
        const apiUrl = `${mainUrl}api/purchase-order/${poNo}/mr-details`;
        console.log('[PurchaseManager] PO MR Details: poNo =', poNo, '| apiUrl =', apiUrl);
        closePOSheet();
        props.navigation.navigate('PMCommonScreen', {title: 'MR Details', apiUrl, isMrDetails: true});
      },
    },
    {
      label: 'MR Attach',
      onPress: () => {
        const mrNo = poBottomSheet.po?.mr_attachment?.mr_no;
        const apiUrl = `${mainUrl}api/material-request/${mrNo}/attachments`;
        console.log('[PurchaseManager] PO MR Attach: mrNo =', mrNo, '| apiUrl =', apiUrl);
        closePOSheet();
        props.navigation.navigate('PMCommonScreen', {title: 'MR Attachments', apiUrl, isDetail: false});
      },
    },
    {
      label: 'Purchase Order Details',
      onPress: () => {
        const poNo = poBottomSheet.po?.PONO;
        const apiUrl = `${mainUrl}api/purchase-order/${poNo}/detail`;
        console.log('[PurchaseManager] PO Details: poNo =', poNo, '| apiUrl =', apiUrl);
        closePOSheet();
        props.navigation.navigate('PMCommonScreen', {title: 'Purchase Order Details', apiUrl, isDetail: true});
      },
    },
    {
      label: 'Purchase Order Attach',
      onPress: () => {
        const poNo = poBottomSheet.po?.PONO;
        const apiUrl = `${mainUrl}api/purchase-order/${poNo}/attachments`;
        console.log('[PurchaseManager] PO Attach: poNo =', poNo, '| apiUrl =', apiUrl);
        closePOSheet();
        props.navigation.navigate('PMCommonScreen', {title: 'Purchase Order Attachments', apiUrl, isDetail: false});
      },
    },
    {
      label: 'Reject',
      onPress: () => {
        const po = poBottomSheet.po;
        console.log('[PurchaseManager] PO Reject pressed: PONO =', po?.PONO);
        closePOSheet();
        setPOActionRemarks('');
        setPOActionModal({visible: true, po, mode: 'reject'});
      },
      danger: true,
    },
    {
      label: 'Approve',
      onPress: () => {
        const po = poBottomSheet.po;
        console.log('[PurchaseManager] PO Approve pressed: PONO =', po?.PONO);
        closePOSheet();
        setPOActionRemarks('');
        setPOActionModal({visible: true, po, mode: 'approve'});
      },
      accent: true,
    },
  ];

  const sheetButtons = [
    {
      label: 'Enquiry Details',
      onPress: () => {
        const eqNo = bottomSheet.eq?.eq_details?.eq_no;
        const apiUrl = `${mainUrl}api/enquiry/${eqNo}/detail`;
        console.log('[PurchaseManager] Enquiry Details: eqNo =', eqNo, '| apiUrl =', apiUrl);
        closeSheet();
        props.navigation.navigate('PMCommonScreen', {title: 'Enquiry Details', apiUrl, isDetail: true});
      },
    },
    {
      label: 'Enquiry Attach',
      onPress: () => {
        const eqNo = bottomSheet.eq?.eq_attachment?.eq_no;
        const apiUrl = `${mainUrl}api/enquiry/${eqNo}/attachments`;
        console.log('[PurchaseManager] Enquiry Attach: eqNo =', eqNo, '| apiUrl =', apiUrl);
        closeSheet();
        props.navigation.navigate('PMCommonScreen', {title: 'Enquiry Attachments', apiUrl, isDetail: false});
      },
    },
    {
      label: 'MR Details',
      onPress: () => {
        const mrNo = bottomSheet.eq?.mr_details?.mr_no;
        const apiUrl = `${mainUrl}api/material-request/${mrNo}/detail`;
        console.log('[PurchaseManager] MR Details: mrNo =', mrNo, '| apiUrl =', apiUrl);
        closeSheet();
        props.navigation.navigate('PMCommonScreen', {title: 'MR Details', apiUrl, isDetail: true});
      },
    },
    {
      label: 'MR Attach',
      onPress: () => {
        const mrNo = bottomSheet.eq?.mr_attachment?.mr_no;
        const apiUrl = `${mainUrl}api/material-request/${mrNo}/attachments`;
        console.log('[PurchaseManager] MR Attach: mrNo =', mrNo, '| apiUrl =', apiUrl);
        closeSheet();
        props.navigation.navigate('PMCommonScreen', {title: 'MR Attachments', apiUrl, isDetail: false});
      },
    },
    {
      label: 'Approve',
      onPress: () => {
        const eq = bottomSheet.eq;
        console.log('[PurchaseManager] Approve pressed: eq_no =', eq?.eq_no);
        closeSheet();
        openApproveModal(eq);
      },
      accent: true,
    },
  ];

  return (
    <View style={styles.container}>
      <ApproveModal
        visible={approveModal.visible}
        eqNo={approveModal.eq?.eq_no}
        remarks={approvalRemarks}
        onChangeRemarks={setApprovalRemarks}
        onCancel={closeApproveModal}
        onConfirm={handleApprove}
        loading={approving}
      />
      <ApproveModal
        visible={poActionModal.visible}
        eqNo={poActionModal.po?.PONO}
        remarks={poActionRemarks}
        onChangeRemarks={setPOActionRemarks}
        onCancel={() => setPOActionModal({visible: false, po: null, mode: 'approve'})}
        onConfirm={handlePOAction}
        loading={poActioning}
        mode={poActionModal.mode}
      />
      <BottomSheetModal
        visible={bottomSheet.visible}
        onClose={closeSheet}
        buttons={sheetButtons}
      />
      <BottomSheetModal
        visible={poBottomSheet.visible}
        onClose={closePOSheet}
        buttons={poSheetButtons}
      />
      <HeaderComponent
        HomeScreenHeader={true}
        Title="Purchase Manager"
        onPressRight2={handleLogout}
      />
      <View style={styles.tabBar}>
        {['quotation', 'purchaseOrder'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            onPress={() => { setExpandedIndex(null); setActiveTab(tab); }}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'quotation' ? 'Quotation' : 'Purchase Order'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={primaryColor} />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(_, i) => i.toString()}
          renderItem={
            activeTab === 'purchaseOrder'
              ? ({item}) => <PurchaseOrderTab item={item} onPressMenu={openPOSheet} />
              : ({item, index}) => <QuotationTab item={item} index={index} expandedIndex={expandedIndex} onToggle={toggleExpand} onPressMenu={openSheet} />
          }
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
  tabItemActive: {borderBottomColor: primaryColor},
  tabText: {
    fontSize: 14,
    fontFamily: fonts.Lato_Regular,
    color: lightGreyTextColor,
  },
  tabTextActive: {
    fontFamily: fonts.Lato_Bold,
    color: primaryColor,
  },

  empty: {flex: 1, alignItems: 'center', marginTop: 40},
  emptyText: {color: lightGreyTextColor, fontFamily: fonts.Lato_Regular},
});

export default PurchaseManager;
