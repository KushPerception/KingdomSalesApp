import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { modalBackgroundColor, primaryColor } from '../../../utility/colors';

const getStatusColor = status => {
  switch (status?.toUpperCase()) {
    case 'APPROVED':
      return '#2e7d32';
    case 'PENDING':
      return '#e65100';
    case 'REJECTED':
      return '#c62828';
    case 'CANCEL':
      return '#757575';
    case 'CLOSED':
      return '#555';
    default:
      return '#1565c0';
  }
};

const MaterialRequestTab = ({ item, onPress }) => (
  <TouchableOpacity
    style={styles.itemContainer}
    activeOpacity={0.6}
    onPress={() => onPress(item)}
  >
    <View style={styles.itemTitleRow}>
      <Text style={styles.itemTitle}>{item?.MRNO ?? '-'}</Text>
      <View style={styles.badgeRow}>
        <Text
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item?.MRSTATUS) },
          ]}
        >
          {item?.MRSTATUS ?? 'PENDING'}
        </Text>
        {item?.is_editable && <Text style={styles.editBadge}>Edit</Text>}
      </View>
    </View>
    <Text style={styles.itemText}>Date: {item?.MRDATE ?? '-'}</Text>
    <Text style={styles.itemText}>Division: {item?.DIVISION ?? '-'}</Text>
    <Text style={styles.itemText}>Dept: {item?.DEPT ?? '-'}</Text>
    <Text style={styles.itemText}>Plant: {item?.PLANT ?? '-'}</Text>
    <Text style={styles.itemText}>Eq/Part: {item?.EQPART ?? '-'}</Text>
    <Text style={styles.itemText}>Veh No: {item?.VEHNO ?? '-'}</Text>
    <Text style={styles.itemText}>Priority: {item?.PRIORITY ?? '-'}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  itemContainer: {
    borderBottomWidth: 0.5,
    borderBottomColor: modalBackgroundColor,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  itemTitle: { fontSize: 15, fontWeight: 'bold' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusBadge: {
    fontSize: 11,
    color: 'white',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  editBadge: {
    fontSize: 11,
    color: primaryColor,
    borderWidth: 1,
    borderColor: primaryColor,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  itemText: { fontSize: 13, paddingTop: 2, color: '#444' },
});

export default MaterialRequestTab;
