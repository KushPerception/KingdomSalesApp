import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { BlackColor, primaryColor } from '../../../../utility/colors';

const MaterialRequestItemCard = ({
  item,
  canEdit,
  onChangeQty,
  onChangeRemarks,
  onRemove,
}) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardCode}>{item.stockcode || '—'}</Text>
        <Text style={styles.cardName}>{item.stockname || '—'}</Text>
      </View>
      {canEdit && (
        <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
          <Text style={styles.removeBtnText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>

    <Text style={styles.fieldLabel}>Quantity *</Text>
    <TextInput
      style={styles.input}
      placeholder="Enter Quantity"
      placeholderTextColor="#aaa"
      keyboardType="numeric"
      value={item.qty}
      onChangeText={onChangeQty}
    />

    <Text style={styles.fieldLabel}>Remark{item.isNewStock ? ' *' : ''}</Text>
    <TextInput
      style={[styles.input, styles.remarkInput]}
      placeholder="Enter Remark"
      placeholderTextColor="#aaa"
      value={item.remarks}
      onChangeText={onChangeRemarks}
      multiline
    />
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 14,
    elevation: 2,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: primaryColor,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  cardCode: { fontSize: 14, fontWeight: '700', color: primaryColor },
  cardName: { fontSize: 13, color: BlackColor, marginTop: 2 },
  removeBtn: { padding: 4 },
  removeBtnText: { fontSize: 16, color: '#e74c3c' },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: BlackColor,
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    color: BlackColor,
    fontSize: 13,
  },
  remarkInput: { height: 70, textAlignVertical: 'top', paddingTop: 8 },
});

export default MaterialRequestItemCard;
