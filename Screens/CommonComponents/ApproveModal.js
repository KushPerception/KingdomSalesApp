import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {BlackColor, darkGreyTextColor, primaryColor, whiteColor} from '../../utility/colors';
import {fonts} from '../../utility/GlobalStyles';

const ApproveModal = ({visible, eqNo, remarks, onChangeRemarks, onCancel, onConfirm, loading, mode = 'approve'}) => {
  const isReject = mode === 'reject';
  return (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onCancel}>
    <View style={styles.approveOverlay}>
      <View style={styles.approveBox}>
        <Text style={styles.approveTitle}>{isReject ? 'Reject' : 'Approve'}</Text>
        <Text style={styles.approveEqNo}>{eqNo}</Text>
        <TextInput
          style={styles.approveInput}
          placeholder={isReject ? 'Rejection remarks (optional)' : 'Approval remarks (optional)'}
          placeholderTextColor="#aaa"
          value={remarks}
          onChangeText={onChangeRemarks}
          multiline
          numberOfLines={3}
        />
        <View style={styles.approveActions}>
          <TouchableOpacity
            style={styles.approveCancelBtn}
            onPress={onCancel}
            disabled={loading}>
            <Text style={styles.approveCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.approveConfirmBtn, isReject && {backgroundColor: '#cc0000'}, loading && {opacity: 0.6}]}
            onPress={onConfirm}
            disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.approveConfirmText}>{isReject ? 'Reject' : 'Approve'}</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
  );
};

const styles = StyleSheet.create({
  approveOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  approveBox: {
    backgroundColor: whiteColor,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    elevation: 6,
  },
  approveTitle: {
    fontSize: 16,
    fontFamily: fonts.Lato_Bold,
    color: BlackColor,
    marginBottom: 4,
  },
  approveEqNo: {
    fontSize: 13,
    fontFamily: fonts.Lato_Regular,
    color: primaryColor,
    marginBottom: 14,
  },
  approveInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    fontFamily: fonts.Lato_Regular,
    color: BlackColor,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  approveActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  approveCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  approveCancelText: {
    fontSize: 14,
    fontFamily: fonts.Lato_Regular,
    color: darkGreyTextColor,
  },
  approveConfirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#006B38',
    minWidth: 90,
    alignItems: 'center',
  },
  approveConfirmText: {
    fontSize: 14,
    fontFamily: fonts.Lato_Bold,
    color: whiteColor,
  },
});

export default ApproveModal;
