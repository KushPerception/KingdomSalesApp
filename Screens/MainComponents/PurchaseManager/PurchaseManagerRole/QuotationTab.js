import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  BlackColor,
  darkGreyTextColor,
  lightGreyTextColor,
  primaryColor,
  whiteColor,
} from '../../../../utility/colors';
import { fonts } from '../../../../utility/GlobalStyles';

const QuotationTab = ({
  item,
  index,
  expandedIndex,
  onToggle,
  onPressMenu,
}) => {
  const isExpanded = expandedIndex === index;

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => onToggle(index)}
        activeOpacity={0.7}
      >
        <View style={styles.cardInfo}>
          <Text style={styles.mrNo}>{item.mr_no}</Text>
          <Text style={styles.stockCode}>{item.stock_code}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
        <Text style={styles.arrow}>{isExpanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.enquiriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View style={styles.tableHeader}>
                <Text style={[styles.hCol, styles.colHeader]}>EQ No</Text>
                <Text style={[styles.hCol, styles.colHeader]}>Supplier</Text>
                <Text style={[styles.hCol, styles.colHeader]}>Qty</Text>
                <Text style={[styles.hCol, styles.colHeader]}>Rate</Text>
                <Text style={[styles.hCol, styles.colHeader]}>Amount</Text>
                <Text style={[styles.hCol, styles.colHeader]}>Status</Text>
              </View>
              {item.enquiries?.map((eq, i) => (
                <View
                  key={i}
                  style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}
                >
                  <Text style={styles.hCol}>{eq.eq_no}</Text>
                  <Text style={styles.hCol}>{eq.supplier}</Text>
                  <Text style={styles.hCol}>{eq.qty ?? '-'}</Text>
                  <Text style={styles.hCol}>{eq.rate ?? '-'}</Text>
                  <Text style={styles.hCol}>{eq.amount ?? '-'}</Text>
                  <View style={[styles.hCol, styles.statusCell]}>
                    {(() => {
                      const s =
                        eq.status ??
                        (eq.approved
                          ? 'approved'
                          : eq.rejected
                          ? 'rejected'
                          : 'pending');
                      return (
                        <Text
                          style={[
                            styles.statusText,
                            s === 'approved' && styles.approved,
                            s === 'rejected' && styles.rejected,
                          ]}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </Text>
                      );
                    })()}
                    <TouchableOpacity
                      onPress={() => onPressMenu(eq)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.threeDot}>⋮</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  cardInfo: { flex: 1 },
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
  arrow: { fontSize: 14, color: primaryColor, marginLeft: 8 },
  enquiriesContainer: { borderTopWidth: 1, borderTopColor: '#eee' },
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
  tableRowAlt: { backgroundColor: '#f9f9f9' },
  col: {
    flex: 1,
    fontSize: 12,
    color: BlackColor,
    fontFamily: fonts.Lato_Regular,
  },
  hCol: {
    width: 110,
    fontSize: 12,
    color: BlackColor,
    fontFamily: fonts.Lato_Regular,
    paddingRight: 6,
  },
  colHeader: { color: whiteColor, fontFamily: fonts.Lato_Bold, fontSize: 12 },
  statusCell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusText: {
    fontSize: 12,
    fontFamily: fonts.Lato_Regular,
    color: BlackColor,
  },
  threeDot: {
    fontSize: 16,
    color: primaryColor,
    fontWeight: '700',
    lineHeight: 18,
  },
  approved: { color: '#006B38' },
  rejected: { color: '#cc0000' },
});

export default QuotationTab;
