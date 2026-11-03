import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {useFocusEffect} from '@react-navigation/native';
import {mainUrl} from '../../../utility/ApiHelpers/StagingApis';
import {BlackColor, primaryColor} from '../../../utility/colors';
import HeaderComponent from '../../CommonComponents/Header';
import LoaderComponent from '../../CommonComponents/LoaderComponent';

// ─── Calendar Icon ───────────────────────────────────────────────────────────
const CalendarIcon = () => (
  <View style={calStyles.wrap}>
    <View style={calStyles.header}>
      <View style={calStyles.ring} />
      <View style={calStyles.ring} />
    </View>
    <View style={calStyles.body}>
      <View style={calStyles.row}>
        {[0,1,2].map(i => <View key={i} style={calStyles.cell} />)}
      </View>
      <View style={calStyles.row}>
        {[0,1,2].map(i => <View key={i} style={calStyles.cell} />)}
      </View>
    </View>
  </View>
);

const calStyles = StyleSheet.create({
  wrap: {width: 20, height: 20, borderWidth: 1.5, borderColor: 'gray', borderRadius: 3, overflow: 'hidden'},
  header: {backgroundColor: primaryColor, height: 6, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'},
  ring: {width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'white'},
  body: {flex: 1, padding: 2, justifyContent: 'space-between'},
  row: {flexDirection: 'row', justifyContent: 'space-between'},
  cell: {width: 4, height: 4, borderRadius: 1, backgroundColor: '#ccc'},
});

// ─── Reusable dropdown field (same as MR1) ────────────────────────────────────
const DropdownField = ({label, value, onPress, disabled}) => (
  <>
    <Text style={styles.label}>{label}</Text>
    <TouchableOpacity
      style={[styles.dropdown, disabled && styles.dropdownDisabled]}
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.7}>
      <Text style={[styles.dropdownText, !value && styles.placeholder]}>
        {value || `Select ${label}`}
      </Text>
      <Text style={styles.arrow}>▾</Text>
    </TouchableOpacity>
  </>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const CreateLandingCost = props => {
  const editItem = props.route?.params?.editItem ?? null;
  const isEdit = !!editItem;

  console.log(`[CreateLandingCost] mounted | isEdit=${isEdit} | LCNO=${editItem?.lcno ?? editItem?.LCNO ?? 'N/A'}`);

  // ── form state ──
  const [lcno, setLcno] = useState('');
  const [slno, setSlno] = useState(null);
  const [lcDate, setLcDate] = useState('');
  const [supRefNo, setSupRefNo] = useState('');
  const [supplierCode, setSupplierCode] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [linkedPO, setLinkedPO] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [cost, setCost] = useState('');
  const [vatPct, setVatPct] = useState('10');
  const [remarks, setRemarks] = useState('');
  const [posted, setPosted] = useState(false);

  // ── data lists ──
  const [categories, setCategories] = useState([]);
  const [poList, setPoList] = useState([]);

  // ── UI state ──
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [poLoading, setPoLoading] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'category' | 'po'
  const [token, setToken] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const isReadOnly = posted;

  // ── mount ──
  useEffect(() => {
    loadInitialData();
  }, []);

  const vatAmount = (() => {
    const c = parseFloat(cost);
    const p = parseFloat(vatPct);
    if (!isNaN(c) && c >= 0 && !isNaN(p) && p >= 0) return (c * p / 100).toFixed(2);
    return '0.00';
  })();

  const loadInitialData = async () => {
    console.log('[CreateLandingCost] loadInitialData — mode:', isEdit ? `EDIT (${editItem?.lcno ?? editItem?.LCNO})` : 'NEW');
    try {
      const t = await AsyncStorage.getItem('access_token');
      setToken(t);

      // fetch categories always; generate only for new
      const [catRes, genRes] = await Promise.all([
        fetchCategories(t),
        isEdit ? null : generateLandingCost(t),
      ]);

      if (isEdit) {
        prefillForm(editItem);
        // load POs for existing supplier
        const supCode = editItem.supcode ?? editItem.SUPCODE;
        if (supCode) fetchPOs(t, supCode);
      }

      console.log('[CreateLandingCost] loadInitialData complete');
    } catch (e) {
      console.error('[CreateLandingCost] loadInitialData ERROR:', e?.message);
      Alert.alert('Error', 'Failed to load form data.');
    } finally {
      setLoading(false);
    }
  };

  const generateLandingCost = async t => {
    const url = `${mainUrl}api/landing-cost/generate`;
    console.log('[CreateLandingCost] generateLandingCost: url =', url);
    const res = await fetch(url, {
      method: 'GET',
      headers: {Accept: 'application/json', Authorization: `Bearer ${t}`},
    });
    console.log('[CreateLandingCost] generateLandingCost: status =', res.status);
    const json = await res.json();
    console.log('[CreateLandingCost] generateLandingCost: response =', JSON.stringify(json, null, 2));
    if (!json.success) throw new Error(json.message ?? 'Generate failed');
    setLcno(json.data.lcno ?? json.data.LCNO);
    setSlno(json.data.slno ?? json.data.SLNO);
    setLcDate(json.data.lcdate ?? json.data.LCDATE ?? '');
    console.log('[CreateLandingCost] generateLandingCost: LCNO =', json.data.LCNO, '| SLNO =', json.data.SLNO);
  };

  const fetchCategories = async t => {
    const url = `${mainUrl}api/landing-cost/cost-categories`;
    console.log('[CreateLandingCost] fetchCategories: url =', url);
    const res = await fetch(url, {
      method: 'GET',
      headers: {Accept: 'application/json', Authorization: `Bearer ${t}`},
    });
    console.log('[CreateLandingCost] fetchCategories: status =', res.status);
    const json = await res.json();
    console.log('[CreateLandingCost] fetchCategories: response =', JSON.stringify(json, null, 2));
    const cats = json.data ?? json ?? [];
    const list = Array.isArray(cats) ? cats : [];
    setCategories(list);
    console.log('[CreateLandingCost] fetchCategories: count =', list.length);
  };

  const fetchPOs = async (t, supCode) => {
    console.log('[CreateLandingCost] fetchPOs: supCode =', supCode);
    setPoLoading(true);
    setPoList([]);
    try {
      const url = `${mainUrl}api/landing-cost/purchase-orders?supcode=${encodeURIComponent(supCode)}`;
      console.log('[CreateLandingCost] fetchPOs: url =', url);
      const res = await fetch(url, {
        method: 'GET',
        headers: {Accept: 'application/json', Authorization: `Bearer ${t}`},
      });
      console.log('[CreateLandingCost] fetchPOs: status =', res.status);
      const json = await res.json();
      console.log('[CreateLandingCost] fetchPOs: response =', JSON.stringify(json, null, 2));
      const pos = json.data ?? [];
      setPoList(Array.isArray(pos) ? pos : []);
      console.log('[CreateLandingCost] fetchPOs: count =', pos.length);
    } catch (e) {
      console.error('[CreateLandingCost] fetchPOs ERROR:', e?.message);
    } finally {
      setPoLoading(false);
    }
  };

  const prefillForm = item => {
    console.log('[CreateLandingCost] prefillForm:', JSON.stringify(item, null, 2));
    setLcno(item.lcno ?? item.LCNO ?? '');
    setSlno(item.slno ?? item.SLNO ?? null);
    setLcDate(item.lcdate ?? item.LCDATE ?? '');
    setSupRefNo(item.suprefno ?? item.SUPREFNO ?? '');
    setSupplierCode(item.supcode ?? item.SUPCODE ?? '');
    setSupplierName(item.supname ?? item.SUPNAME ?? '');
    setLinkedPO(item.pono ?? item.PONO ?? '');
    setCategoryId(item.category_id ?? item.CATEGORY_ID ?? item.SLNO ?? '');
    setCategoryName(item.category_name ?? item.CATEGORY_NAME ?? '');
    const rawCost = item.cost ?? item.COST;
    setCost(rawCost != null ? String(rawCost) : '');
    const rawVat = item.VATPER ?? item.vatper ?? item.VAT_PCT;
    setVatPct(rawVat != null ? String(rawVat) : '10');
    setRemarks(item.remarks ?? item.REMARKS ?? '');
    const isPosted = item.posted === '1' || item.posted === 1 || item.POSTED === '1' || item.POSTED === 1 || item.POSTED === true;
    setPosted(isPosted);
    console.log('[CreateLandingCost] prefillForm: posted =', isPosted);
  };

  // called back from SupplierPickerScreen
  const handleSupplierSelected = useCallback(item => {
    const code = item.SupplierId ?? item.SUPCODE ?? item.supcode ?? '';
    const name = item.Name ?? item.SUPNAME ?? item.supname ?? '';
    console.log('[CreateLandingCost] handleSupplierSelected: code =', code, '| name =', name);
    setSupplierCode(code);
    setSupplierName(name);
    setLinkedPO('');
    setPoList([]);
    fetchPOs(token, code);
  }, [token]);

  const handleBack = () => {
    if (isEdit) {
      // edit mode — just go back, no cancel-draft needed
      console.log('[CreateLandingCost] handleBack: edit mode, going back directly');
      props.navigation.goBack();
      return;
    }
    // new mode — confirm then cancel draft
    Alert.alert(
      'Discard Draft',
      'Are you sure you want to cancel this draft?',
      [
        {text: 'No', style: 'cancel', onPress: () => console.log('[CreateLandingCost] handleBack: discard cancelled')},
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            console.log('[CreateLandingCost] handleBack: cancelling draft | LCNO =', lcno);
            try {
              const t = await AsyncStorage.getItem('access_token');
              const url = `${mainUrl}api/landing-cost/${lcno}/cancel-draft`;
              console.log('[CreateLandingCost] handleBack: cancel-draft url =', url);
              const res = await fetch(url, {
                method: 'DELETE',
                headers: {Accept: 'application/json', Authorization: `Bearer ${t}`},
              });
              console.log('[CreateLandingCost] handleBack: cancel-draft status =', res.status);
              const json = await res.json();
              console.log('[CreateLandingCost] handleBack: cancel-draft response =', JSON.stringify(json, null, 2));
            } catch (e) {
              console.error('[CreateLandingCost] handleBack: cancel-draft ERROR =', e?.message);
            } finally {
              props.navigation.goBack();
            }
          },
        },
      ],
    );
  };

  // ── intercept hardware back ──
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        handleBack();
        return true;
      });
      return () => sub.remove();
    }, [isEdit, lcno]),
  );

  const openSupplierPicker = () => {
    if (isReadOnly) return;
    console.log('[CreateLandingCost] openSupplierPicker');
    props.navigation.navigate('SupplierPickerScreen', {onSelect: handleSupplierSelected});
  };

  const validateForm = () => {
    console.log('[CreateLandingCost] validateForm: lcno =', {lcno,categoryId, cost, vatPct});
    console.log('[CreateLandingCost] validateForm: lcDate =', JSON.stringify(lcDate));
    if (!lcDate) {Alert.alert('Validation', 'Date is required.'); return false;}
    if (!categoryId) {Alert.alert('Validation', 'Cost category is required.'); return false;}
    const costNum = parseFloat(cost);
    if (cost === '' || isNaN(costNum) || costNum < 0) {Alert.alert('Validation', 'Cost must be a non-negative number.'); return false;}
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const payload = {
      lcno: lcno,
      lcdate: lcDate,
      suprefno: supRefNo || null,
      supcode: supplierCode || null,
      supname: supplierName || null,
      pono: linkedPO || null,
      category_id: categoryId || null,
      cost: parseFloat(cost) || 0,
      vatper: parseFloat(vatPct) || 0,
      vat: parseFloat(vatAmount) || 0,
      remarks: remarks || null,
    };

    console.log('[CreateLandingCost] handleSave: isEdit =', isEdit);
    console.log('[CreateLandingCost] handleSave: payload =', JSON.stringify(payload, null, 2));

    setSaving(true);
    try {
      const t = await AsyncStorage.getItem('access_token');
      const url = isEdit
        ? `${mainUrl}api/landing-cost/${lcno}/update`
        : `${mainUrl}api/landing-cost/save`;
      const method = isEdit ? 'PUT' : 'POST';

      console.log('[CreateLandingCost] handleSave: url =', url, '| method =', method);

      const res = await fetch(url, {
        method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('[CreateLandingCost] handleSave: status =', res.status);
      const json = await res.json();
      console.log('[CreateLandingCost] handleSave: response =', JSON.stringify(json, null, 2));

      if (res.status === 200 || res.status === 201) {
        console.log('[CreateLandingCost] handleSave: SUCCESS');
        Alert.alert('Success', json.message ?? (isEdit ? 'Updated successfully.' : 'Saved successfully.'), [
          {text: 'OK', onPress: () => props.navigation.goBack()},
        ]);
      } else {
        console.warn('[CreateLandingCost] handleSave: FAILED | message =', json.message);
        Alert.alert('Error', json.message ?? 'Something went wrong.');
      }
    } catch (e) {
      console.error('[CreateLandingCost] handleSave ERROR:', e?.message);
      Alert.alert('Error', e.message ?? 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  // ── modal renderer (same pattern as MR1) ──
  const renderModal = (items, selectedVal, onSelect, keyExtractor) => (
    <Modal
      transparent
      visible={activeModal !== null}
      animationType="fade"
      onRequestClose={() => setActiveModal(null)}>
      <TouchableOpacity style={styles.overlay} onPress={() => setActiveModal(null)}>
        <View style={styles.dropdownMenu}>
          <FlatList
            data={items}
            keyExtractor={(item, idx) => String(keyExtractor(item)) + idx}
            ListEmptyComponent={
              <Text style={styles.emptyModal}>No options available.</Text>
            }
            renderItem={({item}) => {
              const label = keyExtractor(item);
              return (
                <TouchableOpacity
                  style={[styles.menuItem, selectedVal === label && styles.menuItemActive]}
                  onPress={() => onSelect(item, label)}>
                  <Text style={[styles.menuItemText, selectedVal === label && styles.menuItemTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const modalConfig = {
    category: {
      items: categories,
      val: categoryName,
      onSelect: (item, label) => {
        console.log('[CreateLandingCost] category selected:', JSON.stringify(item));
        setCategoryId(item.SLNO ?? item.category_id ?? item.CATEGORY_ID ?? item.id ?? '');
        setCategoryName(item.CATEGORY_NAME ?? item.category_name ?? item.name ?? label);
        setActiveModal(null);
      },
      key: i => i.CATEGORY_NAME ?? i.category_name ?? i.name ?? String(i),
    },
    po: {
      items: poList,
      val: linkedPO,
      onSelect: (item, label) => {
        console.log('[CreateLandingCost] PO selected:', JSON.stringify(item));
        setLinkedPO(item.PONO ?? item.pono ?? label);
        setActiveModal(null);
      },
      key: i => i.PONO ?? i.pono ?? String(i),
    },
  };

  const active = activeModal ? modalConfig[activeModal] : null;

  // ── render ──
  return (
    <View style={styles.container}>
      <HeaderComponent
        BackTitle
        Title={isEdit ? `Edit ${lcno}` : 'New Landing Cost'}
        onBackPress={handleBack}
      />

      {loading ? (
        <LoaderComponent />
      ) : (
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          {/* Posted banner */}
          {isReadOnly && (
            <View style={styles.postedBanner}>
              <Text style={styles.postedBannerText}>🔒 Posted — editing is disabled</Text>
            </View>
          )}

          {/* Transaction No + Date */}
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Transaction No</Text>
              <TextInput style={[styles.input, styles.readOnly]} value={lcno} editable={false} />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Date *</Text>
              <TouchableOpacity
                style={[styles.dropdown, isReadOnly && styles.dropdownDisabled]}
                onPress={() => {
                  if (isReadOnly) return;
                  console.log('[CreateLandingCost] opening date picker | current =', lcDate);
                  setShowDatePicker(true);
                }}
                activeOpacity={isReadOnly ? 1 : 0.7}>
                <Text style={[styles.dropdownText, !lcDate && styles.placeholder]}>
                  {lcDate || 'Select date'}
                </Text>
                <CalendarIcon />
              </TouchableOpacity>
            </View>
          </View>

          {/* Supplier Ref No */}
          <Text style={styles.label}>Supplier Reference Number</Text>
          <TextInput
            style={[styles.input, isReadOnly && styles.readOnly]}
            value={supRefNo}
            onChangeText={v => {
              console.log('[CreateLandingCost] supRefNo:', v);
              setSupRefNo(v);
            }}
            placeholder="Enter supplier reference number"
            editable={!isReadOnly}
          />

          {/* Supplier */}
          <Text style={styles.label}>Supplier</Text>
          <TouchableOpacity
            style={[styles.dropdown, isReadOnly && styles.dropdownDisabled]}
            onPress={openSupplierPicker}
            activeOpacity={isReadOnly ? 1 : 0.7}>
            <Text style={[styles.dropdownText, !supplierCode && styles.placeholder]}>
              {supplierCode ? `${supplierCode} — ${supplierName}` : 'Tap to select supplier'}
            </Text>
            <Text style={styles.navArrow}>›</Text>
          </TouchableOpacity>

          {/* Linked PO */}
          <DropdownField
            label="Linked Purchase Order"
            value={linkedPO}
            disabled={isReadOnly || !supplierCode || poLoading}
            onPress={() => {
              if (!supplierCode) {
                Alert.alert('Select Supplier', 'Please select a supplier first.');
                return;
              }
              console.log('[CreateLandingCost] opening PO modal, count =', poList.length);
              setActiveModal('po');
            }}
          />
          {poLoading && <ActivityIndicator size="small" color={primaryColor} style={{marginTop: 4}} />}

          {/* Cost Category */}
          <DropdownField
            label="Cost Category"
            value={categoryName}
            disabled={isReadOnly}
            onPress={() => {
              console.log('[CreateLandingCost] opening category modal, count =', categories.length);
              setActiveModal('category');
            }}
          />

          {/* Cost + VAT % */}
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Cost *</Text>
              <TextInput
                style={[styles.input, isReadOnly && styles.readOnly]}
                value={cost}
                onChangeText={v => {
                  if (v !== '' && parseFloat(v) < 0) return;
                  setCost(v);
                }}
                placeholder="0.00"
                keyboardType="decimal-pad"
                editable={!isReadOnly}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>VAT %</Text>
              <TextInput
                style={[styles.input, isReadOnly && styles.readOnly]}
                value={vatPct}
                onChangeText={v => {
                  if (v !== '' && parseFloat(v) < 0) return;
                  setVatPct(v);
                }}
                placeholder="10"
                keyboardType="decimal-pad"
                editable={!isReadOnly}
              />
            </View>
          </View>

          {/* VAT Amount (read-only computed) */}
          <Text style={styles.label}>VAT Amount</Text>
          <TextInput
            style={[styles.input, styles.readOnly]}
            value={vatAmount}
            editable={false}
          />

          {/* Remarks */}
          <Text style={styles.label}>Remarks</Text>
          <TextInput
            style={[styles.textarea, isReadOnly && styles.readOnly]}
            value={remarks}
            onChangeText={v => {
              console.log('[CreateLandingCost] remarks length:', v.length);
              setRemarks(v);
            }}
            placeholder="Enter remarks..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isReadOnly}
          />

          {/* Save Button */}
          {!isReadOnly && (
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.submitText}>{isEdit ? 'UPDATE' : 'SAVE'}</Text>
              )}
            </TouchableOpacity>
          )}

          <View style={{height: 40}} />
        </ScrollView>
      )}

      {active && renderModal(active.items, active.val, active.onSelect, active.key)}

      <DatePicker
        modal
        open={showDatePicker}
        date={lcDate ? moment(lcDate, ['YYYY-MM-DD', 'DD/MM/YYYY'], true).isValid() ? moment(lcDate, ['YYYY-MM-DD', 'DD/MM/YYYY']).toDate() : new Date() : new Date()}
        mode="date"
        onConfirm={date => {
          const formatted = moment(date).format('YYYY-MM-DD');
          console.log('[CreateLandingCost] date picked:', formatted);
          setLcDate(formatted);
          setShowDatePicker(false);
        }}
        onCancel={() => {
          console.log('[CreateLandingCost] date picker cancelled');
          setShowDatePicker(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  form: {padding: 16},
  row: {flexDirection: 'row', gap: 10},
  halfField: {flex: 1},
  label: {fontSize: 13, fontWeight: '600', color: BlackColor, marginBottom: 4, marginTop: 12},
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    color: BlackColor,
  },
  readOnly: {backgroundColor: '#f0f0f0'},
  textarea: {
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'white',
    color: BlackColor,
    minHeight: 90,
  },
  dropdown: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 0,
  },
  dropdownDisabled: {backgroundColor: '#f0f0f0'},
  dropdownText: {fontSize: 14, color: BlackColor, flex: 1},
  placeholder: {color: '#aaa'},
  arrow: {fontSize: 12, color: 'gray'},
  navArrow: {fontSize: 20, color: 'gray', marginLeft: 8},
  postedBanner: {
    backgroundColor: '#fff3e0',
    borderRadius: 5,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f57c00',
  },
  postedBannerText: {fontSize: 13, color: '#e65100'},
  saveBtn: {
    marginTop: 24,
    backgroundColor: primaryColor,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnDisabled: {opacity: 0.6},
  submitText: {color: 'white', fontWeight: '700', fontSize: 15},
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  dropdownMenu: {
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 5,
    maxHeight: 300,
  },
  menuItem: {paddingVertical: 12, paddingHorizontal: 16},
  menuItemActive: {backgroundColor: primaryColor},
  menuItemText: {fontSize: 14, color: BlackColor},
  menuItemTextActive: {color: 'white'},
  emptyModal: {padding: 16, textAlign: 'center', color: 'gray'},
});

export default CreateLandingCost;
