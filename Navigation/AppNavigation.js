import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React, {Fragment, useEffect, useRef, useState} from 'react';
import {Alert, BackHandler} from 'react-native';
import AddNewCustomer from '../Screens/MainComponents/AddNewCustomer/AddNewCustomer';
import ProductInvoice from '../Screens/MainComponents/AddProduct/ProductInvoice';
import ChangePassword from '../Screens/MainComponents/Auth/ChangePassword';
import ForgotPassword from '../Screens/MainComponents/Auth/ForgotPassword';
import Login from '../Screens/MainComponents/Auth/Login';
import MPinOtp from '../Screens/MainComponents/Auth/MPinOtp';
import ResetMPIN from '../Screens/MainComponents/Auth/ResetMPIN';
import DriverOrderList from '../Screens/MainComponents/DriverOrders/DriverOrderList';
import DriverOrders from '../Screens/MainComponents/DriverOrders/DriverOrders';
import DriverOrdersPastList from '../Screens/MainComponents/DriverOrders/DriverOrdersPastList';
import DriverHome from '../Screens/MainComponents/Home/DriverHome';
import DriverInvoice from '../Screens/MainComponents/Home/DriverInvoice';
import Home from '../Screens/MainComponents/Home/Home';
import Invoice from '../Screens/MainComponents/Home/Invoice';
import OrderHtmlInvoiceSales from '../Screens/MainComponents/Home/OrderHtmlInvoiceSales';
import DelieveryNote from '../Screens/MainComponents/OrderDetails/DelieveryNote';
import NeedAReciept from '../Screens/MainComponents/OrderDetails/NeedAReciept';
import OrderHtmlInvoice from '../Screens/MainComponents/OrderDetails/OrderHtmlInvoice';
import PdfView from '../Screens/MainComponents/OrderDetails/PdfView';
import PrintRecipt from '../Screens/MainComponents/OrderDetails/PrintRecipt';
import ResendView from '../Screens/MainComponents/OrderDetails/ResendView';
import AddEditScheduleOrder from '../Screens/MainComponents/ScheduleOrders/AddEditScheduleOrder';
import SettingList from '../Screens/MainComponents/Settings/SettingList';
import UpdateOrders from '../Screens/MainComponents/UpdateOrderDetails/UpdateOrders';
import Splash from '../Screens/MainComponents/Welcome/Splash';
import Welcome from '../Screens/MainComponents/Welcome/Welcome';
import CashReceipt from '../Screens/MainComponents/Home/CashReceipt';
import DriverCashReceipt from '../Screens/MainComponents/Home/DriverCashReceipt';
import CreateCashReceipt from '../Screens/MainComponents/Home/CreateCashReceipt';
import EditCashReceipt from '../Screens/MainComponents/Home/EditCashReceipt';
import MaterialRequestList from '../Screens/MainComponents/MaterialRequest/MaterialRequestList';
import MaterialRequest1 from '../Screens/MainComponents/MaterialRequest/MaterialRequest1';
import MaterialRequest2 from '../Screens/MainComponents/MaterialRequest/MaterialRequest2';
import MaterialRequest3 from '../Screens/MainComponents/MaterialRequest/MaterialRequest3';
import MaterialRequestAttachment from '../Screens/MainComponents/MaterialRequest/MaterialRequestAttachment';
import PurchaseManager from '../Screens/MainComponents/PurchaseManager/PurchaseManager';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [CurrentScreen, setCurrentScreen] = useState(null);
  const [PreviousScreen, setPreviousScreen] = useState(null);

  const backAction = () => {
    if (
      CurrentScreen === 'Home' ||
      CurrentScreen === 'DriverOrderList' ||
      CurrentScreen === 'Login'
    ) {
      Alert.alert('Hold on!', 'Are you sure you want to Exit the App?', [
        {text: 'Cancel', onPress: () => null, style: 'cancel'},
        {text: 'YES', onPress: () => BackHandler.exitApp()},
      ]);
      return true;
    }
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [CurrentScreen, PreviousScreen]);

  const navigationRef = useRef();
  const routeNameRef = useRef();

  return (
    <Fragment>
      <NavigationContainer
        ref={navigationRef}
        onReady={() =>
          (routeNameRef.current =
            navigationRef.current.getCurrentRoute().name)
        }
        onStateChange={async () => {
          const previousRouteName = routeNameRef.current;
          const currentRouteName =
            navigationRef.current.getCurrentRoute().name;
          setCurrentScreen(currentRouteName);
          setPreviousScreen(previousRouteName);
          routeNameRef.current = currentRouteName;
        }}>
        {/* headerMode="none" was removed in React Navigation 6+.
            Use screenOptions={{ headerShown: false }} instead. */}
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{headerShown: false}}>
          <Stack.Screen name="Splash" component={Splash} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="MPinOtp" component={MPinOtp} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          <Stack.Screen name="ChangePassword" component={ChangePassword} />
          <Stack.Screen
            name="AddEditScheduleOrder"
            component={AddEditScheduleOrder}
          />
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="DriverHome" component={DriverHome} />
          <Stack.Screen name="SettingList" component={SettingList} />
          <Stack.Screen name="AddNewCustomer" component={AddNewCustomer} />
          <Stack.Screen name="DriverOrders" component={DriverOrders} />
          <Stack.Screen name="DriverOrderList" component={DriverOrderList} />
          <Stack.Screen
            name="DriverOrdersPastList"
            component={DriverOrdersPastList}
          />
          <Stack.Screen name="DelieveryNote" component={DelieveryNote} />
          <Stack.Screen name="UpdateOrders" component={UpdateOrders} />
          <Stack.Screen
            name="OrderHtmlInvoice"
            component={OrderHtmlInvoice}
          />
          <Stack.Screen name="NeedAReciept" component={NeedAReciept} />
          <Stack.Screen name="PdfView" component={PdfView} />
          <Stack.Screen name="ResetMPIN" component={ResetMPIN} />
          <Stack.Screen name="PrintRecipt" component={PrintRecipt} />
          <Stack.Screen name="ResendView" component={ResendView} />
          <Stack.Screen name="Invoice" component={Invoice} />
          <Stack.Screen name="CashReceipt" component={CashReceipt} />
          <Stack.Screen name="DriverInvoice" component={DriverInvoice} />
          <Stack.Screen
            name="CreateCashReceipt"
            component={CreateCashReceipt}
          />
          <Stack.Screen name="EditCashReceipt" component={EditCashReceipt} />
          <Stack.Screen
            name="DriverCashReceipt"
            component={DriverCashReceipt}
          />
          <Stack.Screen
            name="OrderHtmlInvoiceSales"
            component={OrderHtmlInvoiceSales}
          />
          <Stack.Screen name="ProductInvoice" component={ProductInvoice} />
          <Stack.Screen name="MaterialRequestList" component={MaterialRequestList} />
          <Stack.Screen name="MaterialRequest1" component={MaterialRequest1} />
          <Stack.Screen name="MaterialRequest2" component={MaterialRequest2} />
          <Stack.Screen name="MaterialRequest3" component={MaterialRequest3} />
          <Stack.Screen name="MaterialRequestAttachment" component={MaterialRequestAttachment} />
          <Stack.Screen name="PurchaseManager" component={PurchaseManager} />
        </Stack.Navigator>
      </NavigationContainer>
    </Fragment>
  );
};

export default AppNavigator;
