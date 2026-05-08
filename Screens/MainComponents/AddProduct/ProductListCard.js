import React, { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ModalShade from "react-native-modal";
import { W, fonts } from "../../../utility/GlobalStyles";
import {
  BlackColor,
  RedTextColor,
  darkGreyTextColor,
  lightGreyTextColor,
  lightGreyTextInputColor,
  modalBackgroundColor,
  primaryColor,
  whiteColor,
} from "../../../utility/colors";
import Strings from "../../../utility/strings";
import Card from "../../CommonComponents/Card";
const moment = require("moment");
const { width, height } = Dimensions.get("window");

import { useNavigation } from "@react-navigation/native";
import { PrintIcon } from "../../../Images";
import AddEditProductModal from "../../CommonComponents/AddEditProductModal";
import SaveButton from "../../CommonComponents/SaveButton";
import SimpleCenterAlignModal from "../../CommonComponents/SimpleCenterAlignModal";
const ProductListCard = (props) => {
  let {
    ProductListItem,
    HandleEditProductItem,
    RemoveOrderItem,
    CreditOrder,
    CustomerName,
    SiteName,
    Slno,
    canEdit,
    canDelete,
    notransport,
  } = props;

  console.log("CustomerName===", CustomerName);
  const [EditModalVisible, setEditModalVisible] = useState(false);
  console.log("ProductListItem", ProductListItem);
  const navigation = useNavigation();

  //Function
  const simplemodal = useRef(null);
  const OnClickDelete = () => {
    simplemodal.current.show();

    // Alert.alert("Hold on!", "Are you sure you want to Delete Item?", [
    //   {
    //     text: "Cancel",
    //     onPress: () => null,
    //     style: "cancel",
    //   },
    //   { text: "YES", onPress: () => RemoveOrderItem(ProductListItem) },
    // ]);
  };

  const CloseEditModal = () => {
    setEditModalVisible(!EditModalVisible);
  };

  const [remarkText, setRemarkText] = useState("");
  //Render
  return (
    <View style={{ alignItems: "center", marginTop: 5 }}>
      <Card style={styles.CardStyle}>
        <View style={styles.MainRowContainer}>
          <View style={{ marginLeft: 20, marginTop: 20, width: "80%" }}>
            <Text numberOfLines={2} style={styles.ItemNameTextStyle}>
              {ProductListItem?.STOCKNAME}
            </Text>

            <View style={{ flexDirection: "row" }}>
              <View style={{ width: "45%" }}>
                <View style={styles.QuantityTopMargin}>
                  <Text style={styles.QuantityTextStyle}>
                    COST: {ProductListItem?.Rate} BD
                  </Text>
                </View>
              </View>
              <View style={styles.QuantityTopMargin}>
                <Text style={styles.QuantityTextStyle}>
                  DISC: {ProductListItem?.DISRATE} BD
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ width: "45%" }}>
                <View style={styles.QuantityTopMargin}>
                  <Text style={styles.QuantityTextStyle}>
                    Qty: {ProductListItem?.QTY}
                  </Text>
                </View>
              </View>
              <View style={styles.QuantityTopMargin}>
                <Text style={styles.QuantityTextStyle}>
                  Total: {ProductListItem?.TOTAL} BD
                </Text>
              </View>
            </View>
            <View style={{ width: "100%", height: "auto", paddingBottom: 15 }}>
              <View style={{ flexDirection: "row" }}>
                <View style={styles.DateColomnStyle}>
                  <Text style={styles.ScheduleDateHeaderText}>
                    {Strings.OrderDate}
                  </Text>

                  <Text style={styles.ScheduleDateStyle}>
                    {moment(ProductListItem?.OrderDate).format("ll")}
                  </Text>
                </View>
                <View style={styles.DateColomnStyle}>
                  <Text style={styles.ScheduleDateHeaderText}>
                    {Strings.ScheduleDate}
                  </Text>

                  <Text style={styles.ScheduleDateStyle}>
                    {moment(ProductListItem?.SCHEDULEDATE).format("ll")}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row" }}>
                <View style={styles.DateColomnStyle}>
                  <Text style={styles.ScheduleDateHeaderText}>
                    {Strings.PendingQty}
                  </Text>

                  <Text style={styles.ScheduleDateStyle}>
                    {ProductListItem?.PendingQty
                      ? ProductListItem?.PendingQty
                      : ProductListItem?.QTY}
                  </Text>
                </View>
                <View style={styles.DateColomnStyle}>
                  <Text style={styles.ScheduleDateHeaderText}>
                    {Strings.ERPNo}
                  </Text>

                  <Text style={styles.ScheduleDateStyle}>
                    {ProductListItem?.ERPOrderNo || "-"}
                  </Text>
                </View>
              </View>
              {ProductListItem?.invoiceList?.length > 0 && (
                <View
                  style={{
                    flexDirection: "column",
                    borderWidth: 0.5,
                    marginTop: 10,
                    borderColor: modalBackgroundColor,
                  }}
                >
                  {ProductListItem?.invoiceList?.map((item, index) => (
                    <View
                      style={{
                        flexDirection: "column",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          padding: 5,
                        }}
                      >
                        <Text
                          style={{ paddingTop: 5 }}
                        >{`Invoice No: ${item?.CMID}`}</Text>
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate("ProductInvoice", {
                              OrderId: Slno,
                              OrderType:
                                CreditOrder === true ? "CREDIT" : "CASH",
                              ItemId: ProductListItem?.SLNO,
                              ErpNo: ProductListItem?.ERPOrderNo,
                              Division: ProductListItem?.DIVISION,
                              InvoiceNo: item?.CMID,
                            })
                          }
                          style={{ padding: 5 }}
                        >
                          <Image
                            resizeMode={"contain"}
                            source={PrintIcon}
                            style={{ width: 18, height: 18 }}
                          />
                        </TouchableOpacity>
                      </View>
                      {index !== ProductListItem.invoiceList.length - 1 && (
                        <View
                          style={{
                            borderBottomWidth: 0.5,
                            marginTop: 5,
                            borderColor: modalBackgroundColor,
                          }}
                        ></View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
            {ProductListItem?.CANPRINT && (
              <View
                style={{ position: "absolute", right: 0, top: 0, zIndex: 1000 }}
              >
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("OrderHtmlInvoiceSales", {
                      OrderId: Slno,
                      OrderType: CreditOrder === true ? "CREDIT" : "CASH",
                      ItemId: ProductListItem?.SLNO,
                      ErpNo: ProductListItem?.ERPOrderNo,
                      Division: ProductListItem?.DIVISION,
                    })
                  }
                  style={{ padding: 10 }}
                >
                  <Image
                    resizeMode={"contain"}
                    source={PrintIcon}
                    style={{ width: 18, height: 18 }}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View style={styles.buttonContainer}>
            {canEdit && (
              <TouchableOpacity
                onPress={() => CloseEditModal()}
                style={styles.EditButtonTouch}
              >
                <Text
                  style={{
                    transform: [{ rotate: "90deg" }],
                    color: whiteColor,
                    fontSize: 12,
                  }}
                >
                  {Strings.Edit}
                </Text>
              </TouchableOpacity>
            )}
            {canDelete && (
              <TouchableOpacity
                onPress={() => OnClickDelete(ProductListItem)}
                style={styles.RedButtonTouch}
              >
                <Text
                  style={{
                    transform: [{ rotate: "90deg" }],
                    color: whiteColor,
                    fontSize: 11,
                  }}
                >
                  {Strings.Del}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Card>
      <View style={{ marginTop: 2 }} />
      <ModalShade
        style={{ margin: 0 }}
        isVisible={EditModalVisible}
        onBackdropPress={() => setEditModalVisible(false)}
      >
        <AddEditProductModal
          CloseModal={() => setEditModalVisible(false)}
          EditProductListItem={ProductListItem}
          HandleEditProductItem={HandleEditProductItem}
          CreditOrder={CreditOrder}
          CustomerName={CustomerName}
          SiteName={SiteName}
          notransport={notransport}
        />
      </ModalShade>

      {/* Delete Remark Modal */}
      <SimpleCenterAlignModal
        ref={simplemodal}
        onRequestClose={() => simplemodal.current?.close()}
        // height={200} //As per need
        width={"96%"}
      >
        <View>
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <Text style={styles.DeleteRemarkTitle}>
              {Strings.DeleteOrderRemark}
            </Text>

            <View style={styles.TextInputWidth}>
              <TextInput
                style={{ color: BlackColor, height: 200, width: "100%" }}
                placeholder="Remark"
                placeholderTextColor={lightGreyTextColor}
                value={remarkText}
                textAlignVertical="top"
                returnKeyLabel={"Done"}
                returnKeyType={"done"}
                multiline
                onChangeText={(text) => setRemarkText(text)}
              />
            </View>
          </View>
          <View>
            <SaveButton
              onPress={() =>
                RemoveOrderItem(ProductListItem?.SLNO, remarkText, () =>
                  simplemodal.current?.close()
                )
              }
              BgColor={whiteColor}
              TitleColor={RedTextColor}
              title={Strings.Del}
              borderColor={whiteColor}
            />
          </View>
        </View>
      </SimpleCenterAlignModal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  CardStyle: {
    width: width - 20,
  },
  MainRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ItemNameTextStyle: {
    color: RedTextColor,
    fontSize: 14,
    fontFamily: fonts.Lato_Bold,
  },
  QuantityTopMargin: {
    marginTop: 10,
  },
  QuantityTextStyle: {
    color: darkGreyTextColor,
    fontFamily: fonts.Lato_Regular,
  },
  ScheduleDateHeaderText: {
    color: lightGreyTextColor,
    fontSize: 12,
    fontFamily: fonts.Lato_Regular,
  },
  ScheduleDateStyle: {
    fontSize: 14,
    color: darkGreyTextColor,
    fontFamily: fonts.Lato_Regular,
    marginTop: 10,
  },
  DateColomnStyle: {
    flexDirection: "column",
    width: "45%",
    marginTop: 10,
  },
  buttonContainer: {
    width: 35,
    // height: 210,
    display: "flex",
    flexDirection: "column",
  },
  EditButtonTouch: {
    width: 35,
    flex: 1,
    backgroundColor: primaryColor,
    justifyContent: "center",
  },
  RedButtonTouch: {
    width: 35,
    flex: 1,
    backgroundColor: RedTextColor,
    justifyContent: "center",
  },
  AddProductModalContainer: {
    flex: 0.95,
    backgroundColor: whiteColor,
    top: 80,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 70,
  },
  AddItemCancelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 30,
  },
  AddItemModalText: {
    fontSize: 18,
    fontFamily: fonts.Lato_Bold,
    color: BlackColor,
  },

  CancelIconStyle: {
    width: 18,
    height: 18,
  },
  DropdownIconStyle: {
    width: 20,
    height: 20,
  },
  CalenderIconStyle: {
    width: 18,
    height: 18,
    marginBottom: 4,
  },
  DateButtonStyle: {
    width: W(320),
    borderColor: whiteColor,
    borderWidth: 0.5,
    paddingLeft: 10,
    justifyContent: "center",
    marginTop: 10,
    height: 35,
    borderLeftColor: whiteColor,
    borderRightColor: whiteColor,
    borderTopColor: whiteColor,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    borderBottomColor: lightGreyTextInputColor,
  },

  radioBtnRowTouch: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  radioBtnRowStyle: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginLeft: 25,
  },
  unselectRadioButton: {
    width: 20,
    height: 20,
    borderRadius: 20 / 2,
    borderWidth: 1,
    borderColor: lightGreyTextColor,
  },
  unspecButton: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: lightGreyTextColor,
  },
  radioBtnTxt: {
    marginLeft: 10,
  },
  selectRadioIcon: {
    width: 20,
    height: 20,
  },
  ScheduleDateText: {
    fontFamily: fonts.Lato_Bold,
    marginTop: 20,
    marginLeft: 30,
    color: darkGreyTextColor,
  },
  OrderTimeText: {
    fontFamily: fonts.Lato_Bold,
    fontSize: 16,
    marginLeft: 30,
    color: darkGreyTextColor,
    marginTop: 20,
  },
  DivisionNameTextStyle: {
    fontFamily: fonts.Lato_Regular,
    fontSize: 16,
    color: lightGreyTextColor,
  },
  DeleteRemarkTitle: {
    color: lightGreyTextColor,
    fontSize: 12,
    fontFamily: fonts.Font_Regular,
  },
  TextInputWidth: {
    width: W(320),
    height: 200,
    borderColor: darkGreyTextColor,
    borderWidth: 0.5,
    paddingLeft: 10,
    // borderRadius: 10,
    marginTop: 10,
    alignItems: "flex-start",
  },
});
export default ProductListCard;
