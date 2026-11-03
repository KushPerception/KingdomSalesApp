import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DeleteIcon } from '../../Images';
import AttachmentImageViewer from './AttachmentImageViewer';
import {
  BlackColor,
  darkGreyTextColor,
  lightGreyTextColor,
  primaryColor,
  whiteColor,
} from '../../utility/colors';
import { fonts } from '../../utility/GlobalStyles';

// Attachments fetched from the API no longer carry their file content inline
// — the list endpoint returns metadata only (name/description/SLN0), and the
// actual Base64 is fetched lazily per-attachment via `attachmentModule` +
// SLN0 (see AttachmentImageViewer / utility/ApiHelpers/AttachmentsApi).
const hasPreviewableFile = attachment =>
  !!(attachment.ATTACHFILE || attachment.SLN0 || attachment.SLNO);

// One attachment card: name, description, and an inline preview (image
// thumbnail or document tile). Date/size are intentionally not shown.
export const AttachmentRow = ({
  attachment,
  accentColor,
  style,
  attachmentModule,
  onDelete,
}) => (
  <View
    style={[
      styles.card,
      accentColor && { borderLeftColor: accentColor },
      style,
    ]}
  >
    {!!onDelete && (
      <TouchableOpacity style={styles.deleteIcon} onPress={onDelete}>
        <Image source={DeleteIcon} style={styles.deleteIconImg} tintColor="#e74c3c" />
      </TouchableOpacity>
    )}
    <View style={styles.info}>
      {!!attachment.DESCRIPTION && (
        <Text style={styles.description}>
          <Text style={styles.descriptionLabel}>Description: </Text>
          {attachment.DESCRIPTION}
        </Text>
      )}
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
  description: {
    fontSize: 12,
    fontFamily: fonts.Lato_Regular,
    color: BlackColor,
    marginTop: 4,
  },
  descriptionLabel: {
    fontFamily: fonts.Lato_Bold,
    color: darkGreyTextColor,
  },
  preview: { marginTop: 8 },
  deleteIcon: { position: 'absolute', top: 8, right: 8, zIndex: 1 },
  deleteIconImg: { width: 18, height: 18 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: lightGreyTextColor, fontFamily: fonts.Lato_Regular },
});

export default AttachmentsList;
