import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {BlackColor, darkGreyTextColor, lightGreyTextColor, primaryColor, whiteColor} from '../../../utility/colors';
import {fonts} from '../../../utility/GlobalStyles';

const LandingCostCard = ({item, onPress}) => {
  if (!item) return null;
  const lcDate = item.LCDATE ? item.LCDATE.split('T')[0] : '-';
  const isPosted = item.POSTED === '1' || item.POSTED === 1;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.topRow}>
        <Text style={styles.lcNo}>{item.LCNO}</Text>
        <View style={[styles.badge, isPosted ? styles.badgePosted : styles.badgePending]}>
          <Text style={styles.badgeText}>{isPosted ? 'Posted' : 'Pending'}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Date: <Text style={styles.value}>{lcDate}</Text></Text>
        <Text style={styles.label}>By: <Text style={styles.value}>{item.ADDEDUSER ?? '-'}</Text></Text>
      </View>

      {!!item.SUPNAME && (
        <Text style={styles.label}>Supplier: <Text style={styles.value}>{item.SUPNAME}</Text></Text>
      )}
      {!!item.PONO && (
        <Text style={styles.label}>PO No: <Text style={styles.value}>{item.PONO}</Text></Text>
      )}

      <View style={styles.row}>
        <Text style={styles.label}>Cost: <Text style={styles.value}>{item.COST ?? '-'}</Text></Text>
        <Text style={styles.label}>VAT: <Text style={styles.value}>{item.VAT ?? '-'}</Text></Text>
      </View>

      {!!item.REMARKS && <Text style={styles.remarks}>{item.REMARKS}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: whiteColor,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lcNo: {fontSize: 15, fontFamily: fonts.Lato_Bold, color: primaryColor},
  badge: {paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12},
  badgePosted: {backgroundColor: '#e6f4ea'},
  badgePending: {backgroundColor: '#fff3e0'},
  badgeText: {fontSize: 11, fontFamily: fonts.Lato_Bold, color: darkGreyTextColor},
  row: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4},
  label: {fontSize: 12, fontFamily: fonts.Lato_Regular, color: darkGreyTextColor, marginBottom: 2},
  value: {fontFamily: fonts.Lato_Bold, color: BlackColor},
  remarks: {fontSize: 11, fontFamily: fonts.Lato_Regular, color: lightGreyTextColor, marginTop: 4},
});

export default LandingCostCard;
