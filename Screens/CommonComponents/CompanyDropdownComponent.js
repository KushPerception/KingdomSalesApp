// CompanyDropdownComponent.js
// DropDown Picker Component
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const CompanyDropdownComponent = (props) => {
  const { companyList, isModalVisible, setIsModalVisible, onSelectDivision } =
    props;
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
            <Text style={styles.modalTitle}>{"Select Company Division"}</Text>
            <Text style={styles.modalTitle} onPress={toggleModal}>
              {"X"}
            </Text>
          </View>

          <FlatList
            data={companyList.filter((item) =>
              item?.Division.toLowerCase().includes(searchText.toLowerCase())
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
                  {item?.Division}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

export default CompanyDropdownComponent;
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
