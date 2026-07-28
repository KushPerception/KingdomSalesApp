import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import AttachmentImageViewer from './AttachmentImageViewer';
import {
  BlackColor,
  lightGreyTextColor,
  primaryColor,
  whiteColor,
} from '../../utility/colors';
import { fonts } from '../../utility/GlobalStyles';

export const formatFileSizeKB = bytes => {
  const n = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  return Number.isFinite(n) ? `${(n / 1024).toFixed(1)} KB` : null;
};

// One attachment card: name, "date · size" meta line, and an inline preview
// (image thumbnail or document tile). Used for every screen that lists
// attachments fetched from the API (ATTACHNAME/ATTACHDATE/ATTACHSIZE/ATTACHFILE).
export const AttachmentRow = ({ attachment, accentColor, style }) => (
  <View
    style={[
      styles.card,
      accentColor && { borderLeftColor: accentColor },
      style,
    ]}
  >
    <View style={styles.info}>
      <Text style={styles.name} numberOfLines={1}>
        {attachment.ATTACHNAME}
      </Text>
      <Text style={styles.meta}>
        {[
          attachment.ATTACHDATE?.split(' ')[0],
          formatFileSizeKB(attachment.ATTACHSIZE),
        ]
          .filter(Boolean)
          .join(' · ')}
      </Text>
      {attachment.ATTACHFILE && (
        <View style={styles.preview}>
          <AttachmentImageViewer attachment={attachment} />
        </View>
      )}
    </View>
  </View>
);

const renderItem = ({ item }) => <AttachmentRow attachment={item} />;

// Standalone virtualized attachment list with the standard empty state. Use
// this when a screen shows nothing but the attachments (no extra
// header/footer content); otherwise render <AttachmentRow> inside your own
// FlatList.
const AttachmentsList = ({
  data,
  emptyText = 'No attachments found.',
  contentContainerStyle,
}) => {
  if (!data?.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    );
  }
  return (
    <FlatList
      data={data}
      keyExtractor={(_, i) => String(i)}
      renderItem={renderItem}
      contentContainerStyle={contentContainerStyle ?? styles.content}
      initialNumToRender={4}
      maxToRenderPerBatch={4}
      windowSize={5}
      removeClippedSubviews
    />
  );
};

const styles = StyleSheet.create({
  content: { padding: 14, paddingBottom: 30 },
  card: {
    backgroundColor: whiteColor,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: primaryColor,
  },
  info: { flex: 1 },
  name: { fontSize: 13, fontFamily: fonts.Lato_Bold, color: BlackColor },
  meta: {
    fontSize: 11,
    fontFamily: fonts.Lato_Regular,
    color: lightGreyTextColor,
    marginTop: 2,
  },
  preview: { marginTop: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: lightGreyTextColor, fontFamily: fonts.Lato_Regular },
});

export default AttachmentsList;
