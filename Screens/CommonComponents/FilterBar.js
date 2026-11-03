import moment from 'moment';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { TextInput } from 'react-native-gesture-handler';
import { searchIcon } from '../../Images';
import { BlackColor, primaryColor } from '../../utility/colors';
import { fonts } from '../../utility/GlobalStyles';

const FilterBar = ({
  searchByOptions,
  searchBy,
  onChangeSearchBy,
  keyword,
  onChangeKeyword,
  fromDate,
  toDate,
  onChangeFromDate,
  onChangeToDate,
  statusOptions,
  statusFilter,
  onChangeStatus,
  onSearch,
  onClear,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  return (
    <View>
      <View style={styles.dateRow}>
        <Text style={styles.dateLabel}>From</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowFromPicker(true)}
        >
          <Text style={styles.dateText}>
            {fromDate ? moment(fromDate).format('DD/MM/YYYY') : 'From Date'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.dateLabel}>To</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowToPicker(true)}
        >
          <Text style={styles.dateText}>
            {toDate ? moment(toDate).format('DD/MM/YYYY') : 'To Date'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowDropdown(true)}
        >
          <Text style={styles.dropdownButtonText}>{searchBy}</Text>
          <Text style={styles.dropdownArrow}>▾</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search by ${searchBy}`}
          value={keyword}
          onChangeText={onChangeKeyword}
        />
        <TouchableOpacity onPress={onSearch} style={styles.searchButton}>
          <Image source={searchIcon} style={styles.searchIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {!!statusOptions && (
        <View style={styles.statusRow}>
          {statusOptions.map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.statusChip,
                statusFilter === option && styles.statusChipActive,
              ]}
              onPress={() => onChangeStatus(option)}
            >
              <Text
                style={[
                  styles.statusChipText,
                  statusFilter === option && styles.statusChipTextActive,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Modal
        transparent
        visible={showDropdown}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdownMenu}>
            {searchByOptions.map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.dropdownItem,
                  searchBy === option && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  onChangeSearchBy(option);
                  setShowDropdown(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    searchBy === option && styles.dropdownItemTextActive,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <DatePicker
        modal
        open={showFromPicker}
        date={fromDate || new Date()}
        mode="date"
        maximumDate={toDate || new Date()}
        onConfirm={date => {
          onChangeFromDate(date);
          setShowFromPicker(false);
        }}
        onCancel={() => setShowFromPicker(false)}
      />
      <DatePicker
        modal
        open={showToPicker}
        date={toDate || new Date()}
        mode="date"
        minimumDate={fromDate || undefined}
        maximumDate={new Date()}
        onConfirm={date => {
          onChangeToDate(date);
          setShowToPicker(false);
        }}
        onCancel={() => setShowToPicker(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 10,
    gap: 6,
  },
  dateLabel: {
    fontSize: 13,
    color: BlackColor,
    fontFamily: fonts.Lato_Bold,
  },
  dateButton: {
    height: 36,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    justifyContent: 'center',
    flex: 1,
  },
  dateText: { fontSize: 13, color: BlackColor, fontFamily: fonts.Lato_Regular },

  statusRow: {
    flexDirection: 'row',
    marginHorizontal: 10,
    marginBottom: 10,
    gap: 8,
  },
  statusChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: primaryColor,
  },
  statusChipActive: { backgroundColor: primaryColor },
  statusChipText: {
    fontSize: 12,
    color: primaryColor,
    fontFamily: fonts.Lato_Regular,
  },
  statusChipTextActive: { color: '#fff', fontFamily: fonts.Lato_Bold },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 5,
    color: BlackColor,
    fontFamily: fonts.Lato_Regular,
  },
  searchButton: {
    height: 40,
    backgroundColor: primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 5,
  },
  searchIcon: { width: 22, height: 22 },
  clearButton: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
  },
  clearButtonText: {
    fontSize: 13,
    color: BlackColor,
    fontFamily: fonts.Lato_Regular,
  },

  dropdownButton: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 100,
    marginRight: 5,
  },
  dropdownButtonText: {
    fontSize: 13,
    color: BlackColor,
    fontFamily: fonts.Lato_Regular,
  },
  dropdownArrow: { fontSize: 12, color: 'gray' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 190,
    paddingLeft: 10,
  },
  dropdownMenu: {
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 140,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 16 },
  dropdownItemActive: { backgroundColor: primaryColor },
  dropdownItemText: {
    fontSize: 14,
    color: BlackColor,
    fontFamily: fonts.Lato_Regular,
  },
  dropdownItemTextActive: { color: 'white', fontFamily: fonts.Lato_Bold },
});

export default FilterBar;
