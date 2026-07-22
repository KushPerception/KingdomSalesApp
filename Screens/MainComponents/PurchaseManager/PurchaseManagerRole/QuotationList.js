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
  approveEnquiry,
  fetchQuotationList,
} from '../../../../utility/ApiHelpers/EnquiryApi';
import { mainUrl } from '../../../../utility/ApiHelpers/StagingApis';
import { lightGreyTextColor, primaryColor } from '../../../../utility/colors';
import { fonts } from '../../../../utility/GlobalStyles';
import ApproveModal from '../../../CommonComponents/ApproveModal';
import BottomSheetModal from '../../../CommonComponents/BottomSheetModal';
import FilterBar from '../../../CommonComponents/FilterBar';
import QuotationTab from './QuotationTab';

const SEARCH_BY_OPTIONS = ['MRNO', 'Stock Code'];
const STATUS_OPTIONS = ['Pending', 'Approved', 'Rejected'];
const DEFAULT_FILTERS = {
  mrno: '',
  stock_code: '',
  from_date: '',
  to_date: '',
  status: 'pending',
};

const QuotationList = ({ navigation }) => {
  const tokenRef = useRef(null);

  const [expandedIndex, setExpandedIndex] = useState(null);

  const [searchBy, setSearchBy] = useState('MRNO');
  const [keyword, setKeyword] = useState('');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('Pending');

  const [bottomSheet, setBottomSheet] = useState({ visible: false, eq: null });
  const [approveModal, setApproveModal] = useState({
    visible: false,
    eq: null,
  });
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [approving, setApproving] = useState(false);

  const { list, loading, footerLoading, search, loadMore } = usePaginatedList({
    fetchPage: (filters, page) =>
      fetchQuotationList(tokenRef.current, filters, page),
  });

  useEffect(() => {
    (async () => {
      tokenRef.current = await AsyncStorage.getItem('access_token');
      search(buildFilters('Pending'));
    })();
  }, []);

  const toggleExpand = index => {
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  const buildFilters = overrideStatus => ({
    mrno: searchBy === 'MRNO' ? keyword : '',
    stock_code: searchBy === 'Stock Code' ? keyword : '',
    from_date: fromDate ? moment(fromDate).format('YYYY-MM-DD') : '',
    to_date: toDate ? moment(toDate).format('YYYY-MM-DD') : '',
    status: (overrideStatus ?? statusFilter).toLowerCase(),
  });

  const handleSearch = () => search(buildFilters());

  const handleStatusChange = newStatus => {
    setStatusFilter(newStatus);
    search(buildFilters(newStatus));
  };

  const handleClear = () => {
    setKeyword('');
    setFromDate(null);
    setToDate(null);
    setStatusFilter('Pending');
    search(buildFilters('Pending'));
  };

  const openSheet = eq => setBottomSheet({ visible: true, eq });
  const closeSheet = () => setBottomSheet({ visible: false, eq: null });

  const openApproveModal = eq => {
    setApprovalRemarks('');
    setApproveModal({ visible: true, eq });
  };
  const closeApproveModal = () => setApproveModal({ visible: false, eq: null });

  const handleApprove = async () => {
    const eqNo = approveModal.eq?.eq_no;
    const dtslno = approveModal.eq?.dtslno;
    setApproving(true);
    try {
      await approveEnquiry(tokenRef.current, eqNo, approvalRemarks, dtslno);
      closeApproveModal();
      search(buildFilters());
    } catch (e) {
      console.error('[QuotationList] handleApprove error:', e.message);
    } finally {
      setApproving(false);
    }
  };

  const sheetButtons = [
    {
      label: 'Enquiry Details',
      onPress: () => {
        const eqNo = bottomSheet.eq?.eq_details?.eq_no;
        closeSheet();
        navigation.navigate('PMCommonScreen', {
          title: 'Enquiry Details',
          apiUrl: `${mainUrl}api/enquiry/${eqNo}/detail`,
          isDetail: true,
        });
      },
    },
    {
      label: 'Enquiry Attach',
      onPress: () => {
        const eqNo = bottomSheet.eq?.eq_attachment?.eq_no;
        closeSheet();
        navigation.navigate('PMCommonScreen', {
          title: 'Enquiry Attachments',
          apiUrl: `${mainUrl}api/enquiry/${eqNo}/attachments`,
          isDetail: false,
        });
      },
    },
    {
      label: 'MR Details',
      onPress: () => {
        const mrNo = bottomSheet.eq?.mr_details?.mr_no;
        closeSheet();
        navigation.navigate('PMCommonScreen', {
          title: 'MR Details',
          apiUrl: `${mainUrl}api/material-request/${mrNo}/detail`,
          isDetail: true,
        });
      },
    },
    {
      label: 'MR Attach',
      onPress: () => {
        const mrNo = bottomSheet.eq?.mr_no;
        closeSheet();
        navigation.navigate('PMCommonScreen', {
          title: 'MR Attachments',
          apiUrl: `${mainUrl}api/material-request/${mrNo}/attachments`,
          isDetail: false,
        });
      },
    },
    {
      label: 'Approve',
      onPress: () => {
        const eq = {
          ...bottomSheet.eq,
          eq_no: bottomSheet.eq?.eq_details?.eq_no ?? bottomSheet.eq?.eq_no,
        };
        closeSheet();
        openApproveModal(eq);
      },
      accent: true,
      hidden: (() => {
        const eq = bottomSheet.eq;
        const s =
          eq?.status ??
          (eq?.approved ? 'approved' : eq?.rejected ? 'rejected' : 'pending');
        return s !== 'pending';
      })(),
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
      <BottomSheetModal
        visible={bottomSheet.visible}
        onClose={closeSheet}
        buttons={sheetButtons}
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
          renderItem={({ item, index }) => (
            <QuotationTab
              item={item}
              index={index}
              expandedIndex={expandedIndex}
              onToggle={toggleExpand}
              onPressMenu={openSheet}
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

export default QuotationList;
