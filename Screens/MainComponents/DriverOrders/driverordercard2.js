import React from 'react'
import {View,Text,StyleSheet, Dimensions} from 'react-native'
import {W,H,fonts} from '../../../utility/GlobalStyles'
import Card from '../../CommonComponents/Card'
import {darkGreyTextColor, lightGreyTextColor, RedTextColor} from '../../../utility/colors'
const {width,height} = Dimensions.get('window')
import { useNavigation } from '@react-navigation/native';
const moment = require('moment');

const DriverOrderListCard = (props) => {
    let {OrderListItem} = props
    const navigation = useNavigation();

    return (
        <View style = {{alignItems:'center'}}>
        <Card onPress = {()=>navigation.navigate("OrderHtmlInvoice",{PdfData:"https://www.thebookcollector.co.uk/sites/default/files/the-book-collector-example-2018-04.pdf"})} style = {styles.CardStyle}>
        <Text style = {styles.PhoneNoTextStyle}>{OrderListItem?.DIVISION}</Text>
        <View style = {{flexDirection:'row', marginTop:10}}>
             <View style = {{flexDirection:'column', width:'25%'}}>
             <Text style = {styles.PhoneNoTextStyle}>Delivery No.</Text>
             <Text style = {styles.OrderTypeDateStyle}>{OrderListItem?.DELIVERYNO}</Text>
           </View>
           <View style = {{flexDirection:'column', width:'70%', marginLeft:5}}>
           <Text style = {styles.PhoneNoTextStyle}>Delivery Date</Text>
             <Text style = {styles.OrderTypeDateStyle}> {moment(OrderListItem?.DELIVERYDATE).format('LL')}</Text>
           </View>
           {/* <View style = {{flexDirection:'column', width:'30%', marginLeft:10}}>
             <Text style = {styles.PhoneNoTextStyle}>Truck No.</Text>
             <Text style = {styles.OrderTypeDateStyle}>{OrderListItem?.TRUCKNO}</Text>
           </View> */}

            </View>

        <View style = {[styles.CustomerNameWidth,{marginTop:5}]}>
        <Text numberOfLines={1} style = {styles.CustomerNameText}>{OrderListItem?.CUSTNAME}</Text>
        <Text numberOfLines={1} style = {styles.SiteTextStyle}>{OrderListItem?.SITENAME}</Text>
       </View>
       <View style = {{flexDirection:'row', marginTop:10}}>
             <View style = {{flexDirection:'column', width:'45%'}}>
             <Text style = {styles.PhoneNoTextStyle}>Customer No.</Text>
             <Text style = {styles.OrderTypeDateStyle}>{OrderListItem?.CUSTPHONE}</Text>
           </View>
           <View style = {{flexDirection:'column', width:'35%', marginLeft:20}}>
           <Text style = {styles.PhoneNoTextStyle}>Truck No</Text>
             <Text style = {styles.OrderTypeDateStyle}> {OrderListItem?.TRUCKNO}</Text>
           </View>
           {/* <View style = {{flexDirection:'column', width:'30%', marginLeft:10}}>
             <Text style = {styles.PhoneNoTextStyle}>Truck No.</Text>
             <Text style = {styles.OrderTypeDateStyle}>{OrderListItem?.TRUCKNO}</Text>
           </View> */}

            </View>

          <View style = {{marginBottom:10}}/>
        </Card>
        </View>
    )
}
const styles = StyleSheet.create({
  CardStyle:{
    width:width-20, marginTop:5, paddingLeft:10, paddingTop:20
},
PhoneNoTextStyle:{
    color:lightGreyTextColor, fontFamily:fonts.Lato_Regular, fontSize:12
},
CustomerNameText:{
    color:RedTextColor, marginTop:7, fontSize:16, fontFamily:fonts.Lato_Bold, marginBottom:5
},
SiteTextStyle:{
  color:darkGreyTextColor, fontFamily:fonts.Lato_Regular, marginTop:5

},
OrderTypeRowStyle:{
  flexDirection:'row', justifyContent:'space-between', marginTop:10
},
OrderTypeDateStyle:{
  color:darkGreyTextColor, fontFamily:fonts.Lato_Regular, fontSize: 16,marginTop:5
},
CustomerNameWidth:{
  width:'90%'
},
DivisionNoTextStyle:{
  color:lightGreyTextColor, marginTop:7
}

})


export default DriverOrderListCard
