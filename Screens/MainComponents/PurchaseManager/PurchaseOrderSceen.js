import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { mainUrl } from '../../../utility/ApiHelpers/StagingApis';
import {
  BlackColor,
  primaryColor,
  lightGreyTextColor,
} from '../../../utility/colors';
import { fonts } from '../../../utility/GlobalStyles';
import HeaderComponent from '../../CommonComponents/Header';
import BottomSheetModal from '../../CommonComponents/BottomSheetModal';
import ApproveModal from '../../CommonComponents/ApproveModal';
import PurchaseOrderTab from './PurchaseOrderTab';

const SEARCH_BY_OPTIONS = ['PONO', 'Department', 'Supplier'];
const STATUS_OPTIONS = ['All', 'Approved', 'Rejected'];

const PurchaseOrderScreen = props => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [noMorePages, setNoMorePages] = useState(false);
  const [footerLoading, setFooterLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
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

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [searchBy, setSearchBy] = useState('PONO');
  const [showDropdown, setShowDropdown] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const handlePOAction = async () => {
    const poNo = poActionModal.po?.PONO;
    const mode = poActionModal.mode;
    const url = `${mainUrl}api/purchase-order/${poNo}/${mode}`;
    const body = { remarks: poActionRemarks };
    console.log('[PurchaseOrderScreen] POST', url, '| request:', body);
    setPOActioning(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      console.log(
        '[PurchaseOrderScreen] POST',
        url,
        '| status:',
        res.status,
        '| response:',
        json,
      );
      if (res.status === 200 || res.status === 201) {
        setPOActionModal({ visible: false, po: null, mode: 'approve' });
        fetchData();
      } else {
        console.error(
          '[PurchaseOrderScreen] POST',
          url,
          '| failed:',
          json?.message,
        );
      }
    } catch (e) {
      console.error('[PurchaseOrderScreen] POST', url, '| error:', e.message);
    } finally {
      setPOActioning(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const loadList = async (url, pageNo = 1, reset = true) => {
    const fullUrl = `${url}&page=${pageNo}`;
    console.log('[PurchaseOrderScreen] GET', fullUrl);
    setCurrentUrl(url);
    if (reset) {
      setLoading(true);
      setList([]);
      setNoMorePages(false);
    } else {
      setFooterLoading(true);
    }
    const token = await AsyncStorage.getItem('access_token');
    fetch(fullUrl, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        console.log(
          '[PurchaseOrderScreen] GET',
          fullUrl,
          '| status:',
          res.status,
        );
        return res.json();
      })
      .then(data => {
        const items = data.data?.data ?? [];
        const lastPage = data.data?.last_page ?? 1;
        console.log(
          '[PurchaseOrderScreen] GET',
          fullUrl,
          '| items:',
          items.length,
          '| page:',
          pageNo,
          '/',
          lastPage,
        );
        setList(prev => (reset ? items : [...prev, ...items]));
        setPage(pageNo);
        setNoMorePages(pageNo >= lastPage);
      })
      .catch(err =>
        console.error('[PurchaseOrderScreen] GET', fullUrl, '| error:', err),
      )
      .finally(() => {
        setLoading(false);
        setFooterLoading(false);
      });
  };

  const fetchData = () => {
    loadList(
      `${mainUrl}api/purchase-order/list?pono=&department=&supname=&from_date=&to_date=&approved_only=&rejected_only=&per_page=20`,
    );
  };

  const handleSearch = () => {
    const pono = searchBy === 'PONO' ? keyword : '';
    const department = searchBy === 'Department' ? keyword : '';
    const supname = searchBy === 'Supplier' ? keyword : '';
    const from_date = fromDate ? moment(fromDate).format('YYYY-MM-DD') : '';
    const to_date = toDate ? moment(toDate).format('YYYY-MM-DD') : '';
    const approved_only = statusFilter === 'Approved' ? 1 : '';
    const rejected_only = statusFilter === 'Rejected' ? 1 : '';
    loadList(
      `${mainUrl}api/purchase-order/list?pono=${pono}&department=${department}&supname=${supname}&from_date=${from_date}&to_date=${to_date}&approved_only=${approved_only}&rejected_only=${rejected_only}&per_page=20`,
    );
  };

  const handleClearFilters = () => {
    setKeyword('');
    setFromDate(null);
    setToDate(null);
    setStatusFilter('All');
    fetchData();
  };

  const handleLoadMore = () => {
    if (!loading && !footerLoading && !noMorePages && currentUrl) {
      loadList(currentUrl, page + 1, false);
    }
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

      {/* Date Row */}
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

      {/* Status Row */}
      <View style={styles.statusRow}>
        {STATUS_OPTIONS.map(option => (
          <TouchableOpacity
            key={option}
            style={[
              styles.statusChip,
              statusFilter === option && styles.statusChipActive,
            ]}
            onPress={() => setStatusFilter(option)}
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

      {/* Search Row */}
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
          onChangeText={setKeyword}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Image source={searchIcon} style={styles.searchIcon} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleClearFilters}
          style={styles.clearButton}
        >
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown Modal */}
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
            {SEARCH_BY_OPTIONS.map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.dropdownItem,
                  searchBy === option && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  setSearchBy(option);
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

      {/* Date Pickers */}
      <DatePicker
        modal
        open={showFromPicker}
        date={fromDate || new Date()}
        mode="date"
        maximumDate={toDate || new Date()}
        onConfirm={date => {
          setFromDate(date);
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
          setToDate(date);
          setShowToPicker(false);
        }}
        onCancel={() => setShowToPicker(false)}
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
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            footerLoading ? (
              <ActivityIndicator
                style={styles.footerLoader}
                size="small"
                color={primaryColor}
              />
            ) : null
          }
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
  footerLoader: { paddingVertical: 16 },
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

export default PurchaseOrderScreen;
