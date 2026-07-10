import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import HeaderComponent from '../../CommonComponents/Header';
import {
  BlackColor,
  darkGreyTextColor,
  lightGreyTextColor,
  primaryColor,
  whiteColor,
} from '../../../utility/colors';
import {fonts} from '../../../utility/GlobalStyles';

const PurchaseManager = props => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    console.log('[PurchaseManager] fetchData: starting...');
    const token = await AsyncStorage.getItem('access_token');
    console.log('[PurchaseManager] fetchData: token =', token);
    const myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${token}`);
    console.log('[PurchaseManager] fetchData: calling API...');
    fetch('https://kingdom.thatsmytask.com/api/enquiry/quotation-list', {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    })
      .then(res => {
        console.log('[PurchaseManager] fetchData: response status =', res.status);
        return res.json();
      })
      .then(data => {
        console.log('[PurchaseManager] fetchData: data =', JSON.stringify(data, null, 2));
        setList(data.data ?? []);
      })
      .catch(err => console.error('[PurchaseManager] fetchData: error =', err))
      .finally(() => {
        console.log('[PurchaseManager] fetchData: done');
        setLoading(false);
      });
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    props.navigation.replace('Login');
  };

  const toggleExpand = index => {
    setExpandedIndex(prev => {
      const next = prev === index ? null : index;
      console.log(`[PurchaseManager] toggleExpand: index ${index} -> ${next === null ? 'collapsed' : 'expanded'}`);
      return next;
    });
  };

  const RenderItem = ({item, index}) => {
    const isExpanded = expandedIndex === index;
    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => toggleExpand(index)}
          activeOpacity={0.7}>
          <View style={styles.cardInfo}>
            <Text style={styles.mrNo}>{item.mr_no}</Text>
            <Text style={styles.stockCode}>{item.stock_code}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
          <Text style={styles.arrow}>{isExpanded ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.enquiriesContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.col, styles.colHeader]}>EQ No</Text>
              <Text style={[styles.col, styles.colHeader]}>Supplier</Text>
              <Text style={[styles.col, styles.colHeader]}>Qty</Text>
              <Text style={[styles.col, styles.colHeader]}>Rate</Text>
              <Text style={[styles.col, styles.colHeader]}>Status</Text>
            </View>
            {item.enquiries?.map((eq, i) => (
              <View
                key={i}
                style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
                <Text style={styles.col}>{eq.eq_no}</Text>
                <Text style={styles.col}>{eq.supplier}</Text>
                <Text style={styles.col}>{eq.qty ?? '-'}</Text>
                <Text style={styles.col}>{eq.rate ?? '-'}</Text>
                <Text
                  style={[
                    styles.col,
                    styles.statusText,
                    eq.approved && styles.approved,
                    eq.rejected && styles.rejected,
                  ]}>
                  {eq.approved ? 'Approved' : eq.rejected ? 'Rejected' : 'Pending'}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderComponent
        HomeScreenHeader={true}
        Title="Purchase Manager"
        onPressRight2={handleLogout}
      />
      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={primaryColor} />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(_, i) => i.toString()}
          renderItem={RenderItem}
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
  card: {
    backgroundColor: whiteColor,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  cardInfo: {flex: 1},
  mrNo: {
    fontSize: 15,
    fontFamily: fonts.Lato_Bold,
    color: primaryColor,
    marginBottom: 2,
  },
  stockCode: {
    fontSize: 13,
    fontFamily: fonts.Lato_Regular,
    color: darkGreyTextColor,
  },
  description: {
    fontSize: 13,
    fontFamily: fonts.Lato_Regular,
    color: lightGreyTextColor,
    marginTop: 2,
  },
  arrow: {fontSize: 14, color: primaryColor, marginLeft: 8},
  enquiriesContainer: {borderTopWidth: 1, borderTopColor: '#eee'},
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: primaryColor,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRowAlt: {backgroundColor: '#f9f9f9'},
  col: {flex: 1, fontSize: 12, color: BlackColor, fontFamily: fonts.Lato_Regular},
  colHeader: {color: whiteColor, fontFamily: fonts.Lato_Bold, fontSize: 12},
  statusText: {fontFamily: fonts.Lato_Bold},
  approved: {color: '#006B38'},
  rejected: {color: '#cc0000'},
  empty: {flex: 1, alignItems: 'center', marginTop: 40},
  emptyText: {color: lightGreyTextColor, fontFamily: fonts.Lato_Regular},
});

export default PurchaseManager;
