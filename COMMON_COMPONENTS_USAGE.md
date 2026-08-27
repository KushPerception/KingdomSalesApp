# CommonComponents Usage Map

Cross-reference of every file in `Screens/CommonComponents` against the screens (under `Screens/MainComponents`) that import and render it.

- **29** shared components, **27** used, **2** unused (`Button.js`, `NoInternet.js`)
- **49** distinct screens import at least one shared component
- Counts are JSX instances, not import lines — a component imported once but rendered 3 times counts as 3
- Rows marked *(internal)* are usages inside another `CommonComponents` file, not a screen

Sorted by number of distinct screens using the component, descending.

## Header.js — exported as `Header` / `HeaderComponent`
31 screens, 31 total usages

| Screen | Uses |
|---|---|
| Settings/SettingList.js | 1 |
| Home/DriverHome.js | 1 |
| Home/Invoice.js | 1 |
| MaterialRequest/MaterialRequestList.js | 1 |
| MaterialRequest/MaterialRequestAttachment.js | 1 |
| PurchaseManager/Shared/PMCommonScreen.js | 1 |
| PurchaseManager/PurchaseManagerRole/PurchaseManager.js | 1 |
| CostController/CostController.js | 1 |
| CostController/SupplierPickerScreen.js | 1 |
| Home/DriverCashReceipt.js | 1 |
| Home/Home.js | 1 |
| Home/CashReceipt.js | 1 |
| MaterialRequest/MaterialRequestStockPicker.js | 1 |
| Home/OrderHtmlInvoiceSales.js | 1 |
| Home/EditCashReceipt.js | 1 |
| Home/CreateCashReceipt.js | 1 |
| MaterialRequest/MaterialRequestItems.js | 1 |
| Home/DriverInvoice.js | 1 |
| PurchaseManager/CeoMdRole/PurchaseOrderScreen.js | 1 |
| MaterialRequest/MaterialRequestForm.js | 1 |
| DriverOrders/DriverOrders.js | 1 |
| CostController/CreateLandingCost.js | 1 |
| ScheduleOrders/AddEditScheduleOrder.js | 1 |
| OrderDetails/NeedAReciept.js | 1 |
| AddNewCustomer/AddNewCustomer.js | 1 |
| PurchaseManager/MRDetailScreen.js | 1 |
| AddProduct/ProductInvoice.js | 1 |
| OrderDetails/OrderHtmlInvoice.js | 1 |
| OrderDetails/ResendView.js | 1 |
| UpdateOrderDetails/UpdateOrders.js | 1 |
| OrderDetails/DelieveryNote.js | 1 |

## LoaderComponent.js — exported as `LoaderComponent`
23 files (20 screens + 3 internal), 26 total usages

| Screen | Uses |
|---|---|
| Home/Invoice.js | 1 |
| MaterialRequest/MaterialRequestList.js | 1 |
| CostController/CreateLandingCost.js | 1 |
| DriverOrders/DriverOrderList.js | 1 |
| Home/EditCashReceipt.js | 1 |
| Home/DriverCashReceipt.js | 1 |
| Home/CashReceipt.js | 1 |
| Home/DriverInvoice.js | 1 |
| Home/Home.js | 1 |
| Home/OrderHtmlInvoiceSales.js | 1 |
| MaterialRequest/MaterialRequestForm.js | 1 |
| Home/CreateCashReceipt.js | 1 |
| MaterialRequest/MaterialRequestItems.js | 1 |
| ScheduleOrders/AddEditScheduleOrder.js | 1 |
| DriverOrders/DriverOrdersPastList.js | 1 |
| DriverOrders/DriverOrders.js | 1 |
| Auth/Login.js | 1 |
| OrderDetails/ResendView.js | 1 |
| AddProduct/ProductInvoice.js | 1 |
| AddProduct/ProductList.js | 2 |
| CommonComponents/StockListModal.js *(internal)* | 1 |
| CommonComponents/CustomerSiteModal.js *(internal)* | 2 |
| CommonComponents/CustomerListModal.js *(internal)* | 2 |

## LoginButton.js — exported as `LoginButton`
16 files (15 screens + 1 internal), 21 total usages

| Screen | Uses |
|---|---|
| Home/EditCashReceipt.js | 1 |
| Home/CreateCashReceipt.js | 1 |
| ScheduleOrders/AddEditScheduleOrder.js | 2 |
| Auth/ResetMPIN.js | 1 |
| UpdateOrderDetails/UpdateOrders.js | 1 |
| OrderDetails/NeedAReciept.js | 2 |
| Auth/MPinOtp.js | 1 |
| Auth/ForgotPassword.js | 1 |
| Auth/Login.js | 1 |
| Auth/ChangePassword.js | 1 |
| UpdateOrderDetails/UpdateProducts.js | 2 |
| OrderDetails/ResendView.js | 1 |
| Welcome/Welcome.js | 2 |
| AddNewCustomer/AddNewCustomer.js | 1 |
| AddProduct/ProductList.js | 1 |
| CommonComponents/AddEditProductModal.js *(internal)* | 1 |

## OfflineNotice.js — exported as `OfflineNotice`
14 screens, 14 total usages

| Screen | Uses |
|---|---|
| Settings/SettingList.js | 1 |
| Home/CashReceipt.js | 1 |
| Home/OrderHtmlInvoiceSales.js | 1 |
| Home/Invoice.js | 1 |
| MaterialRequest/MaterialRequestList.js | 1 |
| Home/DriverCashReceipt.js | 1 |
| Home/CreateCashReceipt.js | 1 |
| Home/EditCashReceipt.js | 1 |
| Home/Home.js | 1 |
| Home/DriverInvoice.js | 1 |
| ScheduleOrders/AddEditScheduleOrder.js | 1 |
| UpdateOrderDetails/UpdateOrders.js | 1 |
| AddNewCustomer/AddNewCustomer.js | 1 |
| AddProduct/ProductInvoice.js | 1 |

## SaveButton.js — exported as `SaveButton`
10 files (9 screens + 1 internal), 18 total usages

| Screen | Uses |
|---|---|
| Home/DriverCashReceipt.js | 1 |
| Home/HomeListCard.js | 1 |
| Home/OrderHtmlInvoiceSales.js | 1 |
| Home/DriverInvoice.js | 1 |
| AddProduct/ProductList.js | 3 |
| AddProduct/ProductInvoice.js | 1 |
| OrderDetails/DelieveryNote.js | 3 |
| OrderDetails/OrderHtmlInvoice.js | 4 |
| AddProduct/ProductListCard.js | 1 |
| CommonComponents/AddEditProductModal.js *(internal)* | 1 |

## SimpleTextfield.js — exported as `SimpleTextfield`
5 files (4 screens + 1 internal), 18 total usages

| Screen | Uses |
|---|---|
| ScheduleOrders/AddEditScheduleOrder.js | 5 |
| OrderDetails/DelieveryNote.js | 4 |
| AddNewCustomer/AddNewCustomer.js | 4 |
| UpdateOrderDetails/UpdateProducts.js | 2 |
| CommonComponents/AddEditProductModal.js *(internal)* | 3 |

## ListSeparator.js — exported as `ListSeparator`
8 files (4 screens + 4 internal), 10 total usages

| Screen | Uses |
|---|---|
| Home/DriverHome.js | 1 |
| ScheduleOrders/ProductData.js | 1 |
| AddProduct/ProductList.js | 1 |
| UpdateOrderDetails/UpdateProducts.js | 1 |
| CommonComponents/StockListModal.js *(internal)* | 2 |
| CommonComponents/CustomerSiteModal.js *(internal)* | 2 |
| CommonComponents/AddEditProductModal.js *(internal)* | 1 |
| CommonComponents/CustomerListModal.js *(internal)* | 1 |

## Card.js — exported as `Card`
6 screens, 6 total usages

| Screen | Uses |
|---|---|
| Home/HomeListCard.js | 1 |
| ScheduleOrders/AddEditScheduleOrder.js | 1 |
| DriverOrders/driverordercard2.js | 1 |
| UpdateOrderDetails/UpdateOrders.js | 1 |
| AddProduct/ProductListCard.js | 1 |
| DriverOrders/DriverOrderListCard.js | 1 |

## CustomerListModal.js — exported as `CustomerListModal`
4 screens, 4 total usages

| Screen | Uses |
|---|---|
| Home/EditCashReceipt.js | 1 |
| ScheduleOrders/AddEditScheduleOrder.js | 1 |
| Home/CreateCashReceipt.js | 1 |
| UpdateOrderDetails/UpdateOrders.js | 1 |

## OutlinedTextInput.js — exported as `OutlinedTextInput`
2 screens, 5 total usages

| Screen | Uses |
|---|---|
| ScheduleOrders/ProductData.js | 2 |
| Auth/ChangePassword.js | 3 |

## AttachmentsList.js — exported as `AttachmentsList` (default) / `AttachmentRow` (named)
3 screens, 3 total usages

| Screen | Uses |
|---|---|
| PurchaseManager/Shared/PMCommonScreen.js | 1 |
| PurchaseManager/MRDetailScreen.js | 1 |
| MaterialRequest/MaterialRequestAttachment.js (as `AttachmentRow`) | 1 |

## FabButton.js — exported as `FabButton`
3 screens, 3 total usages

| Screen | Uses |
|---|---|
| MaterialRequest/MaterialRequestList.js | 1 |
| MaterialRequest/MaterialRequestItems.js | 1 |
| CostController/CostController.js | 1 |

## CompanyDropdownComponent.js — exported as `CompanyDropdownComponent`
3 screens, 3 total usages

| Screen | Uses |
|---|---|
| Home/EditCashReceipt.js | 1 |
| Home/CashReceipt.js | 1 |
| Home/CreateCashReceipt.js | 1 |

## SimpleCenterAlignModal.js — exported as `SimpleCenterAlignModal`
3 screens, 3 total usages

| Screen | Uses |
|---|---|
| Home/HomeListCard.js | 1 |
| OrderDetails/OrderHtmlInvoice.js | 1 |
| AddProduct/ProductListCard.js | 1 |

## ButtonLoader.js — exported as `ButtonWithLoader`
3 screens, 3 total usages

| Screen | Uses |
|---|---|
| Home/Invoice.js | 1 |
| MaterialRequest/MaterialRequestList.js | 1 |
| Home/CashReceipt.js | 1 |

## ApproveModal.js — exported as `ApproveModal`
2 screens, 2 total usages

| Screen | Uses |
|---|---|
| PurchaseManager/Shared/PurchaseOrderList.js | 1 |
| PurchaseManager/PurchaseManagerRole/QuotationList.js | 1 |

## BottomSheetModal.js — exported as `BottomSheetModal`
2 screens, 2 total usages

| Screen | Uses |
|---|---|
| PurchaseManager/PurchaseManagerRole/QuotationList.js | 1 |
| PurchaseManager/Shared/PurchaseOrderList.js | 1 |

## FilterBar.js — exported as `FilterBar`
2 screens, 2 total usages

| Screen | Uses |
|---|---|
| PurchaseManager/Shared/PurchaseOrderList.js | 1 |
| PurchaseManager/PurchaseManagerRole/QuotationList.js | 1 |

## PaymentModeDropdowncomponent.js — exported as `PaymentModeDropdowncomponent`
2 screens, 2 total usages

| Screen | Uses |
|---|---|
| Home/EditCashReceipt.js | 1 |
| Home/CreateCashReceipt.js | 1 |

## StockListModal.js — exported as `StockListModal`
2 screens, 2 total usages

| Screen | Uses |
|---|---|
| UpdateOrderDetails/UpdateProducts.js | 1 |
| AddProduct/ProductList.js | 1 |

## BottomSwipebleModal/ — exported as `BottomSwipebleModal`
1 screen, 1 usage

| Screen | Uses |
|---|---|
| OrderDetails/OrderHtmlInvoice.js | 1 |

## AddEditProductModal.js — exported as `AddEditProductModal`
1 screen, 1 usage

| Screen | Uses |
|---|---|
| AddProduct/ProductListCard.js | 1 |

## AttachmentImageViewer.js — exported as `AttachmentImageViewer`
1 screen, 1 usage

| Screen | Uses |
|---|---|
| MaterialRequest/Components/MaterialRequestFileCard.js | 1 |

## CustomerSiteModal.js — exported as `CustomerSiteModal`
1 screen, 1 usage

| Screen | Uses |
|---|---|
| ScheduleOrders/AddEditScheduleOrder.js (imported under a typo'd alias `CustomerSiteModall`) | 1 |

## DropDownComponent.js — exported as `DropDownComponent`
1 screen, 2 total usages

| Screen | Uses |
|---|---|
| Home/Invoice.js | 2 |

## SimpleTextInput.js — exported as `SimpleTextInput`
1 screen, 2 total usages

| Screen | Uses |
|---|---|
| ScheduleOrders/AddEditScheduleOrder.js | 2 |

## Success_Error_Modal.js — exported as `SuccessErrorModal`
1 screen, 1 usage

| Screen | Uses |
|---|---|
| DriverOrders/DriverOrders.js | 1 |

## ListEmptyComponent.js — exported as `ListEmptyComponent`
0 screens, 1 internal usage only

| Location | Uses |
|---|---|
| CommonComponents/StockListModal.js *(internal)* | 1 |

## Unused components

Neither has any importer anywhere under `Screens/`:

- **Button.js**
- **NoInternet.js**
