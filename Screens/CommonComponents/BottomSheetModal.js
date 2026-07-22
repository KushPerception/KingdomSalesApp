import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {BlackColor, whiteColor} from '../../utility/colors';
import {fonts} from '../../utility/GlobalStyles';

/**
 * buttons: Array<{ label: string, onPress: () => void, accent?: bool, danger?: bool }>
 */
const BottomSheetModal = ({visible, onClose, buttons}) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}>
    <Pressable style={styles.overlay} onPress={onClose} />
    <View style={styles.sheet}>
      <View style={styles.sheetHandle} />
      {buttons.filter(btn => !btn.hidden).map(btn => (
        <TouchableOpacity
          key={btn.label}
          style={[
            styles.sheetBtn,
            btn.accent && styles.sheetBtnAccent,
            btn.danger && styles.sheetBtnDanger,
            btn.disabled && styles.sheetBtnDisabled,
          ]}
          onPress={btn.disabled ? undefined : btn.onPress}
          disabled={btn.disabled}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.sheetBtnText,
              btn.accent && styles.sheetBtnTextAccent,
              btn.danger && styles.sheetBtnTextDanger,
              btn.disabled && styles.sheetBtnTextDisabled,
            ]}>
            {btn.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.35)'},
  sheet: {
    backgroundColor: whiteColor,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetBtn: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sheetBtnAccent: {borderBottomWidth: 0, marginTop: 4},
  sheetBtnDanger: {borderBottomWidth: 0, marginTop: 4},
  sheetBtnText: {
    fontSize: 15,
    fontFamily: fonts.Lato_Regular,
    color: BlackColor,
  },
  sheetBtnDisabled: {opacity: 0.4},
  sheetBtnTextDisabled: {color: '#999'},
  sheetBtnTextDanger: {color: '#cc0000', fontFamily: fonts.Lato_Bold},
});

export default BottomSheetModal;
