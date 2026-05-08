// DropDownComponent.js
// DropDown Picker Component
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const DropDownComponent = (props) => {
  const {
    divisionList,
    isModalVisible,
    setIsModalVisible,
    SalesMan,
    onSelectDivision,
  } = props;
  const [searchText, setSearchText] = useState("");

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  return (
    <Modal visible={isModalVisible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              margin: 5,
            }}
          >
            <Text style={styles.modalTitle}>
              {SalesMan ? "Select Sales Man" : "Select Division"}
            </Text>
            <Text style={styles.modalTitle} onPress={toggleModal}>
              {"X"}
            </Text>
          </View>

          {/* Search Input */}
          {SalesMan === true && (
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              value={searchText}
              onChangeText={(text) => setSearchText(text)}
            />
          )}

          <FlatList
            data={divisionList.filter((item) =>
              SalesMan
                ? item?.SalesMan.toLowerCase().includes(
                    searchText.toLowerCase()
                  )
                : item.toLowerCase().includes(searchText.toLowerCase())
            )}
            keyExtractor={(item) => item}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                key={index}
                onPress={() => onSelectDivision(item)}
                style={{ borderBottomWidth: 0.3 }}
              >
                <Text
                  style={{
                    margin: 10,
                    alignSelf: "center",
                  }}
                >
                  {SalesMan ? item?.SalesMan : item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

export default DropDownComponent;
const styles = StyleSheet.create({
  divisionSelect: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  keywordInput: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    width: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    alignSelf: "center",
  },
  searchInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});
