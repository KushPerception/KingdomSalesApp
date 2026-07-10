import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import {
  cancelMaterialRequestDraft,
  getMaterialRequestDepartments,
  getMaterialRequestDetail,
  getMaterialRequestDivisions,
  getMaterialRequestEquipments,
  getMaterialRequestGenerate,
  getMaterialRequestJobDetails,
  getMaterialRequestPlants,
  getMaterialRequestVehicles,
} from '../../../utility/ApiHelpers/StagingApis';
import {BlackColor, primaryColor} from '../../../utility/colors';
import HeaderComponent from '../../CommonComponents/Header';
import LoaderComponent from '../../CommonComponents/LoaderComponent';

const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];

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

const MaterialRequest1 = props => {
  const editMrNo = props.route?.params?.mrno ?? null;
  const isEditMode = !!editMrNo;

  const [loading, setLoading] = useState(true);
  const [mrNo, setMrNo] = useState('');
  const [mrDate, setMrDate] = useState('');

  const [divisions, setDivisions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [plants, setPlants] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [jobDetails, setJobDetails] = useState([]);

  const [division, setDivision] = useState('');
  const [dept, setDept] = useState('');
  const [plant, setPlant] = useState('');
  const [eqp, setEqp] = useState('');
  const [vehNo, setVehNo] = useState('');
  const [vehDesc, setVehDesc] = useState('');
  const [priority, setPriority] = useState('');
  const [jobRefNo, setJobRefNo] = useState('');

  const [activeModal, setActiveModal] = useState(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    console.log('[MR1] loadInitialData — mode:', isEditMode ? `EDIT (${editMrNo})` : 'NEW');
    try {
      const t = await AsyncStorage.getItem('access_token');
      setToken(t);

      console.log('[MR1] fetching parallel: detail/generate + divisions + vehicles + jobDetails');
      const [genRes, divRes, vehRes, jobRes] = await Promise.all([
        isEditMode ? getMaterialRequestDetail(t, editMrNo) : getMaterialRequestGenerate(t),
        getMaterialRequestDivisions(t),
        getMaterialRequestVehicles(t),
        getMaterialRequestJobDetails(t),
      ]);

      console.log('[MR1] genRes:', JSON.stringify(genRes, null, 2));
      console.log('[MR1] divRes count:', (divRes?.data ?? divRes ?? []).length);
      console.log('[MR1] vehRes count:', (vehRes?.data ?? vehRes ?? []).length);
      console.log('[MR1] jobRes count:', (jobRes?.data ?? jobRes ?? []).length);

      const divList = divRes?.data ?? divRes ?? [];
      const vehList = vehRes?.data ?? vehRes ?? [];
      setDivisions(divList);
      setVehicles(vehList);
      setJobDetails(jobRes?.data ?? jobRes ?? []);

      if (isEditMode) {
        const d = genRes?.data ?? {};
        console.log('[MR1] EDIT — raw detail data:', JSON.stringify(d, null, 2));

        setMrNo(d.MRNO ?? editMrNo);
        setMrDate(d.MRDATE ?? '');
        setPriority(d.PRIORITY ?? '');
        setJobRefNo(d.JOBREFNO ?? '');
        const vehFound = vehList.find(v => v?.VehName === d.VEHNO);
        setVehNo(d.VEHNO ?? '');
        setVehDesc(vehFound?.CC ?? '');
        console.log('[MR1] EDIT — set: mrNo=%s mrDate=%s priority=%s jobRefNo=%s vehNo=%s vehDesc=%s',
          d.MRNO, d.MRDATE, d.PRIORITY, d.JOBREFNO, d.VEHNO, vehFound?.CC);

        if (d.DIVISION) {
          console.log('[MR1] EDIT — fetching departments for division:', d.DIVISION);
          setDivision(d.DIVISION);
          const deptRes = await getMaterialRequestDepartments(t, d.DIVISION);
          const deptList = deptRes?.data ?? deptRes ?? [];
          console.log('[MR1] EDIT — deptList count:', deptList.length);
          setDepartments(deptList);

          if (d.DEPT) {
            console.log('[MR1] EDIT — fetching plants for dept:', d.DEPT);
            setDept(d.DEPT);
            const plantRes = await getMaterialRequestPlants(t, d.DEPT);
            const plantList = plantRes?.data ?? plantRes ?? [];
            console.log('[MR1] EDIT — plantList count:', plantList.length);
            setPlants(plantList);

            if (d.PLANT) {
              console.log('[MR1] EDIT — fetching equipments for plant:', d.PLANT);
              setPlant(d.PLANT);
              const eqpRes = await getMaterialRequestEquipments(t, d.PLANT);
              const eqpList = eqpRes?.data ?? eqpRes ?? [];
              console.log('[MR1] EDIT — eqpList count:', eqpList.length);
              setEquipments(eqpList);
              setEqp(d.EQPART ?? '');
              console.log('[MR1] EDIT — set eqp:', d.EQPART);
            } else {
              console.log('[MR1] EDIT — no PLANT in detail, skipping equipments');
            }
          } else {
            console.log('[MR1] EDIT — no DEPT in detail, skipping plants/equipments');
          }
        } else {
          console.log('[MR1] EDIT — no DIVISION in detail, skipping cascade');
        }
      } else {
        const mrNoVal = genRes?.data?.MRNO ?? genRes?.MRNO ?? '';
        const mrDateVal = genRes?.data?.MRDATE ?? genRes?.MRDATE ?? moment().format('DD/MM/YYYY');
        console.log('[MR1] NEW — generated mrNo:', mrNoVal, 'mrDate:', mrDateVal);
        setMrNo(mrNoVal);
        setMrDate(mrDateVal);
      }

      console.log('[MR1] loadInitialData complete');
    } catch (e) {
      console.error('[MR1] loadInitialData ERROR:', e?.message ?? e);
      Alert.alert('Error', 'Failed to load form data.');
    } finally {
      setLoading(false);
    }
  };

  const onSelectDivision = async val => {
    console.log('[MR1] onSelectDivision:', val);
    setDivision(val);
    setDept(''); setPlant(''); setEqp('');
    setDepartments([]); setPlants([]); setEquipments([]);
    setActiveModal(null);
    try {
      const res = await getMaterialRequestDepartments(token, val);
      const list = res?.data ?? res ?? [];
      console.log('[MR1] departments loaded:', list.length);
      setDepartments(list);
    } catch (e) { console.error('[MR1] onSelectDivision ERROR:', e?.message); }
  };

  const onSelectDept = async val => {
    console.log('[MR1] onSelectDept:', val);
    setDept(val);
    setPlant(''); setEqp('');
    setPlants([]); setEquipments([]);
    setActiveModal(null);
    try {
      const res = await getMaterialRequestPlants(token, val);
      const list = res?.data ?? res ?? [];
      console.log('[MR1] plants loaded:', list.length);
      setPlants(list);
    } catch (e) { console.error('[MR1] onSelectDept ERROR:', e?.message); }
  };

  const onSelectPlant = async val => {
    console.log('[MR1] onSelectPlant:', val);
    setPlant(val);
    setEqp('');
    setEquipments([]);
    setActiveModal(null);
    try {
      const res = await getMaterialRequestEquipments(token, val);
      const list = res?.data ?? res ?? [];
      console.log('[MR1] equipments loaded:', list.length);
      setEquipments(list);
    } catch (e) { console.error('[MR1] onSelectPlant ERROR:', e?.message); }
  };

  const handleBack = () => {
    if (isEditMode) {
      props.navigation.goBack();
      return;
    }
    Alert.alert(
      'Discard Draft',
      'Are you sure you want to cancel this draft?',
      [
        {text: 'No', style: 'cancel'},
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              const t = await AsyncStorage.getItem('access_token');
              await cancelMaterialRequestDraft(t, mrNo);
            } catch (e) {}
            props.navigation.goBack();
          },
        },
      ],
    );
  };

  const handleNext = () => {
    if (!division || !dept) {
      Alert.alert('Validation', 'Division and Dept are required.');
      return;
    }
    const payload = {mrNo, mrDate, division, dept, plant, eqp, vehNo, vehDesc, priority, jobRefNo, isEditMode};
    console.log('[MR1] handleNext → navigating to MR2 with:', JSON.stringify(payload, null, 2));
    props.navigation.navigate('MaterialRequest2', payload);
  };

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
            keyExtractor={(item, idx) => keyExtractor(item) + idx}
            renderItem={({item}) => {
              const label = keyExtractor(item);
              return (
                <TouchableOpacity
                  style={[styles.menuItem, selectedVal === label && styles.menuItemActive]}
                  onPress={() => onSelect(label)}>
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
    div:      {items: divisions,        val: division,  onSelect: onSelectDivision, key: i => i?.Division ?? i?.DIVISION ?? i?.DivName ?? i?.DIVNAME ?? String(i)},
    dept:     {items: departments,      val: dept,      onSelect: onSelectDept,     key: i => i?.DeptName ?? i?.DEPTNAME ?? i?.Dept ?? i?.DEPT ?? String(i)},
    plant:    {items: plants,           val: plant,     onSelect: onSelectPlant,    key: i => i?.PlantName ?? i?.PLANTNAME ?? i?.Plant ?? i?.PLANT ?? i?.SLNO ?? String(i)},
    eqp:      {items: equipments,       val: eqp,       onSelect: v => { setEqp(v); setActiveModal(null); }, key: i => i?.EQUIP ?? i?.EqpName ?? i?.EQPNAME ?? i?.Eqp ?? i?.EQP ?? i?.SLNO ?? String(i)},
    veh:      {items: vehicles,         val: vehNo,     onSelect: v => { const found = vehicles.find(i => i?.VehName === v); setVehNo(v); setVehDesc(found?.CC ?? ''); setActiveModal(null); }, key: i => i?.VehName ?? String(i)},
    priority: {items: PRIORITY_OPTIONS, val: priority,  onSelect: v => { setPriority(v); setActiveModal(null); }, key: i => i},
    job:      {items: jobDetails,       val: jobRefNo,  onSelect: v => { setJobRefNo(v); setActiveModal(null); }, key: i => String(i)},
  };

  const active = activeModal ? modalConfig[activeModal] : null;

  return (
    <View style={styles.container}>
      <HeaderComponent
        BackTitle={true}
        Title={isEditMode ? 'Edit Material Request' : 'New Material Request'}
        onBackPress={handleBack}
      />

      {loading ? (
        <LoaderComponent />
      ) : (
        <ScrollView contentContainerStyle={styles.form}>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>MR No</Text>
              <TextInput style={[styles.input, styles.readOnly]} value={mrNo} editable={false} />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Date</Text>
              <TextInput style={[styles.input, styles.readOnly]} value={mrDate} editable={false} />
            </View>
          </View>

          <DropdownField label="Stk Division *" value={division} onPress={() => setActiveModal('div')} />
          <DropdownField label="Dept Name *"    value={dept}     onPress={() => setActiveModal('dept')}  disabled={!division} />
          <DropdownField label="Plant Name"     value={plant}    onPress={() => setActiveModal('plant')} disabled={!dept} />
          <DropdownField label="EQP Name"       value={eqp}      onPress={() => setActiveModal('eqp')}   disabled={!plant} />
          <DropdownField label="Vehicle No"     value={vehNo}    onPress={() => setActiveModal('veh')} />

          <Text style={styles.label}>Vehicle Desc</Text>
          <TextInput style={styles.input} value={vehDesc} onChangeText={setVehDesc} placeholder="Vehicle Desc" />

          <DropdownField label="Priority"   value={priority}  onPress={() => setActiveModal('priority')} />
          <DropdownField label="Job Ref No" value={jobRefNo}  onPress={() => setActiveModal('job')} />

          <TouchableOpacity style={styles.NextBtn} onPress={handleNext}>
            <Text style={styles.submitText}>NEXT</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {active && renderModal(active.items, active.val, active.onSelect, active.key)}
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
  },
  dropdownDisabled: {backgroundColor: '#f0f0f0'},
  dropdownText: {fontSize: 14, color: BlackColor},
  placeholder: {color: '#aaa'},
  arrow: {fontSize: 12, color: 'gray'},
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
  NextBtn: {
    marginTop: 24,
    backgroundColor: primaryColor,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitText: {color: 'white', fontWeight: '700', fontSize: 15},
});

export default MaterialRequest1;
