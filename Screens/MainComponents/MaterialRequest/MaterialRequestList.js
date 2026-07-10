import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {TextInput} from 'react-native-gesture-handler';
import {searchIcon} from '../../../Images';
import {getMaterialRequestList} from '../../../utility/ApiHelpers/StagingApis';
import {BlackColor, modalBackgroundColor, primaryColor} from '../../../utility/colors';
import ButtonWithLoader from '../../CommonComponents/ButtonLoader';
import HeaderComponent from '../../CommonComponents/Header';
import LoaderComponent from '../../CommonComponents/LoaderComponent';
import OfflineNotice from '../../CommonComponents/OfflineNotice';

const SEARCH_BY_OPTIONS = ['MRNO', 'Division', 'Dept'];

const MaterialRequestList = props => {
  const [list, setList] = useState([]);
  const [userToken, setUserToken] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [footerLoading, setFooterLoading] = useState(false);
  const [noMorePage, setNoMorePage] = useState(false);
  const [internetStatus, setInternetStatus] = useState(true);

  const [fromDate, setFromDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [toDate, setToDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [searchBy, setSearchBy] = useState('MRNO');
  const [showDropdown, setShowDropdown] = useState(false);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    NetInfo.addEventListener(state => setInternetStatus(state.isConnected));
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const getFilterParams = () => ({
    division: searchBy === 'Division' ? keyword : '',
    dept:     searchBy === 'Dept'     ? keyword : '',
    mrno:     searchBy === 'MRNO'     ? keyword : '',
  });

  const callApi = (token, filters, fd, td, existingList, pg) => {
    getMaterialRequestList(
      token,
      moment(fd).format('YYYY-MM-DD'),
      moment(td).format('YYYY-MM-DD'),
      filters.division,
      filters.dept,
      filters.mrno,
      existingList, setList, pg, setPage,
      setFooterLoading, setNoMorePage, setLoading,
    );
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    props.navigation.replace('Login');
  };

  const fetchData = async () => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      setUserToken(token);
      callApi(token, {division: '', dept: '', mrno: ''}, fromDate, toDate, [], 1);
    }
  };

  const onSearch = async () => {
    setList([]);
    setPage(1);
    setNoMorePage(false);
    const token = await AsyncStorage.getItem('access_token');
    callApi(token, getFilterParams(), fromDate, toDate, [], 1);
  };

  const onLoadMore = () => {
    callApi(userToken, getFilterParams(), fromDate, toDate, list, page);
  };

  const RenderItem = ({item}) => (
    <TouchableOpacity
      style={styles.itemContainer}
      activeOpacity={item?.is_editable ? 0.6 : 1}
      onPress={() => {
        if (item?.is_editable) {
          props.navigation.navigate('MaterialRequest1', {mrno: item.MRNO});
        }
      }}>
      <View style={styles.itemTitleRow}>
        <Text style={styles.itemTitle}>{item?.MRNO ?? '-'}</Text>
        {item?.is_editable && <Text style={styles.editBadge}>Edit</Text>}
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
    list?.length > 0 && !noMorePage ? (
      <View style={styles.footer}>
        <ButtonWithLoader onPress={onLoadMore} title="Load More" loading={footerLoading} />
      </View>
    ) : null;

  return (
    <View style={styles.container}>
      <HeaderComponent
        HomeScreenHeader={true}
        Title="Material Requests"
        onPressRight2={handleLogout}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => props.navigation.navigate('MaterialRequest1')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      <OfflineNotice isConnected={internetStatus} setIsConnected={setInternetStatus} />

      {/* Date Row */}
      <View style={styles.dateRow}>
        <Text style={styles.dateLabel}>From</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowFromPicker(true)}>
          <Text style={styles.dateText}>{moment(fromDate).format('DD/MM/YYYY')}</Text>
        </TouchableOpacity>
        <Text style={styles.dateLabel}>To</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowToPicker(true)}>
          <Text style={styles.dateText}>{moment(toDate).format('DD/MM/YYYY')}</Text>
        </TouchableOpacity>
      </View>

      {/* Search Row */}
      <View style={styles.searchRow}>
        {/* Dropdown on the LEFT */}
        <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowDropdown(true)}>
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
        {/* Search button on the RIGHT */}
        <TouchableOpacity onPress={onSearch} style={styles.searchButton}>
          <Image source={searchIcon} style={styles.searchIcon} />
        </TouchableOpacity>
      </View>

      {/* Dropdown Modal */}
      <Modal transparent visible={showDropdown} animationType="fade" onRequestClose={() => setShowDropdown(false)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowDropdown(false)}>
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
                }}>
                <Text style={[styles.dropdownItemText, searchBy === option && styles.dropdownItemTextActive]}>
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
        onConfirm={date => { setFromDate(date); setShowFromPicker(false); }}
        onCancel={() => setShowFromPicker(false)}
      />
      <DatePicker
        modal
        open={showToPicker}
        date={toDate}
        mode="date"
        minimumDate={fromDate}
        maximumDate={new Date()}
        onConfirm={date => { setToDate(date); setShowToPicker(false); }}
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

const styles = StyleSheet.create({
  container: {flex: 1},
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
  dateText: {fontSize: 13, color: BlackColor},
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
  searchButton: {
    height: 40,
    backgroundColor: primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 5,
  },
  searchIcon: {width: 22, height: 22},
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
  dropdownButtonText: {fontSize: 13, color: BlackColor},
  dropdownArrow: {fontSize: 12, color: 'gray'},
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
  dropdownItemText: {fontSize: 14, color: BlackColor},
  dropdownItemTextActive: {color: 'white'},
  itemContainer: {
    borderBottomWidth: 0.5,
    borderBottomColor: modalBackgroundColor,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  itemTitleRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 4},
  itemTitle: {fontSize: 15, fontWeight: 'bold'},
  editBadge: {fontSize: 11, color: primaryColor, borderWidth: 1, borderColor: primaryColor, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1},
  itemText: {fontSize: 13, paddingTop: 2, color: '#444'},
  footer: {padding: 10, alignItems: 'center'},
  emptyContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    zIndex: 10,
  },
  fabText: {fontSize: 30, color: 'white', lineHeight: 34},
});

export default MaterialRequestList;
