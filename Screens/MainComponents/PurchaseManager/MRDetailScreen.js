import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import HeaderComponent from '../../CommonComponents/Header';
import AttachmentsList from '../../CommonComponents/AttachmentsList';
import {
  getMaterialRequestDetail,
  getMaterialRequestAttachments,
} from '../../../utility/ApiHelpers/MaterialRequestApi';
import {
  BlackColor,
  darkGreyTextColor,
  lightGreyTextColor,
  primaryColor,
  whiteColor,
} from '../../../utility/colors';
import { fonts } from '../../../utility/GlobalStyles';

// ─── Detail View ─────────────────────────────────────────────────────────────
const Row = ({ label, value }) =>
  value != null && value !== '' ? (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  ) : null;

const DetailView = ({ data }) => {
  if (!data) return null;
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Row label="MR No" value={data.mr_no} />
        <Row label="Date" value={data.mr_date} />
        <Row label="Division" value={data.division} />
        <Row label="Department" value={data.department} />
        <Row label="Plant" value={data.plant} />
        <Row label="Equipment" value={data.equipment} />
        <Row label="Vehicle" value={data.vehicle} />
        <Row label="Job Details" value={data.job_details} />
        <Row label="Remarks" value={data.remarks} />
        <Row label="Status" value={data.status} />
      </View>

      {data.items?.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Items</Text>
          {data.items.map((item, i) => (
            <View key={i} style={styles.card}>
              <Row label="Stock Code" value={item.stock_code} />
              <Row label="Description" value={item.description} />
              <Row label="Qty" value={item.qty?.toString()} />
              <Row label="Unit" value={item.unit} />
              <Row label="Remarks" value={item.remarks} />
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const MRDetailScreen = props => {
  const { mrNo, type } = props.route?.params ?? {};
  const isDetail = type === 'detail';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('[MRDetailScreen] mounted: mrNo =', mrNo, '| type =', type);
    const load = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        console.log(
          '[MRDetailScreen] fetching',
          isDetail ? 'detail' : 'attachments',
          'for mrNo =',
          mrNo,
        );
        const res = isDetail
          ? await getMaterialRequestDetail(token, mrNo)
          : await getMaterialRequestAttachments(token, mrNo);
        setData(isDetail ? res.data : res.data ?? []);
      } catch (e) {
        console.error('[MRDetailScreen] error =', e.message);
        setError(e.message ?? 'Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [mrNo, isDetail]);

  return (
    <View style={styles.container}>
      <HeaderComponent
        BackTitle
        Title={isDetail ? 'MR Details' : 'MR Attachments'}
        onBackPress={() => props.navigation.goBack()}
      />
      {loading ? (
        <ActivityIndicator
          style={styles.loader}
          size="large"
          color={primaryColor}
        />
      ) : error ? (
        <View style={styles.empty}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : isDetail ? (
        <DetailView data={data} />
      ) : (
        <AttachmentsList data={data} attachmentModule="material-request" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loader: { flex: 1, justifyContent: 'center' },
  content: { padding: 14, paddingBottom: 30 },
  card: {
    backgroundColor: whiteColor,
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
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
  errorText: {
    color: '#cc0000',
    fontFamily: fonts.Lato_Regular,
    textAlign: 'center',
    padding: 20,
  },
});

export default MRDetailScreen;
