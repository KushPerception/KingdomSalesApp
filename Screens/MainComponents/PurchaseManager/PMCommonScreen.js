import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
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
import {mainUrl} from '../../../utility/ApiHelpers/StagingApis';
import {
  BlackColor,
  darkGreyTextColor,
  lightGreyTextColor,
  primaryColor,
  whiteColor,
} from '../../../utility/colors';
import {fonts} from '../../../utility/GlobalStyles';

// ─── Reusable row for detail views ───────────────────────────────────────────
const Row = ({label, value}) =>
  value != null && value !== '' ? (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{String(value)}</Text>
    </View>
  ) : null;

// ─── Detail renderer — renders every key/value from the data object ───────────
const DetailView = ({data}) => {
  if (!data) return null;

  // Pull out nested arrays (items, enquiries, etc.) to render separately
  const fields = Object.entries(data).filter(([, v]) => !Array.isArray(v) && typeof v !== 'object');
  const arrays = Object.entries(data).filter(([, v]) => Array.isArray(v));

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.paddedCard}>
        {fields.map(([key, value]) => (
          <Row
            key={key}
            label={key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            value={value}
          />
        ))}
      </View>

      {arrays.map(([key, arr]) =>
        arr.length > 0 ? (
          <View key={key}>
            <Text style={styles.sectionTitle}>
              {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </Text>
            {arr.map((subItem, i) => (
              <View key={i} style={styles.paddedCard}>
                {Object.entries(subItem)
                  .filter(([, v]) => !Array.isArray(v) && typeof v !== 'object')
                  .map(([k, v]) => (
                    <Row
                      key={k}
                      label={k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      value={v}
                    />
                  ))}
              </View>
            ))}
          </View>
        ) : null,
      )}
    </ScrollView>
  );
};

// ─── Attachments renderer ─────────────────────────────────────────────────────
const AttachmentsView = ({data}) => {
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
            <View style={{marginTop: 8}}>
              <AttachmentImageViewer attachment={att} />
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

// ─── MR Details renderer ─────────────────────────────────────────────────────
const MrDetailsView = ({data}) => {
  const [expandedKey, setExpandedKey] = useState(null);

  if (!data?.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No MR details found.</Text>
      </View>
    );
  }

  const renderMrItem = ({item, index}) => {
    const fields = Object.entries(item).filter(([, v]) => !Array.isArray(v) && typeof v !== 'object');
    const arrays = Object.entries(item).filter(([, v]) => Array.isArray(v) && v.length > 0);

    return (
      <View style={styles.card}>
        {/* Always visible flat fields */}
        <View style={styles.mrFieldsContainer}>
          {fields.map(([k, v]) => (
            <Row
              key={k}
              label={k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              value={v}
            />
          ))}
        </View>

        {/* Each array section has its own expand toggle */}
        {arrays.map(([k, arr]) => {
          const key = `${index}_${k}`;
          const isExpanded = expandedKey === key;
          const cols = Object.keys(arr[0] ?? {}).filter(
            ck => !Array.isArray(arr[0][ck]) && typeof arr[0][ck] !== 'object',
          );
          return (
            <View key={k}>
              <TouchableOpacity
                style={styles.sectionToggle}
                onPress={() => setExpandedKey(isExpanded ? null : key)}
                activeOpacity={0.7}>
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
                            {c.replace(/_/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase())}
                          </Text>
                        ))}
                      </View>
                      {arr.map((sub, j) => (
                        <View key={j} style={[styles.tableRow, j % 2 === 0 && styles.tableRowAlt]}>
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
const EqDetailsView = ({data, onAttachPress}) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!data?.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No EQ details found.</Text>
      </View>
    );
  }

  const renderEqItem = ({item, index}) => {
    const isExpanded = expandedIndex === index;
    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => setExpandedIndex(isExpanded ? null : index)}
          activeOpacity={0.7}>
          <View style={{flex: 1}}>
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
                  <Text style={[styles.hCol, styles.colHeader]}>Supplier</Text>
                  <Text style={[styles.hCol, styles.colHeader]}>Qty</Text>
                  <Text style={[styles.hCol, styles.colHeader]}>Unit</Text>
                  <Text style={[styles.hCol, styles.colHeader]}>Rate</Text>
                  <Text style={[styles.hCol, styles.colHeader]}>Status</Text>
                  <Text style={[styles.hColSm, styles.colHeader]}>Attach</Text>
                </View>
                {item.enquiries.map((eq, j) => (
                  <View key={j} style={[styles.tableRow, j % 2 === 0 && styles.tableRowAlt]}>
                    <Text style={styles.hCol}>{eq.EQNO ?? eq.eq_no ?? '-'}</Text>
                    <Text style={styles.hCol}>{eq.SUPNAME ?? eq.supplier ?? '-'}</Text>
                    <Text style={styles.hCol}>{eq.QTY ?? eq.qty ?? '-'}</Text>
                    <Text style={styles.hCol}>{eq.UNIT ?? eq.unit ?? '-'}</Text>
                    <Text style={styles.hCol}>{eq.RATE ?? eq.rate ?? '-'}</Text>
                    <View style={[styles.hCol, styles.statusCell]}>
                      <Text style={[styles.statusText, eq.approved && styles.approved, eq.rejected && styles.rejected]}>
                        {eq.approved ? 'Approved' : eq.rejected ? 'Rejected' : 'Pending'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.hColSm}
                      onPress={() => onAttachPress(eq)}
                      hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                      <Text style={styles.attachIcon}>📎</Text>
                    </TouchableOpacity>
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
  const {title, apiUrl, isDetail, isEqDetails, isMrDetails} = props.route?.params ?? {};

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const onAttachPress = eq => {
    const eqNo = eq?.EQNO;
    const attachUrl = `${mainUrl}api/enquiry/${eqNo}/attachments`;
    console.log('[PMCommonScreen] EQ Attach: eqNo =', eqNo, '| url =', attachUrl);
    props.navigation.push('PMCommonScreen', {title: 'Enquiry Attachments', apiUrl: attachUrl, isDetail: false});
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
        console.log('[PMCommonScreen] response body =', JSON.stringify(json, null, 2));

        if (res.status !== 200) {
          throw new Error(json?.message ?? 'Request failed: ' + res.status);
        }

        setData(isDetail || isEqDetails || isMrDetails ? json.data : json.data ?? []);
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
        <ActivityIndicator style={styles.loader} size="large" color={primaryColor} />
      ) : error ? (
        <View style={styles.empty}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
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
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  loader: {flex: 1, justifyContent: 'center'},
  content: {padding: 14, paddingBottom: 30},
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
  empty: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  emptyText: {color: lightGreyTextColor, fontFamily: fonts.Lato_Regular},
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
  mrFieldsContainer: {padding: 14},
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
  cardTopRow: {flexDirection: 'row', alignItems: 'flex-start'},
  threeDot: {fontSize: 16, color: primaryColor, fontWeight: '700', lineHeight: 18},
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  mrNo: {fontSize: 15, fontFamily: fonts.Lato_Bold, color: primaryColor, marginBottom: 2},
  subText: {fontSize: 13, fontFamily: fonts.Lato_Regular, color: darkGreyTextColor},
  subTextLight: {fontSize: 13, fontFamily: fonts.Lato_Regular, color: lightGreyTextColor, marginTop: 2},
  arrow: {fontSize: 14, color: primaryColor, marginLeft: 8},
  expandedContainer: {borderTopWidth: 1, borderTopColor: '#eee'},
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: primaryColor,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRow: {flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 10, alignItems: 'flex-start'},
  tableRowAlt: {backgroundColor: '#f9f9f9'},
  col: {flex: 1, fontSize: 12, color: BlackColor, fontFamily: fonts.Lato_Regular},
  hCol: {width: 110, fontSize: 12, color: BlackColor, fontFamily: fonts.Lato_Regular, paddingRight: 6},
  hColSm: {width: 54, fontSize: 12, color: BlackColor, fontFamily: fonts.Lato_Regular, alignItems: 'center'},
  colHeader: {color: whiteColor, fontFamily: fonts.Lato_Bold, fontSize: 12},
  statusCell: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  statusText: {fontSize: 12, fontFamily: fonts.Lato_Regular, color: BlackColor},
  approved: {color: '#006B38'},
  rejected: {color: '#cc0000'},
  attachIcon: {fontSize: 15, lineHeight: 20},
});

export default PMCommonScreen;
