import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useRef, useState} from 'react';
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
import usePaginatedList from '../../../hooks/usePaginatedList';
import {fetchSupplierList} from '../../../utility/ApiHelpers/LandingCostApi';
import {BlackColor, darkGreyTextColor, lightGreyTextColor, primaryColor, whiteColor} from '../../../utility/colors';
import {fonts} from '../../../utility/GlobalStyles';
import HeaderComponent from '../../CommonComponents/Header';

const SupplierPickerScreen = props => {
  const {onSelect} = props.route?.params ?? {};
  const tokenRef = useRef(null);

  const [search, setSearch] = useState('');

  const {list, loading, footerLoading, search: runSearch, loadMore} = usePaginatedList({
    fetchPage: (keyword, page) => fetchSupplierList(tokenRef.current, keyword, page),
  });

  useEffect(() => {
    (async () => {
      tokenRef.current = await AsyncStorage.getItem('access_token');
      runSearch('');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearchPress = () => runSearch(search);

  const handleSelect = item => {
    onSelect && onSelect(item);
    props.navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <HeaderComponent
        BackTitle
        Title="Select Supplier"
        onBackPress={() => props.navigation.goBack()}
      />

      {/* Search Row — same pattern as MaterialRequestList */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search supplier..."
          placeholderTextColor={lightGreyTextColor}
          value={search}
          onChangeText={setSearch}
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
          onEndReached={loadMore}
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
