import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
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
import RNBlobUtil from 'react-native-blob-util';
import { BlackColor, primaryColor } from '../../../utility/colors';
import HeaderComponent from '../../CommonComponents/Header';
import {
  mainUrl,
  submitMaterialRequest,
} from '../../../utility/ApiHelpers/StagingApis';

const ALLOWED_TYPES = ['pdf', 'jpg', 'jpeg', 'png', 'docx', 'xlsx', 'xls'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const MaterialRequestAttachment = props => {
  const { mrNo, payload } = props.route?.params ?? {};
  // each file: { name, uri, type, size, uploaded: bool, uploading: bool, error: string|null }
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mrSubmitted, setMrSubmitted] = useState(false);

  const uploadAttachment = async (file, token) => {
    const url = `${mainUrl}api/material-request/${mrNo}/attachments`;
    console.log('[uploadAttachment] start', JSON.stringify({
      url,
      mrNo,
      hasToken: !!token,
      tokenPreview: token ? `${token.slice(0, 10)}...${token.slice(-6)}` : null,
      fileName: file.name,
      fileUri: file.uri,
      fileType: file.type,
      fileSizeBytes: file.size,
    },null,2));

    let base64Data;
    try {
      base64Data = await RNBlobUtil.fs.readFile(file.uri, 'base64');
    } catch (readErr) {
          console.log('[uploadAttachment] readFile FAILED', JSON.stringify({
            fileName: file.name,
            fileUri: file.uri,
            error: readErr?.message ?? String(readErr),
          },null,2));
      throw readErr;
    }
    console.log('[uploadAttachment] read file as base64', JSON.stringify({
      fileName: file.name,
      base64Length: base64Data?.length,
      base64Preview: base64Data?.slice(0, 30),
    },null,2));

    const formData = new FormData();
    formData.append('file', base64Data);
    formData.append('filename', file.name);

    const startedAt = Date.now();
    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
        },
        body: formData,
      });
    } catch (fetchErr) {
      console.log('[uploadAttachment] fetch THREW (network-level failure)', JSON.stringify({
        fileName: file.name,
        durationMs: Date.now() - startedAt,
        error: fetchErr?.message ?? String(fetchErr),
      },null,2));
      throw fetchErr;
    }

    const durationMs = Date.now() - startedAt;
    const responseHeaders = {};
    res.headers?.forEach?.((value, key) => {
      responseHeaders[key] = value;
    });
    console.log('[uploadAttachment] response received', JSON.stringify({
      fileName: file.name,
      status: res.status,
      durationMs,
      responseHeaders,
    },null,2));

    if (res.status !== 200 && res.status !== 201) {
      const errText = await res.text();
      console.log('[uploadAttachment] FAILED response body', JSON.stringify({
        fileName: file.name,
        status: res.status,
        body: errText,
      },null,2));
      throw new Error(
        `Upload failed for ${file.name}: ${res.status} ${errText}`,
      );
    }

    const okText = await res.text();
    console.log('[uploadAttachment] SUCCESS response body', JSON.stringify({
      fileName: file.name,
      status: res.status,
      body: okText,
    },null,2));
    return true;
  };

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
      { ...file, uploaded: false, uploading: false, error: null },
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
    if (files.length === 0) {
      Alert.alert('Validation', 'Please add at least one attachment.');
      return;
    }
    setLoading(true);
    console.log('[handleSubmit] start', JSON.stringify({
      mrNo,
      mrSubmitted,
      totalFiles: files.length,
      files: files.map(f => ({
        name: f.name,
        size: f.size,
        uploaded: f.uploaded,
      })),
    }, null, 2));
    try {
      const token = await AsyncStorage.getItem('access_token');
      console.log('[handleSubmit] token loaded', { hasToken: !!token });

      // Step 1: Submit the material request (only once, even on retry)
      if (!mrSubmitted) {
        console.log(
          '[handleSubmit] submitting MR payload:',
          JSON.stringify(payload, null, 2),
        );
        const mrResponse = await submitMaterialRequest(token, payload);
        console.log(
          '[handleSubmit] submitMaterialRequest response:',
          JSON.stringify(mrResponse,null,2),
        );
        setMrSubmitted(true);
      } else {
        console.log(
          '[handleSubmit] MR already submitted, skipping submitMaterialRequest',
        );
      }

      // Step 2: Upload each attachment individually, tracking failures per file
      const pendingFiles = files.filter(f => !f.uploaded);
      const failedFileNames = [];
      console.log(
        '[handleSubmit] pending attachment uploads:',
        pendingFiles.map(f => f.name),
      );

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
          console.error(`Attachment upload failed for ${file.name}:`, e);
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

      console.log('[handleSubmit] done', JSON.stringify({
        totalPending: pendingFiles.length,
        succeeded: pendingFiles.length - failedFileNames.length,
        failed: failedFileNames,
      }, null, 2));

      if (failedFileNames.length > 0) {
        Alert.alert(
          'Some Attachments Failed',
          `Material request submitted, but the following attachment(s) failed to upload:\n\n${failedFileNames.join(
            '\n',
          )}\n\nTap SUBMIT again to retry the failed uploads.`,
        );
      } else {
        Alert.alert('Success', 'Material request submitted successfully.', [
          {
            text: 'OK',
            onPress: () => props.navigation.navigate('MaterialRequestList'),
          },
        ]);
      }
    } catch (e) {
      console.log('[handleSubmit] outer catch - unexpected error', JSON.stringify({
        error: e?.message ?? String(e),
        stack: e?.stack,
      }, null, 2));
      console.error('handleSubmit error:', e);
      Alert.alert(
        'Error',
        e.message ?? 'Something went wrong. Please try again.',
      );
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
        {files.length === 0 ? (
          <Text style={styles.emptyText}>No attachments added</Text>
        ) : (
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
});

export default MaterialRequestAttachment;
