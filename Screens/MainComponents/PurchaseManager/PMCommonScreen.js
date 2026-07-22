import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import HeaderComponent from '../../CommonComponents/Header';
import AttachmentImageViewer from '../../CommonComponents/AttachmentImageViewer';
import { mainUrl } from '../../../utility/ApiHelpers/StagingApis';
import {
  BlackColor,
  darkGreyTextColor,
  lightGreyTextColor,
  primaryColor,
  whiteColor,
} from '../../../utility/colors';
import { fonts } from '../../../utility/GlobalStyles';

// ─── Reusable row for detail views ───────────────────────────────────────────
const Row = ({ label, value }) =>
  value != null && value !== '' ? (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{String(value)}</Text>
    </View>
  ) : null;

// ─── PO Detail renderer ──────────────────────────────────────────────────────
// Renders as a bordered document/paper layout matching the printed Purchase
// Order (company letterhead omitted).
const formatPODate = value => {
  if (!value) return null;
  const datePart = String(value).split(' ')[0].split('T')[0];
  const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return datePart;
  const [, y, m, d] = match;
  return `${d}/${m}/${y}`;
};

const PO_ITEM_COLS = [
  { key: 'slno', label: 'SNo', width: 40 },
  { key: 'stockcode', label: 'Item Code', width: 90 },
  { key: 'stockname', label: 'Description', width: 190 },
  { key: 'unit', label: 'Unit', width: 55 },
  { key: 'qty', label: 'Qty', width: 55 },
  { key: 'rate', label: 'Rate', width: 65 },
  { key: 'discount', label: 'Discount', width: 70 },
  { key: 'net_price', label: 'Net Price', width: 80 },
  { key: 'tax_rate', label: 'Tax Rate', width: 65 },
  { key: 'tax_amount', label: 'Tax Amt', width: 75 },
  { key: 'amount', label: 'Amount', width: 80 },
];
// SNo..Rate columns collapse into a single "Total in {currency}" label cell in the footer row.
const PO_TOTALS_LABEL_COLS = 6;
const labelColsWidth = PO_ITEM_COLS.slice(0, PO_TOTALS_LABEL_COLS).reduce(
  (sum, c) => sum + c.width,
  0,
);
const tableFullWidth = PO_ITEM_COLS.reduce((sum, c) => sum + c.width, 0);

const PODetailView = ({ data }) => {
  if (!data) return null;
  const items = data.items ?? data.Items ?? [];
  const currency = data.CURRENCY ?? 'BD';
  const reqNos = [...new Set(items.map(it => it.mrno).filter(Boolean))].join(
    ', ',
  );

  const infoRows = [
    { label: 'LPO No', value: data.PONO },
    { label: 'PO Date', value: formatPODate(data.PODATE) },
    { label: 'Qtn No', value: data.QTNO },
    {
      label: 'Name',
      value: data.SUPNAME?.trim ? data.SUPNAME.trim() : data.SUPNAME,
    },
    { label: 'Phone No', value: data.PHONENO },
    { label: 'REQ No', value: reqNos },
    { label: 'Dept/Pl/Equip', value: data.DEPARTMENT },
  ];

  const totals = items.reduce(
    (acc, it) => ({
      discount: acc.discount + (Number(it.discount) || 0),
      net_price: acc.net_price + (Number(it.net_price) || 0),
      tax_amount: acc.tax_amount + (Number(it.tax_amount) || 0),
      amount: acc.amount + (Number(it.amount) || 0),
    }),
    { discount: 0, net_price: 0, tax_amount: 0, amount: 0 },
  );

  const approval = data.approval ?? {};
  // A PO can carry sign-off from more than one level (COO, GM, CEO) — show
  // each one that actually went through as its own row.
  const approvedBy = [
    {
      flag: approval.approved,
      label: 'Approved By',
      name: approval.approved_by,
    },
    {
      flag: approval.approved_gm,
      label: 'Approved By GM',
      name: approval.approved_by_gm,
    },
    {
      flag: approval.approved_ceo,
      label: 'Approved By CEO',
      name: approval.approved_by_ceo,
    },
  ].filter(a => a.flag && a.name);

  return (
    <ScrollView contentContainerStyle={styles.pdfPageWrapper}>
      <View style={styles.pdfPage}>
        <Text style={styles.pdfTitle}>PURCHASE ORDER</Text>

        <View style={styles.infoGrid}>
          {infoRows.map(({ label, value }, i) => (
            <View
              key={label}
              style={[
                styles.infoGridRow,
                i === infoRows.length - 1 && styles.infoGridRowLast,
              ]}
            >
              <View style={styles.infoCellLabel}>
                <Text style={styles.infoLabelText}>{label}</Text>
              </View>
              <View style={styles.infoCellValue}>
                <Text style={styles.infoValueText}>
                  {value != null && value !== '' ? String(value) : '-'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {items.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.gridTable}>
              <View style={styles.gridRow}>
                {PO_ITEM_COLS.map(({ key, label, width }) => (
                  <View
                    key={key}
                    style={[styles.gridCell, styles.gridHeaderCell, { width }]}
                  >
                    <Text style={styles.gridHeaderText}>{label}</Text>
                  </View>
                ))}
              </View>
              {items.map((row, i) => (
                <View key={i} style={styles.gridRow}>
                  {PO_ITEM_COLS.map(({ key, width }) => (
                    <View key={key} style={[styles.gridCell, { width }]}>
                      <Text style={styles.gridCellText}>
                        {row[key] != null ? String(row[key]) : '-'}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
              <View style={styles.gridRow}>
                <View
                  style={[
                    styles.gridCell,
                    styles.gridTotalsCell,
                    { width: labelColsWidth },
                  ]}
                >
                  <Text
                    style={styles.gridTotalsText}
                  >{`Total in ${currency}`}</Text>
                </View>
                {PO_ITEM_COLS.slice(PO_TOTALS_LABEL_COLS).map(
                  ({ key, width }) => {
                    let content = '';
                    if (key === 'discount')
                      content = totals.discount.toFixed(3);
                    else if (key === 'net_price')
                      content = totals.net_price.toFixed(3);
                    else if (key === 'tax_amount')
                      content = totals.tax_amount.toFixed(3);
                    else if (key === 'amount')
                      content = totals.amount.toFixed(3);
                    return (
                      <View
                        key={key}
                        style={[
                          styles.gridCell,
                          styles.gridTotalsCell,
                          { width },
                        ]}
                      >
                        <Text style={styles.gridTotalsText}>{content}</Text>
                      </View>
                    );
                  },
                )}
              </View>
              {!!data.AMOUNT_WORDS && (
                <View style={styles.gridRow}>
                  <View style={[styles.gridCell, { width: tableFullWidth }]}>
                    <Text style={styles.gridCellText}>{data.AMOUNT_WORDS}</Text>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        )}

        <View style={styles.summaryGrid}>
          {[
            { label: 'Discount', value: data.DISCOUNT },
            { label: 'VAT Total', value: data.VATTOT },
            { label: 'Net Amount', value: data.NETAMT },
          ]
            .filter(row => row.value != null)
            .map(({ label, value }, i, arr) => (
              <View
                key={label}
                style={[
                  styles.infoGridRow,
                  i === arr.length - 1 && styles.infoGridRowLast,
                ]}
              >
                <View style={styles.infoCellLabel}>
                  <Text style={styles.infoLabelText}>{label}</Text>
                </View>
                <View style={styles.infoCellValue}>
                  <Text
                    style={styles.infoValueText}
                  >{`${value} ${currency}`}</Text>
                </View>
              </View>
            ))}
        </View>

        {!!data.REMARKS && (
          <View style={styles.remarksBox}>
            <Text style={styles.remarksLabel}>Remarks:</Text>
            <Text style={styles.remarksText}>{data.REMARKS}</Text>
          </View>
        )}

        {approval.rejected ? (
          <View style={[styles.remarksBox, styles.rejectedBox]}>
            <Text style={[styles.remarksLabel, styles.rejectedText]}>
              Rejected
            </Text>
            {!!approval.appremarks && (
              <Text style={styles.remarksText}>{approval.appremarks}</Text>
            )}
          </View>
        ) : approvedBy.length > 0 ? (
          <View style={styles.remarksBox}>
            {approvedBy.map(({ label, name }, i) => (
              <View
                key={label}
                style={[
                  styles.approvalRow,
                  i === approvedBy.length - 1 && styles.approvalRowLast,
                ]}
              >
                <Text style={styles.approvalLabel}>{`${label}:`}</Text>
                <Text style={styles.approvalValue}>{name}</Text>
              </View>
            ))}
          </View>
        ) : approval.is_pending ? (
          <View style={styles.remarksBox}>
            <Text style={styles.remarksLabel}>Approval Pending</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
};

// ─── Detail renderer — renders every key/value from the data object ───────────
const DetailView = ({ data }) => {
  if (!data) return null;

  // Pull out nested arrays (items, enquiries, etc.) to render separately
  const fields = Object.entries(data).filter(
    ([k, v]) =>
      !Array.isArray(v) && typeof v !== 'object' && !MR_HIDDEN_FIELDS.has(k),
  );
  const arrays = Object.entries(data).filter(([, v]) => Array.isArray(v));

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.paddedCard}>
        {fields.map(([key, value]) => (
          <Row
            key={key}
            label={key
              .replace(/_/g, ' ')
              .replace(/\b\w/g, c => c.toUpperCase())}
            value={value}
          />
        ))}
      </View>

      {arrays.map(([key, arr]) => {
        if (!arr.length) return null;
        const cols = Object.keys(arr[0] ?? {}).filter(
          ck =>
            !Array.isArray(arr[0][ck]) &&
            typeof arr[0][ck] !== 'object' &&
            !MR_HIDDEN_FIELDS.has(ck) &&
            !ITEMS_STATUS_HIDDEN.has(ck),
        );
        return (
          <View key={key}>
            <Text style={styles.sectionTitle}>
              {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </Text>
            <View style={styles.card}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  <View style={styles.tableHeader}>
                    {cols.map(c => (
                      <Text key={c} style={[styles.hCol, styles.colHeader]}>
                        {c
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, ch => ch.toUpperCase())}
                      </Text>
                    ))}
                  </View>
                  {arr.map((subItem, i) => (
                    <View
                      key={i}
                      style={[
                        styles.tableRow,
                        i % 2 === 0 && styles.tableRowAlt,
                      ]}
                    >
                      {cols.map(c => (
                        <Text key={c} style={styles.hCol}>
                          {subItem[c] != null ? String(subItem[c]) : '-'}
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

// ─── Attachments renderer ─────────────────────────────────────────────────────
const AttachmentsView = ({ data }) => {
  if (!data?.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No attachments found.</Text>
      </View>
    );
  }
  return (
    <ScrollView contentContainerStyle={styles.content}>
      {data.map((att, i) => (
        <View key={i} style={styles.attachCard}>
          <Text style={styles.attachName} numberOfLines={1}>
            {att.ATTACHNAME}
          </Text>
          <Text style={styles.attachMeta}>
            {att.ATTACHDATE?.split(' ')[0]}
            {att.ATTACHSIZE
              ? ` · ${(parseInt(att.ATTACHSIZE, 10) / 1024).toFixed(1)} KB`
              : ''}
          </Text>
          {att.ATTACHFILE && (
            <View style={{ marginTop: 8 }}>
              <AttachmentImageViewer attachment={att} />
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const MR_HIDDEN_FIELDS = new Set([
  'is_editable',
  'Is Editable',
  'PRIORITY',
  'Priority',
  'SLNO',
  'SL No',
  'DTSL',
]);
const ITEMS_STATUS_HIDDEN = new Set([
  'approved',
  'rejected',
  'status',
  'is_pending',
  'pending',
]);

// ─── MR Details renderer ─────────────────────────────────────────────────────
const MrDetailsView = ({ data }) => {
  const [expandedKey, setExpandedKey] = useState(null);

  if (!data?.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No MR details found.</Text>
      </View>
    );
  }

  const renderMrItem = ({ item, index }) => {
    const fields = Object.entries(item).filter(
      ([k, v]) =>
        !Array.isArray(v) && typeof v !== 'object' && !MR_HIDDEN_FIELDS.has(k),
    );
    const arrays = Object.entries(item).filter(
      ([, v]) => Array.isArray(v) && v.length > 0,
    );

    return (
      <View style={styles.card}>
        {/* Always visible flat fields */}
        <View style={styles.mrFieldsContainer}>
          {fields.map(([k, v]) => (
            <Row
              key={k}
              label={k
                .replace(/_/g, ' ')
                .replace(/\b\w/g, c => c.toUpperCase())}
              value={v}
            />
          ))}
        </View>

        {/* Each array section has its own expand toggle */}
        {arrays.map(([k, arr]) => {
          const key = `${index}_${k}`;
          const isExpanded = expandedKey === key;
          const cols = Object.keys(arr[0] ?? {}).filter(
            ck =>
              !Array.isArray(arr[0][ck]) &&
              typeof arr[0][ck] !== 'object' &&
              !MR_HIDDEN_FIELDS.has(ck),
          );
          return (
            <View key={k}>
              <TouchableOpacity
                style={styles.sectionToggle}
                onPress={() => setExpandedKey(isExpanded ? null : key)}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionTitle}>
                  {k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </Text>
                <Text style={styles.arrow}>{isExpanded ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {isExpanded && (
                <View style={styles.expandedContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View>
                      <View style={styles.tableHeader}>
                        {cols.map(c => (
                          <Text key={c} style={[styles.hCol, styles.colHeader]}>
                            {c
                              .replace(/_/g, ' ')
                              .replace(/\b\w/g, ch => ch.toUpperCase())}
                          </Text>
                        ))}
                      </View>
                      {arr.map((sub, j) => (
                        <View
                          key={j}
                          style={[
                            styles.tableRow,
                            j % 2 === 0 && styles.tableRowAlt,
                          ]}
                        >
                          {cols.map(c => (
                            <Text key={c} style={styles.hCol}>
                              {sub[c] != null ? String(sub[c]) : '-'}
                            </Text>
                          ))}
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      keyExtractor={(_, i) => String(i)}
      renderItem={renderMrItem}
      contentContainerStyle={styles.content}
    />
  );
};

// ─── EQ Details renderer ─────────────────────────────────────────────────────
const EqDetailsView = ({ data, onAttachPress }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!data?.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No EQ details found.</Text>
      </View>
    );
  }

  const renderEqItem = ({ item, index }) => {
    const isExpanded = expandedIndex === index;
    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => setExpandedIndex(isExpanded ? null : index)}
          activeOpacity={0.7}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.mrNo}>{item.mrno ?? item.mr_no ?? '-'}</Text>
            <Text style={styles.subText}>{item.stock_code ?? ''}</Text>
            <Text style={styles.subTextLight}>{item.stock_name ?? ''}</Text>
          </View>
          <Text style={styles.arrow}>{isExpanded ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {isExpanded && item.enquiries?.length > 0 && (
          <View style={styles.expandedContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                <View style={styles.tableHeader}>
                  <Text style={[styles.hCol, styles.colHeader]}>EQ No</Text>
                  <Text style={[styles.hCol, styles.colHeader]}>EQ Date</Text>
                  <Text style={[styles.hCol, styles.colHeader]}>
                    Supplier Name
                  </Text>
                  <Text style={[styles.hColLg, styles.colHeader]}>
                    Added By & Time
                  </Text>
                  <Text style={[styles.hCol, styles.colHeader]}>
                    Enquiry Type
                  </Text>
                </View>
                {item.enquiries.map((eq, j) => (
                  <View
                    key={j}
                    style={[styles.tableRow, j % 2 === 0 && styles.tableRowAlt]}
                  >
                    <Text style={styles.hCol}>
                      {eq.EQNO ?? eq.eq_no ?? '-'}
                    </Text>
                    <Text style={styles.hCol}>
                      {eq.ENQDATE ?? eq.enq_date ?? '-'}
                    </Text>
                    <Text style={styles.hCol}>
                      {eq.SUPNAME ?? eq.supplier ?? '-'}
                    </Text>
                    <Text style={styles.hColLg}>
                      {[eq.added_by, eq.added_time].filter(Boolean).join(' ') ||
                        '-'}
                    </Text>
                    <Text style={styles.hCol}>
                      {eq.ENQTYPE ?? eq.enquiry_type ?? '-'}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
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
      contentContainerStyle={styles.content}
    />
  );
};

// ─── Common Screen ────────────────────────────────────────────────────────────
const PMCommonScreen = props => {
  const { title, apiUrl, isDetail, isEqDetails, isMrDetails, isPODetail } =
    props.route?.params ?? {};

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const onAttachPress = eq => {
    const eqNo = eq?.EQNO;
    const attachUrl = `${mainUrl}api/enquiry/${eqNo}/attachments`;
    console.log(
      '[PMCommonScreen] EQ Attach: eqNo =',
      eqNo,
      '| url =',
      attachUrl,
    );
    props.navigation.push('PMCommonScreen', {
      title: 'Enquiry Attachments',
      apiUrl: attachUrl,
      isDetail: false,
    });
  };

  useEffect(() => {
    console.log('[PMCommonScreen] mounted');
    console.log('[PMCommonScreen] title   =', title);
    console.log('[PMCommonScreen] apiUrl  =', apiUrl);
    console.log('[PMCommonScreen] isDetail=', isDetail);

    const load = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        console.log('[PMCommonScreen] calling API:', apiUrl);

        const res = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer ' + token,
          },
        });

        console.log('[PMCommonScreen] response status =', res.status);
        const json = await res.json();
        console.log(
          '[PMCommonScreen] response body =',
          JSON.stringify(json, null, 2),
        );

        if (res.status !== 200) {
          throw new Error(json?.message ?? 'Request failed: ' + res.status);
        }

        setData(
          isPODetail || isDetail || isEqDetails || isMrDetails
            ? json.data
            : json.data ?? [],
        );
      } catch (e) {
        console.error('[PMCommonScreen] error =', e.message);
        setError(e.message ?? 'Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [apiUrl]);

  return (
    <View style={styles.container}>
      <HeaderComponent
        BackTitle
        Title={title ?? 'Details'}
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
      ) : isPODetail ? (
        <PODetailView data={data} />
      ) : isMrDetails ? (
        <MrDetailsView data={data} />
      ) : isEqDetails ? (
        <EqDetailsView data={data} onAttachPress={onAttachPress} />
      ) : isDetail ? (
        <DetailView data={data} />
      ) : (
        <AttachmentsView data={data} />
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
    marginBottom: 10,
    elevation: 2,
    overflow: 'hidden',
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
  attachCard: {
    backgroundColor: whiteColor,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: primaryColor,
  },
  attachName: {
    fontSize: 13,
    fontFamily: fonts.Lato_Bold,
    color: BlackColor,
  },
  attachMeta: {
    fontSize: 11,
    fontFamily: fonts.Lato_Regular,
    color: lightGreyTextColor,
    marginTop: 2,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: lightGreyTextColor, fontFamily: fonts.Lato_Regular },
  errorText: {
    color: '#cc0000',
    fontFamily: fonts.Lato_Regular,
    textAlign: 'center',
    padding: 20,
  },
  paddedCard: {
    backgroundColor: whiteColor,
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
  },
  mrFieldsContainer: { padding: 14 },
  sectionToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#f5f0ff',
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  threeDot: {
    fontSize: 16,
    color: primaryColor,
    fontWeight: '700',
    lineHeight: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
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
  // ─── PDF-style Purchase Order page ─────────────────────────────────────────
  pdfPageWrapper: { padding: 10, paddingBottom: 90 },
  pdfPage: {
    backgroundColor: whiteColor,
    borderWidth: 1,
    borderColor: '#999',
    padding: 16,
    elevation: 3,
  },
  pdfTitle: {
    fontSize: 18,
    fontFamily: fonts.Lato_Bold,
    color: BlackColor,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 14,
    textTransform: 'uppercase',
  },
  infoGrid: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#999',
    marginBottom: 16,
  },
  infoGridRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#999',
  },
  infoGridRowLast: { borderBottomWidth: 1 },
  infoCellLabel: {
    width: 130,
    paddingVertical: 7,
    paddingHorizontal: 8,
    backgroundColor: '#f2f2f2',
    borderRightWidth: 1,
    borderColor: '#999',
    justifyContent: 'center',
  },
  infoCellValue: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  infoLabelText: {
    fontSize: 12,
    fontFamily: fonts.Lato_Bold,
    color: darkGreyTextColor,
  },
  infoValueText: {
    fontSize: 12,
    fontFamily: fonts.Lato_Regular,
    color: BlackColor,
  },
  gridTable: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#999',
    marginBottom: 16,
  },
  gridRow: { flexDirection: 'row' },
  gridCell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#999',
    paddingVertical: 6,
    paddingHorizontal: 6,
    justifyContent: 'center',
  },
  gridHeaderCell: { backgroundColor: '#f2f2f2' },
  gridHeaderText: {
    fontSize: 11,
    fontFamily: fonts.Lato_Bold,
    color: BlackColor,
  },
  gridCellText: {
    fontSize: 11,
    fontFamily: fonts.Lato_Regular,
    color: BlackColor,
  },
  gridTotalsCell: { backgroundColor: '#f2f2f2' },
  gridTotalsText: {
    fontSize: 11,
    fontFamily: fonts.Lato_Bold,
    color: BlackColor,
  },
  summaryGrid: {
    alignSelf: 'flex-end',
    width: '60%',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#999',
    marginBottom: 16,
  },
  remarksBox: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 8,
    marginBottom: 12,
  },
  remarksLabel: {
    fontSize: 12,
    fontFamily: fonts.Lato_Bold,
    color: darkGreyTextColor,
    marginBottom: 2,
  },
  remarksText: {
    fontSize: 13,
    fontFamily: fonts.Lato_Regular,
    color: BlackColor,
  },
  rejectedBox: { borderColor: '#cc0000' },
  rejectedText: { color: '#cc0000' },
  approvalRow: { flexDirection: 'row', marginBottom: 4 },
  approvalRowLast: { marginBottom: 0 },
  approvalLabel: {
    fontSize: 12,
    fontFamily: fonts.Lato_Bold,
    color: darkGreyTextColor,
    marginRight: 4,
  },
  approvalValue: {
    fontSize: 13,
    fontFamily: fonts.Lato_Regular,
    color: BlackColor,
  },
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
  hColLg: {
    width: 160,
    fontSize: 12,
    color: BlackColor,
    fontFamily: fonts.Lato_Regular,
    paddingRight: 6,
  },
  hColSm: {
    width: 54,
    fontSize: 12,
    color: BlackColor,
    fontFamily: fonts.Lato_Regular,
    alignItems: 'center',
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
  approved: { color: '#006B38' },
  rejected: { color: '#cc0000' },
  attachIcon: { fontSize: 15, lineHeight: 20 },
});

export default PMCommonScreen;
