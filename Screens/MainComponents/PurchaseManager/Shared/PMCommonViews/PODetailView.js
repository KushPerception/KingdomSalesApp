import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BlackColor, darkGreyTextColor, whiteColor } from '../../../../../utility/colors';
import { fonts } from '../../../../../utility/GlobalStyles';

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
                <View style={styles.summaryCellValue}>
                  <Text
                    style={styles.infoValueText}
                    numberOfLines={1}
                    adjustsFontSizeToFit
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

const styles = StyleSheet.create({
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
  summaryCellValue: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'flex-end',
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
});

export default PODetailView;
