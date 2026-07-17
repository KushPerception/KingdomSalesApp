import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {searchIcon} from '../../../Images';
import {mainUrl} from '../../../utility/ApiHelpers/StagingApis';
import {BlackColor, darkGreyTextColor, lightGreyTextColor, primaryColor, whiteColor} from '../../../utility/colors';
import {fonts} from '../../../utility/GlobalStyles';
import HeaderComponent from '../../CommonComponents/Header';

const SupplierPickerScreen = props => {
  const {onSelect} = props.route?.params ?? {};

  const [search, setSearch] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [noMorePages, setNoMorePages] = useState(false);
  const [footerLoading, setFooterLoading] = useState(false);

  useEffect(() => {
    console.log('[SupplierPickerScreen] mounted — loading initial supplier list');
    fetchSuppliers(1, '', true);
  }, []);

  const fetchSuppliers = async (pageNo = 1, keyword = '', reset = false) => {
    console.log(`[SupplierPickerScreen] fetchSuppliers: pageNo=${pageNo} | keyword="${keyword}" | reset=${reset}`);

    if (reset) {
      setLoading(true);
      setList([]);
      setNoMorePages(false);
    } else {
      setFooterLoading(true);
    }

    try {
      const token = await AsyncStorage.getItem('access_token');
      console.log('[SupplierPickerScreen] fetchSuppliers: token =', token ? 'present' : 'MISSING');

      const url = `${mainUrl}api/landing-cost/suppliers?search=${encodeURIComponent(keyword)}&per_page=20&page=${pageNo}`;
      console.log('[SupplierPickerScreen] fetchSuppliers: url =', url);

      const res = await fetch(url, {
        method: 'GET',
        headers: {Accept: 'application/json', Authorization: `Bearer ${token}`},
      });
      console.log('[SupplierPickerScreen] fetchSuppliers: status =', res.status);

      const json = await res.json();
      console.log('[SupplierPickerScreen] fetchSuppliers: raw =', JSON.stringify(json, null, 2));

      const items = json.data?.data ?? json.data ?? [];
      const lastPage = json.data?.last_page ?? 1;
      const total = json.data?.total ?? items.length;

      console.log(`[SupplierPickerScreen] fetchSuppliers: items=${items.length} | lastPage=${lastPage} | total=${total}`);

      setList(prev => {
        const updated = reset ? items : [...prev, ...items];
        console.log(`[SupplierPickerScreen] fetchSuppliers: list updated | total in state=${updated.length}`);
        return updated;
      });
      setPage(pageNo);
      setNoMorePages(pageNo >= lastPage);
      console.log(`[SupplierPickerScreen] fetchSuppliers: noMorePages=${pageNo >= lastPage}`);
    } catch (err) {
      console.error('[SupplierPickerScreen] fetchSuppliers: ERROR =', err.message);
    } finally {
      setLoading(false);
      setFooterLoading(false);
      console.log('[SupplierPickerScreen] fetchSuppliers: done');
    }
  };

  const onSearchPress = () => {
    console.log(`[SupplierPickerScreen] onSearchPress: keyword="${search}"`);
    fetchSuppliers(1, search, true);
  };

  const handleLoadMore = () => {
    console.log(`[SupplierPickerScreen] handleLoadMore: footerLoading=${footerLoading} | noMorePages=${noMorePages} | currentPage=${page}`);
    if (!footerLoading && !noMorePages) {
      console.log('[SupplierPickerScreen] handleLoadMore: fetching page', page + 1);
      fetchSuppliers(page + 1, search, false);
    } else {
      console.log('[SupplierPickerScreen] handleLoadMore: skipped');
    }
  };

  const handleSelect = item => {
    console.log('[SupplierPickerScreen] handleSelect: full item =', JSON.stringify(item));
    onSelect && onSelect(item);
    props.navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <HeaderComponent
        BackTitle
        Title="Select Supplier"
        onBackPress={() => {
          console.log('[SupplierPickerScreen] back pressed');
          props.navigation.goBack();
        }}
      />

      {/* Search Row — same pattern as MaterialRequestList */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search supplier..."
          placeholderTextColor={lightGreyTextColor}
          value={search}
          onChangeText={text => {
            console.log(`[SupplierPickerScreen] onChangeText: "${text}"`);
            setSearch(text);
          }}
          returnKeyType="search"
          onSubmitEditing={onSearchPress}
        />
        <TouchableOpacity style={styles.searchButton} onPress={onSearchPress}>
          <Image source={searchIcon} style={styles.searchIconImg} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={primaryColor} />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({item}) => (
            <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)}>
              <Text style={styles.itemCode}>{item.SupplierId}</Text>
              <Text style={styles.itemName}>{item.Name}</Text>
            </TouchableOpacity>
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            footerLoading
              ? <ActivityIndicator size="small" color={primaryColor} style={styles.footer} />
              : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No suppliers found.</Text>
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

  // same pattern as MaterialRequestList
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
    backgroundColor: whiteColor,
    color: BlackColor,
    fontFamily: fonts.Lato_Regular,
    fontSize: 14,
  },
  searchButton: {
    height: 40,
    backgroundColor: primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  searchIconImg: {width: 22, height: 22, tintColor: whiteColor},

  item: {
    backgroundColor: whiteColor,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemCode: {fontSize: 12, fontFamily: fonts.Lato_Bold, color: primaryColor},
  itemName: {fontSize: 14, fontFamily: fonts.Lato_Regular, color: darkGreyTextColor, marginTop: 2},
  footer: {marginVertical: 12},
  empty: {flex: 1, alignItems: 'center', marginTop: 40},
  emptyText: {color: lightGreyTextColor, fontFamily: fonts.Lato_Regular},
});

export default SupplierPickerScreen;
