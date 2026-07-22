import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import HeaderComponent from '../../CommonComponents/Header';
import PurchaseOrderList from './PurchaseOrderList';

const PurchaseOrderScreen = props => {
  const handleLogout = () => {
    Alert.alert('Hold on!', 'Are you sure you want to Logout from App?', [
      {
        text: 'NO',
        style: 'cancel',
        onPress: () => console.log('[CostController] handleLogout: cancelled'),
      },
      {
        text: 'YES',
        onPress: async () => {
          console.log(
            '[CostController] handleLogout: clearing storage and navigating to Login',
          );
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
        Title="Purchase Orders"
        onPressRight2={handleLogout}
      />
      <PurchaseOrderList navigation={props.navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
});

export default PurchaseOrderScreen;
