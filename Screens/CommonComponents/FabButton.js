import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { primaryColor } from '../../utility/colors';

const FabButton = ({ onPress, disabled, style, iconStyle, icon = '+' }) => (
  <TouchableOpacity
    style={[styles.fab, style]}
    activeOpacity={0.8}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={[styles.fabIcon, iconStyle]}>{icon}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10,
  },
  fabIcon: {
    fontSize: 28,
    color: 'white',
    lineHeight: 32,
  },
});

export default FabButton;
