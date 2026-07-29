import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  getMaterialRequestAttachments,
  getMaterialRequestDetail,
  submitMaterialRequest,
  updateMaterialRequest,
} from '../../../utility/ApiHelpers/MaterialRequestApi';
import { primaryColor } from '../../../utility/colors';
import FabButton from '../../CommonComponents/FabButton';
import HeaderComponent from '../../CommonComponents/Header';
import LoaderComponent from '../../CommonComponents/LoaderComponent';
import MaterialRequestItemCard from './Components/MaterialRequestItemCard';

const MaterialRequestItems = props => {
  const {
    mrNo,
    mrDate,
    division,
    dept,
    plant,
    eqp,
    vehNo,
    vehDesc,
    priority,
    jobRefNo,
    isEditMode,
  } = props.route?.params ?? {};

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(!!isEditMode);
  const [canEdit, setCanEdit] = useState(!isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const onStockSelectedRef = useRef(null);

  useEffect(() => {
    if (isEditMode) loadExistingItems();
  }, []);

  const loadExistingItems = async () => {
    try {
      const t = await AsyncStorage.getItem('access_token');
      const res = await getMaterialRequestDetail(t, mrNo);
      const d = res?.data ?? {};
      const raw = d?.items ?? d?.ITEMS ?? res?.items ?? res?.ITEMS ?? [];
      const mapped = raw.map(i => ({
        stockcode: i?.STOCKCODE ?? i?.stockcode ?? '',
        stockname: i?.STOCKNAME ?? i?.stockname ?? '',
        unit: i?.UNIT ?? i?.unit ?? 'NOS',
        qty: String(i?.QTY ?? i?.qty ?? ''),
        remarks: i?.REMARKS ?? i?.remarks ?? '',
        slno: i?.SLNO ?? i?.slno ?? null,
      }));
      setItems(mapped);
      setCanEdit(d?.is_editable ?? d?.IS_EDITABLE ?? true);
    } catch (e) {
      Alert.alert('Error', 'Failed to load existing items.');
    } finally {
      setLoading(false);
    }
  };

  const blockEdit = () => {
    Alert.alert(
      'Editing Not Allowed',
      'The MR request forwarded to the Purchase Department.',
    );
  };

  const onStockSelected = stock => {
    const stockcode =
      stock?.STOCKCODE ?? stock?.StockCode ?? stock?.stockcode ?? '';
    setItems(prev => [
      ...prev,
      {
        stockcode,
        stockname:
          stock?.STOCKNAME ?? stock?.StockName ?? stock?.stockname ?? '',
        unit: stock?.UNIT ?? stock?.Unit ?? stock?.unit ?? 'NOS',
        qty: '',
        remarks: '',
        isNewStock: stockcode?.toUpperCase() === 'NEW',
      },
    ]);
  };

  // keep ref in sync so MR3 always calls the latest version
  onStockSelectedRef.current = onStockSelected;

  const updateItem = (idx, field, value) => {
    setItems(prev =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    );
  };

  const removeItem = idx => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const buildPayload = () => ({
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
  });

  const validateItems = () => {
    if (items.length === 0) {
      Alert.alert('Validation', 'Please add at least one stock item.');
      return false;
    }
    const invalidIdx = items.findIndex(i => !i.qty || i.qty === '');
    if (invalidIdx !== -1) {
      Alert.alert(
        'Validation',
        `Quantity is required for item ${invalidIdx + 1}.`,
      );
      return false;
    }
    const remarkIdx = items.findIndex(
      i => i.isNewStock && (!i.remarks || i.remarks.trim() === ''),
    );
    if (remarkIdx !== -1) {
      Alert.alert(
        'Validation',
        `Remark is required for new stock item ${remarkIdx + 1}.`,
      );
      return false;
    }
    return true;
  };

  const submitDirectly = async payload => {
    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (isEditMode) {
        await updateMaterialRequest(token, mrNo, payload);
      } else {
        await submitMaterialRequest(token, payload);
      }
      Alert.alert(
        'Success',
        isEditMode
          ? 'Material request updated successfully.'
          : 'Material request submitted successfully.',
        [
          {
            text: 'OK',
            onPress: () => props.navigation.navigate('MaterialRequestList'),
          },
        ],
      );
    } catch (e) {
      if (
        isEditMode &&
        /not\s*allow|editable|forward/i.test(e?.message ?? '')
      ) {
        Alert.alert(
          'Editing Not Allowed',
          'The MR request forwarded to the Purchase Department.',
        );
      } else {
        Alert.alert(
          'Error',
          e.message ?? 'Something went wrong. Please try again.',
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const goToAttachments = payload =>
    props.navigation.navigate('MaterialRequestAttachment', {
      mrNo,
      payload,
      isEdit: !!isEditMode,
    });

  const showAttachmentChoice = payload => {
    Alert.alert(
      'Add Attachments?',
      'Attachments are optional. You can add attachments now or submit the material request directly.',
      [
        {
          text: 'Add Attachments',
          onPress: () => goToAttachments(payload),
        },
        {
          text: 'Submit Material Request',
          onPress: () => submitDirectly(payload),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const handleNext = async () => {
    if (!validateItems()) return;
    const payload = buildPayload();

    if (isEditMode) {
      setSubmitting(true);
      try {
        const token = await AsyncStorage.getItem('access_token');
        const res = await getMaterialRequestAttachments(token, mrNo);
        const hasAttachments = (res?.data ?? []).length > 0;
        setSubmitting(false);
        if (hasAttachments) {
          goToAttachments(payload);
          return;
        }
      } catch (e) {
        setSubmitting(false);
      }
    }

    showAttachmentChoice(payload);
  };

  return (
    <View style={styles.container}>
      <HeaderComponent
        BackTitle={true}
        Title={isEditMode ? 'Edit Material Request' : 'New Material Request'}
        onBackPress={() => props.navigation.goBack()}
      />

      {loading ? (
        <LoaderComponent />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {!canEdit && (
            <View style={styles.lockedBanner}>
              <Text style={styles.lockedBannerText}>
                Editing is not allowed. The MR request forwarded to the Purchase
                Department.
              </Text>
            </View>
          )}

          {items.length === 0 ? (
            <Text style={styles.emptyText}>Tap + to add stock items</Text>
          ) : (
            items.map((item, idx) => (
              <MaterialRequestItemCard
                key={idx}
                item={item}
                canEdit={canEdit}
                onChangeQty={v => updateItem(idx, 'qty', v)}
                onChangeRemarks={v => updateItem(idx, 'remarks', v)}
                onRemove={() => removeItem(idx)}
              />
            ))
          )}

          {items.length > 0 && (
            <TouchableOpacity
              style={[styles.nextBtn, submitting && styles.nextBtnDisabled]}
              onPress={handleNext}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.nextBtnText}>NEXT</Text>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      <FabButton
        onPress={() =>
          canEdit
            ? props.navigation.navigate('MaterialRequestStockPicker', {
                onStockSelected: onStockSelectedRef,
              })
            : blockEdit()
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 100 },
  emptyText: {
    textAlign: 'center',
    marginTop: 60,
    color: '#aaa',
    fontSize: 14,
  },
  lockedBanner: {
    backgroundColor: '#fdecea',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e74c3c',
    padding: 12,
    marginBottom: 14,
  },
  lockedBannerText: { color: '#c62828', fontSize: 13, fontWeight: '600' },
  nextBtn: {
    marginTop: 8,
    backgroundColor: primaryColor,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  nextBtnDisabled: { opacity: 0.6 },
  nextBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
});

export default MaterialRequestItems;
