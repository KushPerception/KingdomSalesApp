import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import usePaginatedList from '../../../hooks/usePaginatedList';
import { fetchLandingCostList } from '../../../utility/ApiHelpers/LandingCostApi';
import { lightGreyTextColor, primaryColor } from '../../../utility/colors';
import { fonts } from '../../../utility/GlobalStyles';
import HeaderComponent from '../../CommonComponents/Header';
import LandingCostCard from './LandingCostCard';

const CostController = props => {
  const tokenRef = useRef(null);

  const { list, loading, footerLoading, search, loadMore } = usePaginatedList({
    fetchPage: (filters, page) =>
      fetchLandingCostList(tokenRef.current, filters, page),
  });

  useFocusEffect(
    useCallback(() => {
      (async () => {
        tokenRef.current = await AsyncStorage.getItem('access_token');
        search({});
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

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

  return (
    <View style={styles.container}>
      <HeaderComponent
        HomeScreenHeader={true}
        Title="Cost Controller"
        onPressRight2={handleLogout}
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
            <LandingCostCard
              item={item}
              onPress={() =>
                props.navigation.navigate('CreateLandingCost', {
                  editItem: item,
                })
              }
            />
          )}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            footerLoading ? (
              <ActivityIndicator
                size="small"
                color={primaryColor}
                style={styles.footer}
              />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                No landing cost records found.
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => props.navigation.navigate('CreateLandingCost')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', position: 'relative' },
  loader: { flex: 1, justifyContent: 'center' },
  listContent: { padding: 12 },
  footer: { marginVertical: 12 },
  empty: { flex: 1, alignItems: 'center', marginTop: 40 },
  emptyText: { color: lightGreyTextColor, fontFamily: fonts.Lato_Regular },
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
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 28,
    color: '#fff',
    lineHeight: 32,
    fontFamily: fonts.Lato_Regular,
  },
});

export default CostController;
