import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import HeaderComponent from '../../CommonComponents/Header';
import PurchaseOrderList from './PurchaseOrderList';

const PurchaseOrderScreen = props => {
  return (
    <View style={styles.container}>
      <HeaderComponent
        HomeScreenHeader={true}
        Title="Purchase Orders"
        onPressRight2={async () => {
          await AsyncStorage.clear();
          props.navigation.replace('Login');
        }}
      />
      <PurchaseOrderList navigation={props.navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
});

export default PurchaseOrderScreen;
