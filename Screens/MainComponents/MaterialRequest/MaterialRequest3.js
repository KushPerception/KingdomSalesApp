import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import {searchIcon} from '../../../Images';
import {getMaterialRequestStocks} from '../../../utility/ApiHelpers/StagingApis';
import {BlackColor, primaryColor} from '../../../utility/colors';
import HeaderComponent from '../../CommonComponents/Header';

const MaterialRequest3 = props => {
  const [stockCode, setStockCode] = useState('');
  const [stockName, setStockName] = useState('');
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      const res = await getMaterialRequestStocks(token, stockCode, stockName);
      const list = res?.data?.data ?? res?.data ?? res?.stocks ?? res ?? [];
      setStocks(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('stocks error', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = item => {
    const onStockSelected = props.route?.params?.onStockSelected;
    if (onStockSelected?.current) onStockSelected.current(item);
    props.navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <HeaderComponent
        BackTitle={true}
        Title="Select Stock"
        onBackPress={() => props.navigation.goBack()}
      />

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Stock Code"
          placeholderTextColor="#aaa"
          value={stockCode}
          onChangeText={setStockCode}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Stock Name"
          placeholderTextColor="#aaa"
          value={stockName}
          onChangeText={setStockName}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Image source={searchIcon} style={styles.searchIcon} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{marginTop: 32}} size="large" color={primaryColor} />
      ) : (
        <FlatList
          data={stocks}
          keyExtractor={(item, idx) => String(item?.STOCKCODE ?? item?.StockCode ?? idx)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No stocks found</Text>}
          renderItem={({item}) => (
            <TouchableOpacity style={styles.card} onPress={() => handleSelect(item)}>
              <Text style={styles.cardCode}>{item?.STOCKCODE ?? item?.StockCode ?? '—'}</Text>
              <Text style={styles.cardName}>{item?.STOCKNAME ?? item?.StockName ?? '—'}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
    backgroundColor: 'white',
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    color: BlackColor,
    fontSize: 13,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {width: 22, height: 22},
  list: {padding: 12},
  card: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
  },
  cardCode: {fontSize: 13, fontWeight: '700', color: primaryColor},
  cardName: {fontSize: 13, color: BlackColor, marginTop: 2},
  empty: {textAlign: 'center', marginTop: 40, color: '#aaa', fontSize: 14},
});

export default MaterialRequest3;
