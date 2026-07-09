import React, {useRef, useState} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import {BlackColor, primaryColor} from '../../../utility/colors';
import HeaderComponent from '../../CommonComponents/Header';

const MaterialRequest2 = props => {
  const {mrNo, mrDate, division, dept, plant, eqp, vehNo, vehDesc, priority, jobRefNo} =
    props.route?.params ?? {};

  // items array: [{ stockcode, stockname, unit, qty, remarks }]
  const [items, setItems] = useState([]);
  const onStockSelectedRef = useRef(null);

  const onStockSelected = stock => {
    console.log('onStockSelected:', JSON.stringify(stock));
    setItems(prev => [
      ...prev,
      {
        stockcode: stock?.STOCKCODE ?? stock?.StockCode ?? stock?.stockcode ?? '',
        stockname: stock?.STOCKNAME ?? stock?.StockName ?? stock?.stockname ?? '',
        unit: stock?.UNIT ?? stock?.Unit ?? stock?.unit ?? 'NOS',
        qty: '',
        remarks: '',
      },
    ]);
  };

  // keep ref in sync so MR3 always calls the latest version
  onStockSelectedRef.current = onStockSelected;

  const updateItem = (idx, field, value) => {
    setItems(prev =>
      prev.map((item, i) => (i === idx ? {...item, [field]: value} : item)),
    );
  };

  const removeItem = idx => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleNext = () => {
    if (items.length === 0) {
      Alert.alert('Validation', 'Please add at least one stock item.');
      return;
    }
    const invalidIdx = items.findIndex(i => !i.qty || i.qty === '');
    if (invalidIdx !== -1) {
      Alert.alert('Validation', `Quantity is required for item ${invalidIdx + 1}.`);
      return;
    }
    const payload = {
      mrno: mrNo,
      division,
      dept,
      plant,
      eqpart: eqp,
      vehno: vehNo ?? '',
      jobrefno: jobRefNo ?? '',
      priority: priority ?? '',
      userremarks: vehDesc ?? '',
      items: items.map(i => ({
        stockcode: i.stockcode,
        stockname: i.stockname,
        unit: i.unit,
        qty: Number(i.qty),
        remarks: i.remarks ?? '',
      })),
    };
    console.log('MaterialRequest2 NEXT payload:', JSON.stringify(payload, null, 2));
    // TODO: navigate to submit screen or call API
  };

  return (
    <View style={styles.container}>
      <HeaderComponent
        BackTitle={true}
        Title="New Material Request"
        onBackPress={() => props.navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>

        {items.length === 0 ? (
          <Text style={styles.emptyText}>Tap + to add stock items</Text>
        ) : (
          items.map((item, idx) => (
            <View key={idx} style={styles.card}>
              {/* Stock Info */}
              <View style={styles.cardHeader}>
                <View style={{flex: 1}}>
                  <Text style={styles.cardCode}>{item.stockcode || '—'}</Text>
                  <Text style={styles.cardName}>{item.stockname || '—'}</Text>
                </View>
                <TouchableOpacity onPress={() => removeItem(idx)} style={styles.removeBtn}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Quantity */}
              <Text style={styles.fieldLabel}>Quantity *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Quantity"
                placeholderTextColor="#aaa"
                keyboardType="numeric"
                value={item.qty}
                onChangeText={v => updateItem(idx, 'qty', v)}
              />

              {/* Remark */}
              <Text style={styles.fieldLabel}>Remark</Text>
              <TextInput
                style={[styles.input, styles.remarkInput]}
                placeholder="Enter Remark"
                placeholderTextColor="#aaa"
                value={item.remarks}
                onChangeText={v => updateItem(idx, 'remarks', v)}
                multiline
              />
            </View>
          ))
        )}

        {items.length > 0 && (
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>NEXT</Text>
          </TouchableOpacity>
        )}

      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          props.navigation.navigate('MaterialRequest3', {
            onStockSelected: onStockSelectedRef,
          })
        }>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  content: {padding: 16, paddingBottom: 100},
  emptyText: {textAlign: 'center', marginTop: 60, color: '#aaa', fontSize: 14},
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 14,
    elevation: 2,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: primaryColor,
  },
  cardHeader: {flexDirection: 'row', alignItems: 'flex-start'},
  cardCode: {fontSize: 14, fontWeight: '700', color: primaryColor},
  cardName: {fontSize: 13, color: BlackColor, marginTop: 2},
  removeBtn: {padding: 4},
  removeBtnText: {fontSize: 16, color: '#e74c3c'},
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
  remarkInput: {height: 70, textAlignVertical: 'top', paddingTop: 8},
  nextBtn: {
    marginTop: 8,
    backgroundColor: primaryColor,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  nextBtnText: {color: 'white', fontWeight: '700', fontSize: 15},
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {fontSize: 28, color: 'white', lineHeight: 32},
});

export default MaterialRequest2;
