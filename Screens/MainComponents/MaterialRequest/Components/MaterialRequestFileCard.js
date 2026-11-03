import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlackColor, primaryColor } from '../../../../utility/colors';
import AttachmentImageViewer from '../../../CommonComponents/AttachmentImageViewer';

const MaterialRequestFileCard = ({
  file,
  loading,
  onChangeDescription,
  onRemove,
}) => (
  <View style={styles.fileCard}>
    <View style={{ flex: 1 }}>
      <AttachmentImageViewer attachment={file} />
      <TextInput
        style={styles.descriptionInput}
        placeholder="Description (required)"
        placeholderTextColor="#aaa"
        value={file.description}
        onChangeText={onChangeDescription}
        editable={!loading}
      />
      {!!(file.uploading || file.uploaded || file.error) && (
        <Text
          style={[
            styles.fileStatus,
            file.uploading && styles.fileStatusUploading,
            file.error && styles.fileStatusError,
          ]}
        >
          {file.uploading
            ? 'Uploading...'
            : file.uploaded
            ? 'Uploaded ✓'
            : 'Upload failed ✗'}
        </Text>
      )}
    </View>
    <TouchableOpacity
      onPress={onRemove}
      style={styles.removeBtn}
      disabled={loading}
    >
      <Text style={styles.removeBtnText}>✕</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  fileCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: primaryColor,
  },
  descriptionInput: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: BlackColor,
  },
  fileStatus: { fontSize: 11, color: '#888', marginTop: 6 },
  fileStatusUploading: { color: '#f39c12' },
  fileStatusError: { color: '#e74c3c' },
  removeBtn: { padding: 4 },
  removeBtnText: { fontSize: 16, color: '#e74c3c' },
});

export default MaterialRequestFileCard;
