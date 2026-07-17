import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { mainUrl } from '../../../utility/ApiHelpers/StagingApis';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { TextInput } from 'react-native-gesture-handler';
import { searchIcon } from '../../../Images';
import HeaderComponent from '../../CommonComponents/Header';
import {
  primaryColor,
  whiteColor,
  lightGreyTextColor,
  BlackColor,
} from '../../../utility/colors';
import { fonts } from '../../../utility/GlobalStyles';
import PurchaseOrderTab from './PurchaseOrderTab';
import QuotationTab from './QuotationTab';
import BottomSheetModal from '../../CommonComponents/BottomSheetModal';
import ApproveModal from '../../CommonComponents/ApproveModal';

const PO_SEARCH_BY_OPTIONS = ['PONO', 'Department', 'Supplier'];
const PO_STATUS_OPTIONS = ['All', 'Approved', 'Rejected'];
const EQ_SEARCH_BY_OPTIONS = ['MRNO', 'Stock Code'];

const FilterBar = ({
  searchByOptions,
  searchBy,
  onChangeSearchBy,
  keyword,
  onChangeKeyword,
  fromDate,
  toDate,
  onChangeFromDate,
  onChangeToDate,
  statusOptions,
  statusFilter,
  onChangeStatus,
  onSearch,
  onClear,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  return (
    <View>
      <View style={styles.dateRow}>
        <Text style={styles.dateLabel}>From</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowFromPicker(true)}
        >
          <Text style={styles.dateText}>
            {fromDate ? moment(fromDate).format('DD/MM/YYYY') : 'From Date'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.dateLabel}>To</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowToPicker(true)}
        >
          <Text style={styles.dateText}>
            {toDate ? moment(toDate).format('DD/MM/YYYY') : 'To Date'}
          </Text>
        </TouchableOpacity>
      </View>

      {!!statusOptions && (
        <View style={styles.statusRow}>
          {statusOptions.map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.statusChip,
                statusFilter === option && styles.statusChipActive,
              ]}
              onPress={() => onChangeStatus(option)}
            >
              <Text
                style={[
                  styles.statusChipText,
                  statusFilter === option && styles.statusChipTextActive,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.searchRow}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowDropdown(true)}
        >
          <Text style={styles.dropdownButtonText}>{searchBy}</Text>
          <Text style={styles.dropdownArrow}>▾</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search by ${searchBy}`}
          value={keyword}
          onChangeText={onChangeKeyword}
        />
        <TouchableOpacity onPress={onSearch} style={styles.searchButton}>
          <Image source={searchIcon} style={styles.searchIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent
        visible={showDropdown}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdownMenu}>
            {searchByOptions.map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.dropdownItem,
                  searchBy === option && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  onChangeSearchBy(option);
                  setShowDropdown(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    searchBy === option && styles.dropdownItemTextActive,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <DatePicker
        modal
        open={showFromPicker}
        date={fromDate || new Date()}
        mode="date"
        maximumDate={toDate || new Date()}
        onConfirm={date => {
          onChangeFromDate(date);
          setShowFromPicker(false);
        }}
        onCancel={() => setShowFromPicker(false)}
      />
      <DatePicker
        modal
        open={showToPicker}
        date={toDate || new Date()}
        mode="date"
        minimumDate={fromDate || undefined}
        maximumDate={new Date()}
        onConfirm={date => {
          onChangeToDate(date);
          setShowToPicker(false);
        }}
        onCancel={() => setShowToPicker(false)}
      />
    </View>
  );
};

const PurchaseManager = props => {
  const [activeTab, setActiveTab] = useState(
    props.route?.params?.initialTab ?? 'quotation',
  );
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [bottomSheet, setBottomSheet] = useState({ visible: false, eq: null });
  const [poBottomSheet, setPOBottomSheet] = useState({
    visible: false,
    po: null,
  });
  const [approveModal, setApproveModal] = useState({
    visible: false,
    eq: null,
  });
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [approving, setApproving] = useState(false);
  const [poActionModal, setPOActionModal] = useState({
    visible: false,
    po: null,
    mode: 'approve',
  });
  const [poActionRemarks, setPOActionRemarks] = useState('');
  const [poActioning, setPOActioning] = useState(false);

  const [poSearchBy, setPOSearchBy] = useState('PONO');
  const [poKeyword, setPOKeyword] = useState('');
  const [poFromDate, setPOFromDate] = useState(null);
  const [poToDate, setPOToDate] = useState(null);
  const [poStatusFilter, setPOStatusFilter] = useState('All');

  const [eqSearchBy, setEQSearchBy] = useState('MRNO');
  const [eqKeyword, setEQKeyword] = useState('');
  const [eqFromDate, setEQFromDate] = useState(null);
  const [eqToDate, setEQToDate] = useState(null);

  const openApproveModal = eq => {
    console.log('[PurchaseManager] openApproveModal: eq_no =', eq?.eq_no);
    setApprovalRemarks('');
    setApproveModal({ visible: true, eq });
  };
  const closeApproveModal = () => setApproveModal({ visible: false, eq: null });

  const handleApprove = async () => {
    const eqNo = approveModal.eq?.eq_no;
    const url = `${mainUrl}api/enquiry/${eqNo}/approve`;
    console.log('[PurchaseManager] handleApprove: eqNo =', eqNo);
    console.log('[PurchaseManager] handleApprove: url =', url);
    console.log(
      '[PurchaseManager] handleApprove: approval_remarks =',
      approvalRemarks,
    );
    setApproving(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({ approval_remarks: approvalRemarks }),
      });
      const json = await res.json();
      console.log('[PurchaseManager] handleApprove: status =', res.status);
      console.log(
        '[PurchaseManager] handleApprove: response =',
        JSON.stringify(json, null, 2),
      );
      if (res.status === 200 || res.status === 201) {
        closeApproveModal();
        fetchData();
      } else {
        console.error(
          '[PurchaseManager] handleApprove: failed =',
          json?.message,
        );
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
    console.log(
      '[PurchaseManager] handlePOAction: poNo =',
      poNo,
      '| mode =',
      mode,
      '| url =',
      url,
    );
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
      console.log(
        '[PurchaseManager] handlePOAction: status =',
        res.status,
        '| response =',
        JSON.stringify(json, null, 2),
      );
      if (res.status === 200 || res.status === 201) {
        setPOActionModal({ visible: false, po: null, mode: 'approve' });
        fetchData();
      } else {
        console.error(
          '[PurchaseManager] handlePOAction: failed =',
          json?.message,
        );
      }
    } catch (e) {
      console.error('[PurchaseManager] handlePOAction: error =', e.message);
    } finally {
      setPOActioning(false);
    }
  };

  const openSheet = eq => {
    console.log(
      '[PurchaseManager] openSheet: full eq =',
      JSON.stringify(eq, null, 2),
    );
    console.log('[PurchaseManager] openSheet: eq_no =', eq?.eq_no);
    console.log(
      '[PurchaseManager] openSheet: mr_details.mr_no =',
      eq?.mr_details?.mr_no,
    );
    console.log(
      '[PurchaseManager] openSheet: mr_attachment.mr_no =',
      eq?.mr_attachment?.mr_no,
    );
    console.log(
      '[PurchaseManager] openSheet: eq_details.eq_no =',
      eq?.eq_details?.eq_no,
    );
    console.log(
      '[PurchaseManager] openSheet: eq_attachment.eq_no =',
      eq?.eq_attachment?.eq_no,
    );
    setBottomSheet({ visible: true, eq });
  };
  const closeSheet = () => {
    console.log('[PurchaseManager] closeSheet');
    setBottomSheet({ visible: false, eq: null });
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const loadList = async endpoint => {
    console.log('[PurchaseManager] loadList: endpoint =', endpoint);
    setLoading(true);
    setList([]);
    const token = await AsyncStorage.getItem('access_token');
    const myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${token}`);
    fetch(endpoint, {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    })
      .then(res => {
        console.log(
          '[PurchaseManager] loadList: response status =',
          res.status,
        );
        return res.json();
      })
      .then(data => {
        const items = data.data?.data ?? [];
        console.log('[PurchaseManager] loadList: items count =', items.length);
        setList(items);
      })
      .catch(err => console.error('[PurchaseManager] loadList: error =', err))
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchData = (tab = activeTab) => {
    const endpoint =
      tab === 'quotation'
        ? `${mainUrl}api/enquiry/quotation-list?mrno=&stock_code=&from_date=&to_date=`
        : `${mainUrl}api/purchase-order/list?pono=&department=&supname=&from_date=&to_date=&approved_only=&rejected_only=&per_page=20`;
    loadList(endpoint);
  };

  const handlePOSearch = () => {
    const pono = poSearchBy === 'PONO' ? poKeyword : '';
    const department = poSearchBy === 'Department' ? poKeyword : '';
    const supname = poSearchBy === 'Supplier' ? poKeyword : '';
    const from_date = poFromDate ? moment(poFromDate).format('YYYY-MM-DD') : '';
    const to_date = poToDate ? moment(poToDate).format('YYYY-MM-DD') : '';
    const approved_only = poStatusFilter === 'Approved' ? 1 : '';
    const rejected_only = poStatusFilter === 'Rejected' ? 1 : '';
    loadList(
      `${mainUrl}api/purchase-order/list?pono=${pono}&department=${department}&supname=${supname}&from_date=${from_date}&to_date=${to_date}&approved_only=${approved_only}&rejected_only=${rejected_only}&per_page=20`,
    );
  };

  const handlePOClear = () => {
    setPOKeyword('');
    setPOFromDate(null);
    setPOToDate(null);
    setPOStatusFilter('All');
    fetchData('purchaseOrder');
  };

  const handleEqSearch = () => {
    const mrno = eqSearchBy === 'MRNO' ? eqKeyword : '';
    const stock_code = eqSearchBy === 'Stock Code' ? eqKeyword : '';
    const from_date = eqFromDate ? moment(eqFromDate).format('YYYY-MM-DD') : '';
    const to_date = eqToDate ? moment(eqToDate).format('YYYY-MM-DD') : '';
    loadList(
      `${mainUrl}api/enquiry/quotation-list?mrno=${mrno}&stock_code=${stock_code}&from_date=${from_date}&to_date=${to_date}`,
    );
  };

  const handleEqClear = () => {
    setEQKeyword('');
    setEQFromDate(null);
    setEQToDate(null);
    fetchData('quotation');
  };

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

  const toggleExpand = index => {
    setExpandedIndex(prev => {
      const next = prev === index ? null : index;
      console.log(
        `[PurchaseManager] toggleExpand: index ${index} -> ${
          next === null ? 'collapsed' : 'expanded'
        }`,
      );
      return next;
    });
  };

  const openPOSheet = po => {
    console.log('[PurchaseManager] openPOSheet: PONO =', po?.PONO);
    console.log(
      '[PurchaseManager] openPOSheet: full po =',
      JSON.stringify(po, null, 2),
    );
    setPOBottomSheet({ visible: true, po });
  };
  const closePOSheet = () => {
    console.log('[PurchaseManager] closePOSheet');
    setPOBottomSheet({ visible: false, po: null });
  };

  const poSheetButtons = [
    {
      label: 'Enquiry Details',
      onPress: () => {
        const poNo = poBottomSheet.po?.PONO;
        const apiUrl = `${mainUrl}api/purchase-order/${poNo}/eq-details`;
        console.log(
          '[PurchaseManager] PO Enquiry Details: poNo =',
          poNo,
          '| apiUrl =',
          apiUrl,
        );
        closePOSheet();
        props.navigation.navigate('PMCommonScreen', {
          title: 'Enquiry Details',
          apiUrl,
          isEqDetails: true,
        });
      },
    },
    {
      label: 'MR Details',
      onPress: () => {
        const poNo = poBottomSheet.po?.PONO;
        const apiUrl = `${mainUrl}api/purchase-order/${poNo}/mr-details`;
        console.log(
          '[PurchaseManager] PO MR Details: poNo =',
          poNo,
          '| apiUrl =',
          apiUrl,
        );
        closePOSheet();
        props.navigation.navigate('PMCommonScreen', {
          title: 'MR Details',
          apiUrl,
          isMrDetails: true,
        });
      },
    },
    {
      label: 'MR Attach',
      onPress: () => {
        const mrNo = poBottomSheet.po?.mr_attachment?.mr_no;
        const apiUrl = `${mainUrl}api/material-request/${mrNo}/attachments`;
        console.log(
          '[PurchaseManager] PO MR Attach: mrNo =',
          mrNo,
          '| apiUrl =',
          apiUrl,
        );
        closePOSheet();
        props.navigation.navigate('PMCommonScreen', {
          title: 'MR Attachments',
          apiUrl,
          isDetail: false,
        });
      },
    },
    {
      label: 'Purchase Order Details',
      onPress: () => {
        const poNo = poBottomSheet.po?.PONO;
        const apiUrl = `${mainUrl}api/purchase-order/${poNo}/detail`;
        console.log(
          '[PurchaseManager] PO Details: poNo =',
          poNo,
          '| apiUrl =',
          apiUrl,
        );
        closePOSheet();
        props.navigation.navigate('PMCommonScreen', {
          title: 'Purchase Order Details',
          apiUrl,
          isDetail: true,
        });
      },
    },
    {
      label: 'Purchase Order Attach',
      onPress: () => {
        const poNo = poBottomSheet.po?.PONO;
        const apiUrl = `${mainUrl}api/purchase-order/${poNo}/attachments`;
        console.log(
          '[PurchaseManager] PO Attach: poNo =',
          poNo,
          '| apiUrl =',
          apiUrl,
        );
        closePOSheet();
        props.navigation.navigate('PMCommonScreen', {
          title: 'Purchase Order Attachments',
          apiUrl,
          isDetail: false,
        });
      },
    },
    {
      label: 'Reject',
      onPress: () => {
        const po = poBottomSheet.po;
        console.log('[PurchaseManager] PO Reject pressed: PONO =', po?.PONO);
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
        console.log('[PurchaseManager] PO Approve pressed: PONO =', po?.PONO);
        closePOSheet();
        setPOActionRemarks('');
        setPOActionModal({ visible: true, po, mode: 'approve' });
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
        console.log(
          '[PurchaseManager] Enquiry Details: eqNo =',
          eqNo,
          '| apiUrl =',
          apiUrl,
        );
        closeSheet();
        props.navigation.navigate('PMCommonScreen', {
          title: 'Enquiry Details',
          apiUrl,
          isDetail: true,
        });
      },
    },
    {
      label: 'Enquiry Attach',
      onPress: () => {
        const eqNo = bottomSheet.eq?.eq_attachment?.eq_no;
        const apiUrl = `${mainUrl}api/enquiry/${eqNo}/attachments`;
        console.log(
          '[PurchaseManager] Enquiry Attach: eqNo =',
          eqNo,
          '| apiUrl =',
          apiUrl,
        );
        closeSheet();
        props.navigation.navigate('PMCommonScreen', {
          title: 'Enquiry Attachments',
          apiUrl,
          isDetail: false,
        });
      },
    },
    {
      label: 'MR Details',
      onPress: () => {
        const mrNo = bottomSheet.eq?.mr_details?.mr_no;
        const apiUrl = `${mainUrl}api/material-request/${mrNo}/detail`;
        console.log(
          '[PurchaseManager] MR Details: mrNo =',
          mrNo,
          '| apiUrl =',
          apiUrl,
        );
        closeSheet();
        props.navigation.navigate('PMCommonScreen', {
          title: 'MR Details',
          apiUrl,
          isDetail: true,
        });
      },
    },
    {
      label: 'MR Attach',
      onPress: () => {
        const mrNo = bottomSheet.eq?.mr_attachment?.mr_no;
        const apiUrl = `${mainUrl}api/material-request/${mrNo}/attachments`;
        console.log(
          '[PurchaseManager] MR Attach: mrNo =',
          mrNo,
          '| apiUrl =',
          apiUrl,
        );
        closeSheet();
        props.navigation.navigate('PMCommonScreen', {
          title: 'MR Attachments',
          apiUrl,
          isDetail: false,
        });
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
        onCancel={() =>
          setPOActionModal({ visible: false, po: null, mode: 'approve' })
        }
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
            onPress={() => {
              setExpandedIndex(null);
              setActiveTab(tab);
            }}
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
        <FilterBar
          searchByOptions={PO_SEARCH_BY_OPTIONS}
          searchBy={poSearchBy}
          onChangeSearchBy={setPOSearchBy}
          keyword={poKeyword}
          onChangeKeyword={setPOKeyword}
          fromDate={poFromDate}
          toDate={poToDate}
          onChangeFromDate={setPOFromDate}
          onChangeToDate={setPOToDate}
          statusOptions={PO_STATUS_OPTIONS}
          statusFilter={poStatusFilter}
          onChangeStatus={setPOStatusFilter}
          onSearch={handlePOSearch}
          onClear={handlePOClear}
        />
      ) : (
        <FilterBar
          searchByOptions={EQ_SEARCH_BY_OPTIONS}
          searchBy={eqSearchBy}
          onChangeSearchBy={setEQSearchBy}
          keyword={eqKeyword}
          onChangeKeyword={setEQKeyword}
          fromDate={eqFromDate}
          toDate={eqToDate}
          onChangeFromDate={setEQFromDate}
          onChangeToDate={setEQToDate}
          onSearch={handleEqSearch}
          onClear={handleEqClear}
        />
      )}
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
          renderItem={
            activeTab === 'purchaseOrder'
              ? ({ item }) => (
                  <PurchaseOrderTab item={item} onPressMenu={openPOSheet} />
                )
              : ({ item, index }) => (
                  <QuotationTab
                    item={item}
                    index={index}
                    expandedIndex={expandedIndex}
                    onToggle={toggleExpand}
                    onPressMenu={openSheet}
                  />
                )
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loader: { flex: 1, justifyContent: 'center' },
  listContent: { padding: 12 },
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

  empty: { flex: 1, alignItems: 'center', marginTop: 40 },
  emptyText: { color: lightGreyTextColor, fontFamily: fonts.Lato_Regular },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 10,
    gap: 6,
  },
  dateLabel: {
    fontSize: 13,
    color: BlackColor,
    fontFamily: fonts.Lato_Bold,
  },
  dateButton: {
    height: 36,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    justifyContent: 'center',
    flex: 1,
  },
  dateText: { fontSize: 13, color: BlackColor, fontFamily: fonts.Lato_Regular },

  statusRow: {
    flexDirection: 'row',
    marginHorizontal: 10,
    marginTop: 10,
    gap: 8,
  },
  statusChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: primaryColor,
  },
  statusChipActive: { backgroundColor: primaryColor },
  statusChipText: {
    fontSize: 12,
    color: primaryColor,
    fontFamily: fonts.Lato_Regular,
  },
  statusChipTextActive: { color: '#fff', fontFamily: fonts.Lato_Bold },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 5,
    color: BlackColor,
    fontFamily: fonts.Lato_Regular,
  },
  searchButton: {
    height: 40,
    backgroundColor: primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 5,
  },
  searchIcon: { width: 22, height: 22 },
  clearButton: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
  },
  clearButtonText: {
    fontSize: 13,
    color: BlackColor,
    fontFamily: fonts.Lato_Regular,
  },

  dropdownButton: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 100,
    marginRight: 5,
  },
  dropdownButtonText: {
    fontSize: 13,
    color: BlackColor,
    fontFamily: fonts.Lato_Regular,
  },
  dropdownArrow: { fontSize: 12, color: 'gray' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 190,
    paddingLeft: 10,
  },
  dropdownMenu: {
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 140,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 16 },
  dropdownItemActive: { backgroundColor: primaryColor },
  dropdownItemText: {
    fontSize: 14,
    color: BlackColor,
    fontFamily: fonts.Lato_Regular,
  },
  dropdownItemTextActive: { color: 'white', fontFamily: fonts.Lato_Bold },
});

export default PurchaseManager;
