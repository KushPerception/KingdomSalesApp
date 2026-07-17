import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useCallback, useState} from 'react';
import {ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {mainUrl} from '../../../utility/ApiHelpers/StagingApis';
import {lightGreyTextColor, primaryColor} from '../../../utility/colors';
import {fonts} from '../../../utility/GlobalStyles';
import HeaderComponent from '../../CommonComponents/Header';
import LandingCostCard from './LandingCostCard';

const CostController = props => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [noMorePages, setNoMorePages] = useState(false);
  const [footerLoading, setFooterLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      console.log('[CostController] focused — refreshing list');
      fetchData(1, true);
    }, []),
  );

  const fetchData = async (pageNo = 1, reset = false) => {
    console.log(`[CostController] fetchData: pageNo=${pageNo} | reset=${reset}`);

    if (reset) {
      setLoading(true);
      setList([]);
      setNoMorePages(false);
    } else {
      setFooterLoading(true);
    }

    try {
      const token = await AsyncStorage.getItem('access_token');
      console.log('[CostController] fetchData: token =', token ? 'present' : 'MISSING');

      const url = `${mainUrl}api/landing-cost/list?from_date=&to_date=&lcno=&supname=&pono=&posted=&per_page=20&page=${pageNo}`;
      console.log('[CostController] fetchData: url =', url);

      const res = await fetch(url, {
        method: 'GET',
        headers: {Authorization: `Bearer ${token}`},
      });
      console.log('[CostController] fetchData: response status =', res.status);

      const json = await res.json();
      console.log('[CostController] fetchData: raw response =', JSON.stringify(json, null, 2));

      if (!json.success) {
        console.warn('[CostController] fetchData: success=false | message =', json.message);
      }

      const items = json.data?.data ?? [];
      const lastPage = json.data?.last_page ?? 1;
      const currentPage = json.data?.current_page ?? pageNo;
      const total = json.data?.total ?? 0;

      console.log(`[CostController] fetchData: items count=${items.length} | currentPage=${currentPage} | lastPage=${lastPage} | total=${total}`);

      setList(prev => {
        const updated = reset ? items : [...prev, ...items];
        console.log(`[CostController] fetchData: list updated | total in state=${updated.length}`);
        return updated;
      });
      setPage(pageNo);
      setNoMorePages(pageNo >= lastPage);
      console.log(`[CostController] fetchData: noMorePages=${pageNo >= lastPage}`);
    } catch (err) {
      console.error('[CostController] fetchData: ERROR =', err.message);
      console.error('[CostController] fetchData: stack =', err.stack);
    } finally {
      setLoading(false);
      setFooterLoading(false);
      console.log('[CostController] fetchData: done, loading=false');
    }
  };

  const handleLoadMore = () => {
    console.log(`[CostController] handleLoadMore: footerLoading=${footerLoading} | noMorePages=${noMorePages} | currentPage=${page}`);
    if (!footerLoading && !noMorePages) {
      console.log('[CostController] handleLoadMore: fetching page', page + 1);
      fetchData(page + 1, false);
    } else {
      console.log('[CostController] handleLoadMore: skipped (loading or no more pages)');
    }
  };

  const handleLogout = () => {
    console.log('[CostController] handleLogout: logout alert shown');
    Alert.alert('Hold on!', 'Are you sure you want to Logout from App?', [
      {text: 'NO', style: 'cancel', onPress: () => console.log('[CostController] handleLogout: cancelled')},
      {
        text: 'YES',
        onPress: async () => {
          console.log('[CostController] handleLogout: clearing storage and navigating to Login');
          await AsyncStorage.clear();
          props.navigation.replace('Login');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <HeaderComponent
        HomeScreenHeader={true}
        Title="Cost Controller"
        onPressRight2={handleLogout}
      />
      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={primaryColor} />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({item}) => (
            <LandingCostCard
              item={item}
              onPress={() => {
                console.log('[CostController] card pressed — navigating to edit | LCNO =', item.LCNO, '| POSTED =', item.POSTED);
                props.navigation.navigate('CreateLandingCost', {editItem: item});
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            footerLoading ? (
              <ActivityIndicator size="small" color={primaryColor} style={styles.footer} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No landing cost records found.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => {
          console.log('[CostController] FAB pressed — navigating to CreateLandingCost');
          props.navigation.navigate('CreateLandingCost');
        }}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5', position: 'relative'},
  loader: {flex: 1, justifyContent: 'center'},
  listContent: {padding: 12},
  footer: {marginVertical: 12},
  empty: {flex: 1, alignItems: 'center', marginTop: 40},
  emptyText: {color: lightGreyTextColor, fontFamily: fonts.Lato_Regular},
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {fontSize: 28, color: '#fff', lineHeight: 32, fontFamily: fonts.Lato_Regular},
});

export default CostController;
