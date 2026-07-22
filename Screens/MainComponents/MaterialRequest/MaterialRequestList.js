import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { TextInput } from 'react-native-gesture-handler';
import usePaginatedList from '../../../hooks/usePaginatedList';
import { fetchMaterialRequestList } from '../../../utility/ApiHelpers/MaterialRequestApi';
import {
  BlackColor,
  modalBackgroundColor,
  primaryColor,
} from '../../../utility/colors';
import ButtonWithLoader from '../../CommonComponents/ButtonLoader';
import FabButton from '../../CommonComponents/FabButton';
import HeaderComponent from '../../CommonComponents/Header';
import LoaderComponent from '../../CommonComponents/LoaderComponent';
import OfflineNotice from '../../CommonComponents/OfflineNotice';

const SEARCH_BY_OPTIONS = ['MRNO', 'Division', 'Dept'];

const MaterialRequestList = props => {
  const tokenRef = useRef(null);
  const [internetStatus, setInternetStatus] = useState(true);

  const [fromDate, setFromDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 1)),
  );
  const [toDate, setToDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [searchBy, setSearchBy] = useState('MRNO');
  const [showDropdown, setShowDropdown] = useState(false);
  const [keyword, setKeyword] = useState('');
  const isFirstRun = useRef(true);

  const { list, loading, footerLoading, noMorePages, search, loadMore } =
    usePaginatedList({
      fetchPage: (filters, page) =>
        fetchMaterialRequestList(tokenRef.current, filters, page),
    });

  const buildFilters = () => ({
    from_date: moment(fromDate).format('YYYY-MM-DD'),
    to_date: moment(toDate).format('YYYY-MM-DD'),
    division: searchBy === 'Division' ? keyword : '',
    dept: searchBy === 'Dept' ? keyword : '',
    mrno: searchBy === 'MRNO' ? keyword : '',
  });

  useEffect(() => {
    NetInfo.addEventListener(state => setInternetStatus(state.isConnected));
  }, []);

  useEffect(() => {
    (async () => {
      tokenRef.current = await AsyncStorage.getItem('access_token');
      search(buildFilters());
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const timer = setTimeout(() => {
      search(buildFilters());
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, searchBy]);

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

  const RenderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      activeOpacity={0.6}
      onPress={() => {
        if (item?.is_editable) {
          props.navigation.navigate('MaterialRequestForm', { mrno: item.MRNO });
        } else {
          Alert.alert(
            'Editing Not Allowed',
            'The MR request forwarded to the Purchase Department.',
          );
        }
      }}
    >
      <View style={styles.itemTitleRow}>
        <Text style={styles.itemTitle}>{item?.MRNO ?? '-'}</Text>
        <View style={styles.badgeRow}>
          {
            <Text
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item?.MRSTATUS) },
              ]}
            >
              {item?.MRSTATUS ?? 'PENDING'}
            </Text>
          }
          {item?.is_editable && <Text style={styles.editBadge}>Edit</Text>}
        </View>
      </View>
      <Text style={styles.itemText}>Date: {item?.MRDATE ?? '-'}</Text>
      <Text style={styles.itemText}>Division: {item?.DIVISION ?? '-'}</Text>
      <Text style={styles.itemText}>Dept: {item?.DEPT ?? '-'}</Text>
      <Text style={styles.itemText}>Plant: {item?.PLANT ?? '-'}</Text>
      <Text style={styles.itemText}>Eq/Part: {item?.EQPART ?? '-'}</Text>
      <Text style={styles.itemText}>Veh No: {item?.VEHNO ?? '-'}</Text>
      <Text style={styles.itemText}>Priority: {item?.PRIORITY ?? '-'}</Text>
    </TouchableOpacity>
  );

  const RenderFooter = () =>
    list?.length > 0 && !noMorePages ? (
      <View style={styles.footer}>
        <ButtonWithLoader
          onPress={loadMore}
          title="Load More"
          loading={footerLoading}
        />
      </View>
    ) : null;

  return (
    <View style={styles.container}>
      <HeaderComponent
        HomeScreenHeader={true}
        Title="Material Requests"
        onPressRight2={handleLogout}
      />
      <FabButton
        onPress={() => props.navigation.navigate('MaterialRequestForm')}
      />
      <OfflineNotice
        isConnected={internetStatus}
        setIsConnected={setInternetStatus}
      />

      {/* Date Row */}
      <View style={styles.dateRow}>
        <Text style={styles.dateLabel}>From</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowFromPicker(true)}
        >
          <Text style={styles.dateText}>
            {moment(fromDate).format('DD/MM/YYYY')}
          </Text>
        </TouchableOpacity>
        <Text style={styles.dateLabel}>To</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowToPicker(true)}
        >
          <Text style={styles.dateText}>
            {moment(toDate).format('DD/MM/YYYY')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Row */}
      <View style={styles.searchRow}>
        {/* Dropdown on the LEFT */}
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowDropdown(true)}
        >
          <Text style={styles.dropdownButtonText}>{searchBy}</Text>
          <Text style={styles.dropdownArrow}>▾</Text>
        </TouchableOpacity>
        {/* Search input in the MIDDLE */}
        <TextInput
          style={styles.searchInput}
          placeholder={`Search by ${searchBy}`}
          value={keyword}
          onChangeText={setKeyword}
        />
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
        date={fromDate}
        mode="date"
        maximumDate={toDate}
        onConfirm={date => {
          setFromDate(date);
          setShowFromPicker(false);
        }}
        onCancel={() => setShowFromPicker(false)}
      />
      <DatePicker
        modal
        open={showToPicker}
        date={toDate}
        mode="date"
        minimumDate={fromDate}
        maximumDate={new Date()}
        onConfirm={date => {
          setToDate(date);
          setShowToPicker(false);
        }}
        onCancel={() => setShowToPicker(false)}
      />

      {loading ? (
        <LoaderComponent />
      ) : list?.length > 0 ? (
        <FlatList
          data={list}
          keyExtractor={(_, index) => index + ''}
          renderItem={RenderItem}
          ListFooterComponent={RenderFooter}
          removeClippedSubviews={true}
          extraData={list}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text>No Material Requests found.</Text>
        </View>
      )}
    </View>
  );
};

const getStatusColor = status => {
  switch (status?.toUpperCase()) {
    case 'APPROVED':
      return '#2e7d32';
    case 'PENDING':
      return '#e65100';
    case 'REJECTED':
      return '#c62828';
    case 'CANCEL':
      return '#757575';
    case 'CLOSED':
      return '#555';
    default:
      return '#1565c0';
  }
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    fontWeight: '600',
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
  dateText: { fontSize: 13, color: BlackColor },
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
    minWidth: 80,
    marginRight: 5,
  },
  dropdownButtonText: { fontSize: 13, color: BlackColor },
  dropdownArrow: { fontSize: 12, color: 'gray' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 140,
    paddingLeft: 10,
  },
  dropdownMenu: {
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 120,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownItemActive: {
    backgroundColor: primaryColor,
  },
  dropdownItemText: { fontSize: 14, color: BlackColor },
  dropdownItemTextActive: { color: 'white' },
  itemContainer: {
    borderBottomWidth: 0.5,
    borderBottomColor: modalBackgroundColor,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  itemTitle: { fontSize: 15, fontWeight: 'bold' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusBadge: {
    fontSize: 11,
    color: 'white',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  editBadge: {
    fontSize: 11,
    color: primaryColor,
    borderWidth: 1,
    borderColor: primaryColor,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  itemText: { fontSize: 13, paddingTop: 2, color: '#444' },
  footer: { padding: 10, alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default MaterialRequestList;
