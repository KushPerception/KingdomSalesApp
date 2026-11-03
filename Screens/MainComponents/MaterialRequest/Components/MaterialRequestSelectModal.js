import React from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlackColor, primaryColor } from '../../../../utility/colors';

const MaterialRequestSelectModal = ({
  visible,
  items,
  selectedValue,
  keyExtractor,
  onSelect,
  onClose,
}) => (
  <Modal
    transparent
    visible={visible}
    animationType="fade"
    onRequestClose={onClose}
  >
    <TouchableOpacity style={styles.overlay} onPress={onClose}>
      <View style={styles.dropdownMenu}>
        <FlatList
          data={items}
          keyExtractor={(item, idx) => keyExtractor(item) + idx}
          renderItem={({ item }) => {
            const label = keyExtractor(item);
            return (
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  selectedValue === label && styles.menuItemActive,
                ]}
                onPress={() => onSelect(label)}
              >
                <Text
                  style={[
                    styles.menuItemText,
                    selectedValue === label && styles.menuItemTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </TouchableOpacity>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  dropdownMenu: {
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 5,
    maxHeight: 300,
  },
  menuItem: { paddingVertical: 12, paddingHorizontal: 16 },
  menuItemActive: { backgroundColor: primaryColor },
  menuItemText: { fontSize: 14, color: BlackColor },
  menuItemTextActive: { color: 'white' },
});

export default MaterialRequestSelectModal;
