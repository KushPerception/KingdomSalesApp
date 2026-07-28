import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  BlackColor,
  darkGreyTextColor,
  lightGreyTextColor,
  primaryColor,
  whiteColor,
} from '../../../../../utility/colors';
import { fonts } from '../../../../../utility/GlobalStyles';

// Bookkeeping columns the backend returns on every record/array-item that no
// view should ever display.
export const MR_HIDDEN_FIELDS = new Set([
  'is_editable',
  'Is Editable',
  'PRIORITY',
  'Priority',
  'SLNO',
  'SL No',
  'DTSL',
  'STATUS',
  'approved',
  'APPROVED',
  'rejected',
  'REJECTED',
  'cancel',
  'CANCEL',
  'cancelled',
  'CANCELLED',
]);

// Extra columns hidden only inside nested item/enquiry arrays (approval
// flags etc. that make sense on the parent record but not per-row).
export const ITEMS_STATUS_HIDDEN = new Set([
  'approved',
  'rejected',
  'status',
  'is_pending',
  'pending',
]);

export const humanizeKey = key =>
  key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

// Column keys safe to show for a row of a nested array field — drops nested
// objects/arrays and the hidden bookkeeping fields above.
export const visibleColumns = (row, extraHidden = ITEMS_STATUS_HIDDEN) =>
  Object.keys(row ?? {}).filter(
    key =>
      !Array.isArray(row[key]) &&
      typeof row[key] !== 'object' &&
      !MR_HIDDEN_FIELDS.has(key) &&
      !extraHidden.has(key),
  );

export const Row = ({ label, value }) =>
  value != null && value !== '' ? (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{String(value)}</Text>
    </View>
  ) : null;

export const EmptyState = ({ text }) => (
  <View style={styles.empty}>
    <Text style={styles.emptyText}>{text}</Text>
  </View>
);

// Horizontally-scrollable table for a nested array field (items, enquiries,
// etc.) — columns are derived from the data itself rather than hard-coded.
export const ArrayTable = ({ cols, rows }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    <View>
      <View style={styles.tableHeader}>
        {cols.map(c => (
          <Text key={c} style={[styles.hCol, styles.colHeader]}>
            {humanizeKey(c)}
          </Text>
        ))}
      </View>
      {rows.map((row, i) => (
        <View
          key={i}
          style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}
        >
          {cols.map(c => (
            <Text key={c} style={styles.hCol}>
              {row[c] != null ? String(row[c]) : '-'}
            </Text>
          ))}
        </View>
      ))}
    </View>
  </ScrollView>
);

// A record's array fields rendered as titled sections, each an <ArrayTable>.
// Shared by every view that shows a detail record with nested list fields.
export const ArraySections = ({ arrays }) =>
  arrays.map(([key, arr]) => {
    if (!arr.length) return null;
    const cols = visibleColumns(arr[0]);
    return (
      <View key={key}>
        <Text style={styles.sectionTitle}>{humanizeKey(key)}</Text>
        <View style={styles.card}>
          <ArrayTable cols={cols} rows={arr} />
        </View>
      </View>
    );
  });

export const styles = StyleSheet.create({
  content: { padding: 14, paddingBottom: 30 },
  card: {
    backgroundColor: whiteColor,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  paddedCard: {
    backgroundColor: whiteColor,
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 13,
    fontFamily: fonts.Lato_Bold,
    color: darkGreyTextColor,
    flex: 1,
  },
  value: {
    fontSize: 13,
    fontFamily: fonts.Lato_Regular,
    color: BlackColor,
    flex: 1.5,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: fonts.Lato_Bold,
    color: primaryColor,
    marginBottom: 8,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: lightGreyTextColor, fontFamily: fonts.Lato_Regular },
  arrow: { fontSize: 14, color: primaryColor, marginLeft: 8 },
  expandedContainer: { borderTopWidth: 1, borderTopColor: '#eee' },
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
    alignItems: 'flex-start',
  },
  tableRowAlt: { backgroundColor: '#f9f9f9' },
  hCol: {
    width: 110,
    fontSize: 12,
    color: BlackColor,
    fontFamily: fonts.Lato_Regular,
    paddingRight: 6,
  },
  hColLg: {
    width: 160,
    fontSize: 12,
    color: BlackColor,
    fontFamily: fonts.Lato_Regular,
    paddingRight: 6,
  },
  colHeader: { color: whiteColor, fontFamily: fonts.Lato_Bold, fontSize: 12 },
});
