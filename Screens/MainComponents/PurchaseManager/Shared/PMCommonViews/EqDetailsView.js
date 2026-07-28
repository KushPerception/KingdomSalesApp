import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  darkGreyTextColor,
  lightGreyTextColor,
  primaryColor,
} from '../../../../../utility/colors';
import { fonts } from '../../../../../utility/GlobalStyles';
import { EmptyState, styles as sharedStyles } from './shared';

const EQ_COLUMNS = [
  { label: 'EQ No', get: eq => eq.EQNO ?? eq.eq_no ?? '-' },
  { label: 'EQ Date', get: eq => eq.ENQDATE ?? eq.enq_date ?? '-' },
  { label: 'Supplier Name', get: eq => eq.SUPNAME ?? eq.supplier ?? '-' },
  {
    label: 'Added By & Time',
    wide: true,
    get: eq => [eq.added_by, eq.added_time].filter(Boolean).join(' ') || '-',
  },
  { label: 'Enquiry Type', get: eq => eq.ENQTYPE ?? eq.enquiry_type ?? '-' },
  { label: 'Amount', get: eq => eq.AMOUNT ?? eq.amount ?? '-' },
];

const EqDetailsView = ({ data }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!data?.length) return <EmptyState text="No EQ details found." />;

  const renderEqItem = ({ item, index }) => {
    const isExpanded = expandedIndex === index;
    return (
      <View style={sharedStyles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => setExpandedIndex(isExpanded ? null : index)}
          activeOpacity={0.7}
        >
          <View style={styles.headerText}>
            <Text style={styles.mrNo}>{item.mrno ?? item.mr_no ?? '-'}</Text>
            <Text style={styles.subText}>{item.stock_code ?? ''}</Text>
            <Text style={styles.subTextLight}>{item.stock_name ?? ''}</Text>
          </View>
          <Text style={sharedStyles.arrow}>{isExpanded ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {isExpanded && item.enquiries?.length > 0 && (
          <View style={sharedStyles.expandedContainer}>
            <ArrayTable rows={item.enquiries} />
          </View>
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      keyExtractor={(_, i) => String(i)}
      renderItem={renderEqItem}
      contentContainerStyle={sharedStyles.content}
    />
  );
};

// Fixed-column table for an EQ's enquiries — columns come from EQ_COLUMNS
// rather than the data itself, since the field names vary by source.
const ArrayTable = ({ rows }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
  <View>
    <View style={sharedStyles.tableHeader}>
      {EQ_COLUMNS.map(c => (
        <Text
          key={c.label}
          style={[c.wide ? sharedStyles.hColLg : sharedStyles.hCol, sharedStyles.colHeader]}
        >
          {c.label}
        </Text>
      ))}
    </View>
    {rows.map((eq, j) => (
      <View key={j} style={[sharedStyles.tableRow, j % 2 === 0 && sharedStyles.tableRowAlt]}>
        {EQ_COLUMNS.map(c => (
          <Text key={c.label} style={c.wide ? sharedStyles.hColLg : sharedStyles.hCol}>
            {c.get(eq)}
          </Text>
        ))}
      </View>
    ))}
  </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  headerText: { flex: 1 },
  mrNo: {
    fontSize: 15,
    fontFamily: fonts.Lato_Bold,
    color: primaryColor,
    marginBottom: 2,
  },
  subText: {
    fontSize: 13,
    fontFamily: fonts.Lato_Regular,
    color: darkGreyTextColor,
  },
  subTextLight: {
    fontSize: 13,
    fontFamily: fonts.Lato_Regular,
    color: lightGreyTextColor,
    marginTop: 2,
  },
});

export default EqDetailsView;
