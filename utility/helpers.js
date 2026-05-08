import AsyncStorage from '@react-native-async-storage/async-storage';

export const clearAllData = async () => {
  await AsyncStorage.getAllKeys()
    .then(keys => AsyncStorage.multiRemove(keys))
    .then(() => console.log('Async Data removed successfully'));
};

export const formatPrice = price => {
  return 'BD ' + Number(price ? price : 0).toFixed(3);
};

export const validatePhone = phone => {
  if (!phone || phone === '0') {
    return false;
  }
  if (phone.length < 8) {
    return false;
  }
  return true;
};
