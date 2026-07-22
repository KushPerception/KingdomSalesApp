import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import {
  pick,
  types as documentTypes,
  keepLocalCopy,
  isErrorWithCode,
  errorCodes,
} from '@react-native-documents/picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { BlackColor, primaryColor } from '../../../utility/colors';
import AttachmentImageViewer from '../../CommonComponents/AttachmentImageViewer';
import HeaderComponent from '../../CommonComponents/Header';
import {
  submitMaterialRequest,
  updateMaterialRequest,
  getMaterialRequestAttachments,
  uploadMaterialRequestAttachment,
} from '../../../utility/ApiHelpers/MaterialRequestApi';

const ALLOWED_TYPES = ['pdf', 'jpg', 'jpeg', 'png', 'docx', 'xlsx', 'xls'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_ATTACH_NAME_LENGTH = 50; // backend ATTACHNAME column is 50 chars (including extension)

const sanitizeFileName = originalName => {
  if (!originalName) return `file_${Date.now()}`;
  if (originalName.length <= MAX_ATTACH_NAME_LENGTH) return originalName;
  const dotIndex = originalName.lastIndexOf('.');
  const ext = dotIndex !== -1 ? originalName.slice(dotIndex) : '';
  const base = dotIndex !== -1 ? originalName.slice(0, dotIndex) : originalName;
  const maxBaseLength = Math.max(MAX_ATTACH_NAME_LENGTH - ext.length, 1);
  return base.slice(0, maxBaseLength) + ext;
};

const MaterialRequestAttachment = props => {
  const { mrNo, payload, isEdit } = props.route?.params ?? {};
  // each file: { name, uri, type, size, uploaded: bool, uploading: bool, error: string|null }
  const [files, setFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingExisting, setFetchingExisting] = useState(false);
  const [mrSubmitted, setMrSubmitted] = useState(false);

  useEffect(() => {
    if (isEdit && mrNo) {
      fetchExistingAttachments();
    }
  }, []);

  const fetchExistingAttachments = async () => {
    setFetchingExisting(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await getMaterialRequestAttachments(token, mrNo);
      if (res?.success) setExistingAttachments(res.data ?? []);
    } catch (e) {
      Alert.alert('Error', 'Failed to load existing attachments.');
    } finally {
      setFetchingExisting(false);
    }
  };

  const uploadAttachment = (file, token) =>
    uploadMaterialRequestAttachment(token, mrNo, file);

  const validateAndAdd = file => {
    const ext = file.name?.split('.').pop()?.toLowerCase();
    if (!ALLOWED_TYPES.includes(ext)) {
      Alert.alert('Invalid File', `Allowed types: ${ALLOWED_TYPES.join(', ')}`);
      return;
    }
    if (file.size > MAX_SIZE) {
      Alert.alert('File Too Large', 'Max file size is 10MB.');
      return;
    }
    setFiles(prev => [
      ...prev,
      {
        ...file,
        name: sanitizeFileName(file.name),
        uploaded: false,
        uploading: false,
        error: null,
      },
    ]);
  };

  const pickDocument = async () => {
    try {
      const [file] = await pick({
        type: [documentTypes.allFiles],
      });
      const [copyResult] = await keepLocalCopy({
        files: [{ uri: file.uri, fileName: file.name ?? 'document' }],
        destination: 'cachesDirectory',
      });
      if (copyResult.status !== 'success') {
        throw new Error(copyResult.copyError);
      }
      validateAndAdd({
        name: file.name,
        uri: copyResult.localUri,
        type: file.type,
        size: file.size,
      });
    } catch (e) {
      if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) {
        return;
      }
      Alert.alert('Error', 'Failed to pick document.');
    }
  };

  const pickFromCamera = () => {
    launchCamera({ mediaType: 'photo', quality: 0.8 }, response => {
      if (response.didCancel || response.errorCode) return;
      const asset = response.assets?.[0];
      if (asset) {
        validateAndAdd({
          name: asset.fileName ?? `photo_${Date.now()}.jpg`,
          uri: asset.uri,
          type: asset.type ?? 'image/jpeg',
          size: asset.fileSize ?? 0,
        });
      }
    });
  };

  const pickFromGallery = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, response => {
      if (response.didCancel || response.errorCode) return;
      const asset = response.assets?.[0];
      if (asset) {
        validateAndAdd({
          name: asset.fileName ?? `image_${Date.now()}.jpg`,
          uri: asset.uri,
          type: asset.type ?? 'image/jpeg',
          size: asset.fileSize ?? 0,
        });
      }
    });
  };

  const removeFile = idx => setFiles(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');

      if (!mrSubmitted) {
        if (isEdit) {
          await updateMaterialRequest(token, mrNo, payload);
        } else {
          await submitMaterialRequest(token, payload);
        }
        setMrSubmitted(true);
      }

      const pendingFiles = files.filter(f => !f.uploaded);
      const failedFileNames = [];

      for (const file of pendingFiles) {
        setFiles(prev =>
          prev.map(f =>
            f.uri === file.uri ? { ...f, uploading: true, error: null } : f,
          ),
        );
        try {
          await uploadAttachment(file, token);
          setFiles(prev =>
            prev.map(f =>
              f.uri === file.uri
                ? { ...f, uploaded: true, uploading: false, error: null }
                : f,
            ),
          );
        } catch (e) {
          const errorMessage = e?.message ?? 'Upload failed';
          setFiles(prev =>
            prev.map(f =>
              f.uri === file.uri
                ? {
                    ...f,
                    uploaded: false,
                    uploading: false,
                    error: errorMessage,
                  }
                : f,
            ),
          );
          failedFileNames.push(file.name);
        }
      }

      if (failedFileNames.length > 0) {
        Alert.alert(
          'Some Attachments Failed',
          `${
            isEdit ? 'Attachments' : 'Material request submitted'
          }, but the following attachment(s) failed to upload:\n\n${failedFileNames.join(
            '\n',
          )}\n\nTap SUBMIT again to retry the failed uploads.`,
        );
      } else {
        Alert.alert(
          'Success',
          isEdit
            ? 'Material request updated successfully.'
            : 'Material request submitted successfully.',
          [
            {
              text: 'OK',
              onPress: () => props.navigation.navigate('MaterialRequestList'),
            },
          ],
        );
      }
    } catch (e) {
      if (isEdit && /not\s*allow|editable|forward/i.test(e?.message ?? '')) {
        Alert.alert(
          'Editing Not Allowed',
          'The MR request forwarded to the Purchase Department.',
        );
      } else {
        Alert.alert(
          'Error',
          e.message ?? 'Something went wrong. Please try again.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const showPickerOptions = () => {
    Alert.alert('Add Attachment', 'Choose source', [
      { text: 'Camera', onPress: pickFromCamera },
      { text: 'Gallery', onPress: pickFromGallery },
      { text: 'Document', onPress: pickDocument },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      <HeaderComponent
        BackTitle={true}
        Title="Attachments"
        onBackPress={() => props.navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {fetchingExisting && (
          <ActivityIndicator
            color={primaryColor}
            style={{ marginVertical: 16 }}
          />
        )}

        {existingAttachments.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Existing Attachments</Text>
            {existingAttachments.map((att, idx) => (
              <View
                key={`existing-${idx}`}
                style={[styles.fileCard, { borderLeftColor: '#27ae60' }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {att.ATTACHNAME}
                  </Text>
                  <Text style={styles.fileSize}>
                    {att.ATTACHDATE?.split(' ')[0]} ·{' '}
                    {(parseInt(att.ATTACHSIZE, 10) / 1024).toFixed(1)} KB
                  </Text>
                  {att.ATTACHFILE ? (
                    <View style={{ marginTop: 8 }}>
                      <AttachmentImageViewer attachment={att} />
                    </View>
                  ) : null}
                </View>
              </View>
            ))}
          </>
        )}

        {(existingAttachments.length > 0 || isEdit) && (
          <Text style={styles.sectionLabel}>New Attachments</Text>
        )}

        {files.length === 0 && !isEdit ? (
          <Text style={styles.emptyText}>No attachments added</Text>
        ) : files.length === 0 && isEdit ? null : (
          files.map((file, idx) => (
            <View key={idx} style={styles.fileCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.name}
                </Text>
                <Text
                  style={[
                    styles.fileSize,
                    file.uploading && { color: '#f39c12' },
                    file.error && { color: '#e74c3c' },
                  ]}
                >
                  {file.uploading
                    ? 'Uploading...'
                    : file.uploaded
                    ? `${(file.size / 1024).toFixed(1)} KB ✓`
                    : file.error
                    ? 'Upload failed ✗'
                    : `${(file.size / 1024).toFixed(1)} KB`}
                </Text>
                <View style={{ marginTop: 8 }}>
                  <AttachmentImageViewer attachment={file} />
                </View>
              </View>
              <TouchableOpacity
                onPress={() => removeFile(idx)}
                style={styles.removeBtn}
                disabled={loading}
              >
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <TouchableOpacity
          style={styles.addBtn}
          onPress={showPickerOptions}
          disabled={loading}
        >
          <Text style={styles.addBtnText}>+ Add Attachment</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          Allowed: pdf, jpg, jpeg, png, docx, xlsx, xls · Max 10MB each
        </Text>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitBtnText}>SUBMIT</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 40 },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#aaa',
    fontSize: 14,
  },
  fileCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: primaryColor,
  },
  fileName: { fontSize: 13, fontWeight: '600', color: BlackColor },
  fileSize: { fontSize: 11, color: '#888', marginTop: 2 },
  removeBtn: { padding: 4 },
  removeBtnText: { fontSize: 16, color: '#e74c3c' },
  addBtn: {
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: primaryColor,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addBtnText: { color: primaryColor, fontWeight: '600', fontSize: 14 },
  hint: {
    fontSize: 11,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  submitBtn: {
    backgroundColor: primaryColor,
    borderRadius: 6,
    paddingVertical: 13,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    marginBottom: 8,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default MaterialRequestAttachment;
