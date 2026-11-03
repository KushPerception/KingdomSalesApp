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
  const netAmt = parseFloat(item.NETAMT) || 0;
  const needsCeoReview = netAmt > 1000;
  const firstLevelDone = needsCeoReview && item.approved && item.ApprovedBy;

  return (
    <TouchableOpacity
      style={styles.poCard}
      onPress={() => onPress?.(item)}
      activeOpacity={0.85}
    >
      <View style={styles.poTopRow}>
        <View style={styles.poTopLeft}>
          <Text style={styles.poNo}>{item.PONO}</Text>
          {!!firstLevelDone && (
            <View style={styles.firstLevelBadge}>
              <Text style={styles.firstLevelBadgeText}>✓ 1st Level Approved</Text>
            </View>
          )}
        </View>
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
      {[
        { flag: item.approved, label: 'Approved By', name: item.ApprovedBy },
        { flag: item.approved_gm, label: 'Approved By GM', name: item.APPROVEDBYGM },
        { flag: item.approved_ceo, label: 'Approved By CEO', name: item.APPROVEDBYCEO },
      ] && (
        <View style={styles.approvedBox}>
          {[
            { flag: item.approved, label: 'Approved By', name: item.ApprovedBy },
            { flag: item.approved_gm, label: 'Approved By GM', name: item.APPROVEDBYGM },
            { flag: item.approved_ceo, label: 'Approved By CEO', name: item.APPROVEDBYCEO },
          ]
            
            .map(a => (
              <Text key={a.label} style={styles.approvedText}>
                {a.label}: <Text style={styles.approvedName}>{a.name}</Text>
              </Text>
            ))}
        </View>
      )}
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
  poTopLeft: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
  },
  firstLevelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FFC107',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  firstLevelBadgeText: {
    fontSize: 10,
    fontFamily: fonts.Lato_Bold,
    color: '#856404',
  },
  approvedBox: {
    marginTop: 6,
    backgroundColor: '#e6f4ea',
    borderLeftWidth: 3,
    borderLeftColor: '#006B38',
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  approvedText: {
    fontSize: 12,
    fontFamily: fonts.Lato_Regular,
    color: '#006B38',
  },
  approvedName: {
    fontFamily: fonts.Lato_Bold,
    color: '#006B38',
  },
  threeDot: {
    fontSize: 16,
    color: primaryColor,
    fontWeight: '700',
    lineHeight: 18,
  },
});

export default PurchaseOrderTab;
