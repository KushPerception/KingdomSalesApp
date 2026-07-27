import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import usePaginatedList from '../../../../hooks/usePaginatedList';
import {
  approvePurchaseOrder,
  fetchPurchaseOrderList,
  rejectPurchaseOrder,
} from '../../../../utility/ApiHelpers/PurchaseOrderApi';
import { mainUrl } from '../../../../utility/ApiHelpers/StagingApis';
import { lightGreyTextColor, primaryColor } from '../../../../utility/colors';
import { fonts } from '../../../../utility/GlobalStyles';
import ApproveModal from '../../../CommonComponents/ApproveModal';
import BottomSheetModal from '../../../CommonComponents/BottomSheetModal';
import FilterBar from '../../../CommonComponents/FilterBar';
import PurchaseOrderTab from './PurchaseOrderTab';

const SEARCH_BY_OPTIONS = ['PONO', 'Department', 'Supplier'];
const STATUS_OPTIONS = ['Pending', 'Approved', 'Rejected'];
const DEFAULT_FILTERS = {
  pono: '',
  department: '',
  supname: '',
  from_date: '',
  to_date: '',
  approved_only: '',
  rejected_only: '',
  pending_only: '',
};

const PurchaseOrderList = ({ navigation }) => {
  const tokenRef = useRef(null);

  const [searchBy, setSearchBy] = useState('PONO');
  const [keyword, setKeyword] = useState('');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('Pending');

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

  const { list, loading, footerLoading, search, loadMore } = usePaginatedList({
    fetchPage: (filters, page) =>
      fetchPurchaseOrderList(tokenRef.current, filters, page),
  });

  useEffect(() => {
    (async () => {
      tokenRef.current = await AsyncStorage.getItem('access_token');
      console.log('[PurchaseOrderList] Init — loading pending orders');
      search({ ...DEFAULT_FILTERS, pending_only: 1 });
    })();
  }, []);

  const buildFilters = overrideStatus => {
    const status = overrideStatus ?? statusFilter;
    const filters = {
      pono: searchBy === 'PONO' ? keyword : '',
      department: searchBy === 'Department' ? keyword : '',
      supname: searchBy === 'Supplier' ? keyword : '',
      from_date: fromDate ? moment(fromDate).format('YYYY-MM-DD') : '',
      to_date: toDate ? moment(toDate).format('YYYY-MM-DD') : '',
      approved_only: status === 'Approved' ? 1 : '',
      rejected_only: status === 'Rejected' ? 1 : '',
      pending_only: status === 'Pending' ? 1 : '',
    };
    console.log('[PurchaseOrderList] buildFilters →', filters);
    return filters;
  };

  const handleSearch = () => {
    console.log('[PurchaseOrderList] Search triggered — searchBy:', searchBy, '| keyword:', keyword, '| status:', statusFilter);
    search(buildFilters());
  };

  const handleStatusChange = newStatus => {
    console.log('[PurchaseOrderList] Status changed →', newStatus);
    setStatusFilter(newStatus);
    search(buildFilters(newStatus));
  };

  const handleClear = () => {
    console.log('[PurchaseOrderList] Filters cleared — resetting to Pending');
    setKeyword('');
    setFromDate(null);
    setToDate(null);
    setStatusFilter('Pending');
    search({ ...DEFAULT_FILTERS, pending_only: 1 });
  };

  const openPOSheet = po => setPOBottomSheet({ visible: true, po });
  const closePOSheet = () => setPOBottomSheet({ visible: false, po: null });

  const handlePOAction = async () => {
    const poNo = poActionModal.po?.PONO;
    const mode = poActionModal.mode;
    setPOActioning(true);
    try {
      const action =
        mode === 'reject' ? rejectPurchaseOrder : approvePurchaseOrder;
      console.log(`[PurchaseOrderList] PO action — mode: ${mode} | PONO: ${poNo}`);
      await action(tokenRef.current, poNo, poActionRemarks);
      console.log('[PurchaseOrderList] PO action success — refreshing list');
      setPOActionModal({ visible: false, po: null, mode: 'approve' });
      search(buildFilters());
    } catch (e) {
      console.error('[PurchaseOrderList] handlePOAction error:', e.message);
    } finally {
      setPOActioning(false);
    }
  };

  const po = poBottomSheet.po;
  const isActioned = !!(po?.approved || po?.rejected);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const poSheetButtons = React.useMemo(
    () => [
      {
        label: 'Enquiry Details',
        onPress: () => {
          const poNo = poBottomSheet.po?.PONO;
          closePOSheet();
          navigation.navigate('PMCommonScreen', {
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
          navigation.navigate('PMCommonScreen', {
            title: 'MR Details',
            apiUrl: `${mainUrl}api/purchase-order/${poNo}/mr-details`,
            isMrDetails: true,
          });
        },
      },
      {
        label: 'Purchase Order Details',
        onPress: () => {
          const poNo = poBottomSheet.po?.PONO;
          closePOSheet();
          navigation.navigate('PMCommonScreen', {
            title: 'Purchase Order Details',
            apiUrl: `${mainUrl}api/purchase-order/${poNo}/detail`,
            isPODetail: true,
          });
        },
      },
      {
        label: 'Purchase Order Attach',
        onPress: () => {
          const poNo = poBottomSheet.po?.PONO;
          closePOSheet();
          navigation.navigate('PMCommonScreen', {
            title: 'Purchase Order Attachments',
            apiUrl: `${mainUrl}api/purchase-order/${poNo}/attachments`,
            isDetail: false,
          });
        },
      },
      ...['Reject', 'Approve'].map((label, i) => ({
        label,
        onPress: isActioned
          ? null
          : () => {
              closePOSheet();
              setPOActionRemarks('');
              setPOActionModal({
                visible: true,
                po,
                mode: i === 0 ? 'reject' : 'approve',
              });
            },
        danger: i === 0,
        accent: i === 1,
        disabled: isActioned,
      })),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [poBottomSheet.po],
  );

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
      <FilterBar
        searchByOptions={SEARCH_BY_OPTIONS}
        searchBy={searchBy}
        onChangeSearchBy={setSearchBy}
        keyword={keyword}
        onChangeKeyword={setKeyword}
        fromDate={fromDate}
        toDate={toDate}
        onChangeFromDate={setFromDate}
        onChangeToDate={setToDate}
        statusOptions={STATUS_OPTIONS}
        statusFilter={statusFilter}
        onChangeStatus={handleStatusChange}
        onSearch={handleSearch}
        onClear={handleClear}
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
            <PurchaseOrderTab
              item={item}
              onPressMenu={openPOSheet}
              onPress={po => {
                navigation.navigate('PMCommonScreen', {
                  title: 'Purchase Order Details',
                  apiUrl: `${mainUrl}api/purchase-order/${po.PONO}/detail`,
                  isPODetail: true,
                });
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
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
});

export default PurchaseOrderList;
