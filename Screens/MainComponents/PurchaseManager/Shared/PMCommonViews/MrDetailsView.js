import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { mainUrl } from '../../../../../utility/ApiHelpers/StagingApis';
import { primaryColor } from '../../../../../utility/colors';
import { fonts } from '../../../../../utility/GlobalStyles';
import {
  ArrayTable,
  EmptyState,
  MR_HIDDEN_FIELDS,
  Row,
  humanizeKey,
  styles as sharedStyles,
  visibleColumns,
} from './shared';

const MrDetailsView = ({ data, navigation }) => {
  const [expandedKey, setExpandedKey] = useState(null);

  if (!data?.length) return <EmptyState text="No MR details found." />;

  const renderMrItem = ({ item, index }) => {
    const fields = Object.entries(item).filter(
      ([k, v]) =>
        !Array.isArray(v) && typeof v !== 'object' && !MR_HIDDEN_FIELDS.has(k),
    );
    const arrays = Object.entries(item).filter(
      ([, v]) => Array.isArray(v) && v.length > 0,
    );
    const mrNo = item.MRNO ?? item.mrno ?? item.mr_no;

    return (
      <View style={sharedStyles.card}>
        {/* Always visible flat fields */}
        <View style={styles.mrFieldsContainer}>
          {fields.map(([k, v]) => (
            <Row key={k} label={humanizeKey(k)} value={v} />
          ))}
          {!!mrNo && (
            <TouchableOpacity
              style={styles.mrAttachBtn}
              onPress={() =>
                navigation.push('PMCommonScreen', {
                  title: 'MR Attachments',
                  apiUrl: `${mainUrl}api/material-request/${mrNo}/attachments`,
                  isDetail: false,
                })
              }
              activeOpacity={0.75}
            >
              <Text style={styles.mrAttachBtnText}>📎 MR Attachments</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Each array section has its own expand toggle */}
        {arrays.map(([k, arr]) => {
          const key = `${index}_${k}`;
          const isExpanded = expandedKey === key;
          // Unlike DetailView/EnqDetailView, MR item arrays keep their
          // approval-flag columns (e.g. "status") visible on purpose.
          const cols = visibleColumns(arr[0], new Set());
          return (
            <View key={k}>
              <TouchableOpacity
                style={styles.sectionToggle}
                onPress={() => setExpandedKey(isExpanded ? null : key)}
                activeOpacity={0.7}
              >
                <Text style={sharedStyles.sectionTitle}>{humanizeKey(k)}</Text>
                <Text style={sharedStyles.arrow}>{isExpanded ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {isExpanded && (
                <View style={sharedStyles.expandedContainer}>
                  <ArrayTable cols={cols} rows={arr} />
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
      contentContainerStyle={sharedStyles.content}
    />
  );
};

const styles = StyleSheet.create({
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
  mrAttachBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#f0ebff',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: primaryColor,
  },
  mrAttachBtnText: {
    fontSize: 12,
    fontFamily: fonts.Lato_Bold,
    color: primaryColor,
  },
});

export default MrDetailsView;
