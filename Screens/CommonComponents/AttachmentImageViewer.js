import React, { useState, useCallback, memo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import RNBlobUtil from 'react-native-blob-util';
import { primaryColor } from '../../utility/colors';

const FILE_CONFIG = {
  '.jpg':  { mime: 'image/jpeg',       type: 'image' },
  '.jpeg': { mime: 'image/jpeg',       type: 'image' },
  '.png':  { mime: 'image/png',        type: 'image' },
  '.gif':  { mime: 'image/gif',        type: 'image' },
  '.pdf':  { mime: 'application/pdf',  type: 'document', icon: '📄', label: 'PDF' },
  '.docx': { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', type: 'document', icon: '📝', label: 'Word' },
  '.xlsx': { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', type: 'document', icon: '📊', label: 'Excel' },
  '.xls':  { mime: 'application/vnd.ms-excel', type: 'document', icon: '📊', label: 'Excel' },
};

const getConfig = ext => {
  if (!ext) return null;
  const key = ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`;
  return FILE_CONFIG[key] ?? null;
};

// ─── Document Tile ────────────────────────────────────────────────────────────
const DocumentTile = memo(({ name, ext, base64, localUri }) => {
  const config = getConfig(ext);
  const [opening, setOpening] = useState(false);

  const openDocument = useCallback(async () => {
    setOpening(true);
    try {
      const extClean = ext?.replace('.', '') ?? 'bin';
      const fileName = `attachment_${Date.now()}.${extClean}`;
      const destPath = `${RNBlobUtil.fs.dirs.CacheDir}/${fileName}`;

      if (localUri) {
        // new file — already on disk, open directly
        const src = localUri.replace('file://', '');
        if (Platform.OS === 'android') {
          await RNBlobUtil.android.actionViewIntent(src, config.mime);
        } else {
          await RNBlobUtil.ios.openDocument(src);
        }
      } else if (base64) {
        // existing file — write Base64 to cache then open
        await RNBlobUtil.fs.writeFile(destPath, base64, 'base64');
        if (Platform.OS === 'android') {
          await RNBlobUtil.android.actionViewIntent(destPath, config.mime);
        } else {
          await RNBlobUtil.ios.openDocument(destPath);
        }
      } else {
        Alert.alert('Unavailable', 'File data is not available.');
      }
    } catch {
      Alert.alert('Error', 'Could not open the file. Make sure a compatible app is installed.');
    } finally {
      setOpening(false);
    }
  }, [base64, localUri, ext, config]);

  return (
    <TouchableOpacity
      style={styles.docTile}
      onPress={openDocument}
      activeOpacity={0.75}
      disabled={opening}
    >
      <Text style={styles.docIcon}>{config?.icon ?? '📎'}</Text>
      <View style={styles.docInfo}>
        <Text style={styles.docLabel}>{config?.label ?? ext?.toUpperCase()}</Text>
        <Text style={styles.docName} numberOfLines={1}>{name}</Text>
      </View>
      {opening
        ? <ActivityIndicator size="small" color={primaryColor} />
        : <Text style={styles.docOpen}>Open ›</Text>
      }
    </TouchableOpacity>
  );
});

// ─── Image Tile ───────────────────────────────────────────────────────────────
const ImageTile = memo(({ ext, base64, localUri }) => {
  const config = getConfig(ext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);

  // prefer local URI for new files, fall back to Base64 data URI for existing
  const uri = localUri
    ? (localUri.startsWith('file://') ? localUri : `file://${localUri}`)
    : (base64 ? `data:${config.mime};base64,${base64}` : null);

  const handleLoad = useCallback(() => setLoading(false), []);
  const handleError = useCallback(() => { setLoading(false); setError(true); }, []);
  const open = useCallback(() => setFullScreen(true), []);
  const close = useCallback(() => setFullScreen(false), []);

  if (!uri || error) {
    return (
      <View style={styles.errorBox}>
        <Text style={styles.errorText}>⚠ Image unavailable</Text>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity onPress={open} activeOpacity={0.85} style={styles.imgWrapper}>
        {loading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator color={primaryColor} />
          </View>
        )}
        <Image
          source={{ uri }}
          style={styles.thumbnail}
          onLoad={handleLoad}
          onError={handleError}
          resizeMode="cover"
          fadeDuration={0}
        />
        {!loading && (
          <View style={styles.tapHint}>
            <Text style={styles.tapHintText}>Tap to expand</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={fullScreen} transparent animationType="fade" onRequestClose={close}>
        <ImageViewer
          imageUrls={[{ url: uri }]}
          enableSwipeDown
          onSwipeDown={close}
          renderHeader={() => (
            <TouchableOpacity style={styles.closeBtn} onPress={close}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          )}
          backgroundColor="rgba(0,0,0,0.95)"
        />
      </Modal>
    </>
  );
});

// ─── Main Export ──────────────────────────────────────────────────────────────
// Accepts two shapes:
//   existing attachment: { ATTACHFILE, ATTACHEXT, ATTACHNAME }
//   new local file:      { uri, name, type }   (from picker)
const AttachmentImageViewer = memo(({ attachment }) => {
  if (!attachment) return null;

  // normalise both shapes into common fields
  const ext = attachment.ATTACHEXT
    ?? (attachment.name ? `.${attachment.name.split('.').pop()}` : null);
  const name = attachment.ATTACHNAME ?? attachment.name ?? '';
  const base64 = attachment.ATTACHFILE ?? null;
  const localUri = attachment.uri ?? null;

  const config = getConfig(ext);
  if (!config) return null;

  return config.type === 'image'
    ? <ImageTile ext={ext} base64={base64} localUri={localUri} />
    : <DocumentTile name={name} ext={ext} base64={base64} localUri={localUri} />;
});

const THUMB = 120;

const styles = StyleSheet.create({
  imgWrapper: {
    width: THUMB, height: THUMB,
    borderRadius: 6, overflow: 'hidden', backgroundColor: '#eee',
  },
  thumbnail: { width: THUMB, height: THUMB },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#f0f0f0', zIndex: 1,
  },
  tapHint: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.35)', paddingVertical: 3, alignItems: 'center',
  },
  tapHintText: { color: '#fff', fontSize: 10 },
  errorBox: {
    width: THUMB, height: THUMB, borderRadius: 6,
    backgroundColor: '#fdecea', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#e74c3c',
  },
  errorText: { color: '#e74c3c', fontSize: 11, textAlign: 'center', paddingHorizontal: 6 },
  closeBtn: {
    position: 'absolute', top: 44, right: 16, zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20,
    width: 36, height: 36, justifyContent: 'center', alignItems: 'center',
  },
  closeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  docTile: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f4f4f4', borderRadius: 8,
    paddingVertical: 10, paddingHorizontal: 12,
    borderWidth: 1, borderColor: '#e0e0e0',
    marginTop: 6,
  },
  docIcon: { fontSize: 28, marginRight: 10 },
  docInfo: { flex: 1 },
  docLabel: { fontSize: 11, fontWeight: '700', color: primaryColor, textTransform: 'uppercase' },
  docName: { fontSize: 12, color: '#444', marginTop: 1 },
  docOpen: { fontSize: 13, color: primaryColor, fontWeight: '600', marginLeft: 8 },
});

export default AttachmentImageViewer;
