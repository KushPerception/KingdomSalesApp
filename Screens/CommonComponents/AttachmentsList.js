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

// Attachments fetched from the API no longer carry their file content inline
// — the list endpoint returns metadata only (name/date/size/SLN0), and the
// actual Base64 is fetched lazily per-attachment via `attachmentModule` +
// SLN0 (see AttachmentImageViewer / utility/ApiHelpers/AttachmentsApi).
const hasPreviewableFile = attachment =>
  !!(attachment.ATTACHFILE || attachment.SLN0 || attachment.SLNO);

// One attachment card: name, "date · size" meta line, and an inline preview
// (image thumbnail or document tile). Used for every screen that lists
// attachments fetched from the API.
export const AttachmentRow = ({ attachment, accentColor, style, attachmentModule }) => (
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
      {hasPreviewableFile(attachment) && (
        <View style={styles.preview}>
          <AttachmentImageViewer
            attachment={attachment}
            attachmentModule={attachmentModule}
          />
        </View>
      )}
    </View>
  </View>
);

// Standalone virtualized attachment list with the standard empty state. Use
// this when a screen shows nothing but the attachments (no extra
// header/footer content); otherwise render <AttachmentRow> inside your own
// FlatList. `attachmentModule` selects which module's file endpoint to call
// (e.g. "material-request", "purchase-order", "enquiry").
const AttachmentsList = ({
  data,
  emptyText = 'No attachments found.',
  contentContainerStyle,
  attachmentModule,
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
      renderItem={({ item }) => (
        <AttachmentRow attachment={item} attachmentModule={attachmentModule} />
      )}
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
