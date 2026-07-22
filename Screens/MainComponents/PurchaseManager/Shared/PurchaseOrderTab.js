import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  BlackColor,
  darkGreyTextColor,
  lightGreyTextColor,
  primaryColor,
  whiteColor,
} from '../../../../utility/colors';
import { fonts } from '../../../../utility/GlobalStyles';

const PurchaseOrderTab = ({ item, onPressMenu, onPress }) => {
  if (!item) return null;
  const poDate = item.PODATE ? item.PODATE.split(' ')[0] : '-';

  return (
    <TouchableOpacity
      style={styles.poCard}
      onPress={() => onPress?.(item)}
      activeOpacity={0.85}
    >
      <View style={styles.poTopRow}>
        <Text style={styles.poNo}>{item.PONO}</Text>
        <TouchableOpacity
          onPress={() => onPressMenu(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.threeDot}>⋮</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.poCardRow}>
        <Text style={styles.poLabel}>
          Date: <Text style={styles.poValue}>{poDate}</Text>
        </Text>
        <Text style={[styles.poLabel, { marginLeft: 12 }]}>
          Dept: <Text style={styles.poValue}>{item.DEPARTMENT}</Text>
        </Text>
      </View>
      <Text style={styles.poLabel}>
        Supplier: <Text style={styles.poValue}>{item.SUPNAME?.trim()}</Text>
      </Text>
      <View style={styles.poCardRow}>
        <Text style={styles.poLabel}>
          Amount:{' '}
          <Text style={styles.poValue}>
            {item.NETAMT} {item.CURRENCY}
          </Text>
        </Text>
        <Text style={[styles.poLabel, { marginLeft: 12 }]}>
          By: <Text style={styles.poValue}>{item.ADDEDUSER}</Text>
        </Text>
      </View>
      {!!item.REMARKS && <Text style={styles.poRemarks}>{item.REMARKS}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  poCard: {
    backgroundColor: whiteColor,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    padding: 14,
  },
  poTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  poCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  poNo: {
    fontSize: 15,
    fontFamily: fonts.Lato_Bold,
    color: primaryColor,
  },
  poLabel: {
    fontSize: 12,
    fontFamily: fonts.Lato_Regular,
    color: darkGreyTextColor,
    marginBottom: 2,
  },
  poValue: {
    fontFamily: fonts.Lato_Bold,
    color: BlackColor,
  },
  poRemarks: {
    fontSize: 11,
    fontFamily: fonts.Lato_Regular,
    color: lightGreyTextColor,
    marginTop: 4,
  },
  threeDot: {
    fontSize: 16,
    color: primaryColor,
    fontWeight: '700',
    lineHeight: 18,
  },
});

export default PurchaseOrderTab;
