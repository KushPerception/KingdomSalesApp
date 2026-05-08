import React, {useState, useEffect} from 'react'
import {View,Text,StyleSheet,FlatList,Image, TouchableOpacity} from 'react-native'
import {  whiteColor } from '../../../utility/colors'
import Header from '../../CommonComponents/Header'
import ListSeparator from '../../CommonComponents/ListSeparator'
import {AddGradientIcon} from '../../../Images/index'
import HomeListCard from './HomeListCard'

let OrderList= [
    {
      OrderId:"1",
      OrderType:"Cash",
      ScheduleDate:'May 31,2021',
      Stock:"KGFHRTYUZ",
      CustomerName:"Pile and Drive Co W.LL",
      Quantity:"50",
      CustomerCode:"101",
      PhoneNo:"6677889900",
      Site:"North America",
      SalesMan:"John Thomas",
      Remark:"Order should be delievered Morning till 11 AM.",
      PlacingDate:"June 2, 2021",
      Time:"2:26 PM",
      OrderStatus:'Pending'
    },
    {
        OrderId:"2",
        OrderType:"Credit",
        ScheduleDate:'June 2,2021',
        Stock:"KGFHRTYUZ122",
        CustomerName:"Alghana Group Co. W.LL",
        Quantity:"25",
        CustomerCode:"102",
        PhoneNo:"6677889910",
        Site:"South America",
        SalesMan:"John Thomas",
        Remark:"Order should be delievered Morning till 2 PM.",
        PlacingDate:"June 4, 2021",
        Time:"4:26 PM",
        OrderStatus:'Delivered'

      },
      {
        OrderId:"3",
        OrderType:"Cash",
        ScheduleDate:'July 28,2021',
        Stock:"KGFHRTYUZ455",
        CustomerName:"Kazrooni Contracting W.LL",
        Quantity:"70",
        CustomerCode:"103",
        PhoneNo:"6677889920",
        Site:"Malasia",
        SalesMan:"John Thomas",
        Remark:"Order should be delievered Morning till 8 AM.",
        PlacingDate:"June 10, 2021",
        Time:"2:26 PM",
        OrderStatus:'InTransit'

      },
      {
        OrderId:"4",
        OrderType:"Cash",
        ScheduleDate:'August 20,2021',
        Stock:"KGFHRTYUZ200",
        CustomerName:"Radhwan Ahmed Ali Masaad Co. W.LL",
        Quantity:"90",
        CustomerCode:"104",
        PhoneNo:"6677889920",
        Site:"Georgia",
        SalesMan:"John Thomas",
        Remark:"Order should be delievered Morning till 10 AM.",
        PlacingDate:"July 20, 2021",
        Time:"4:26 PM",
        OrderStatus:'InTransit'

      },

      {
        OrderId:"5",
        OrderType:"Credit",
        ScheduleDate:'August 25,2021',
        Stock:"KGFHRTYUZ108",
        CustomerName:"Radhwan Ahmed Ali Masaad Co. W.LL",
        Quantity:"80",
        CustomerCode:"105",
        PhoneNo:"6677889921",
        Site:"Holland",
        SalesMan:"John Thomas",
        Remark:"Order should be delievered Morning till 9 AM.",
        PlacingDate:"July 22, 2021",
        Time:"4:26 PM",
        OrderStatus:'Delivered'


      },

      {
        OrderId:"6",
        OrderType:"Credit",
        ScheduleDate:'August 21,2021',
        Stock:"KGFHRTYUZ500",
        CustomerName:"Radhwan Ahmed Ali Masaad Co. W.LL",
        Quantity:"70",
        CustomerCode:"106",
        PhoneNo:"6677889919",
        Site:"Holland",
        SalesMan:"John Thomas",
        Remark:"Order should be delievered Morning till 7 AM.",
        PlacingDate:"July 20, 2021",
        Time:"4:26 PM",
        OrderStatus:'Pending'

      },
]
const DriverHome = (props) => {

 //States
const [AllOrderList, setAllOrderList] = useState([])

//Effects
      useEffect(() => {
          setAllOrderList(OrderList)   
      }, [])

  //Function

  const RenderOrderData = ({item,index})=>{
    return(
       <HomeListCard OrderListItem = {item}/>
    )
}

const RenderOrderListEmpty = ({item,index})=>{
    return(
       <View style = {{flex: 1, justifyContent:'center', alignItems:'center'}}>
      <Text>No Data Found!</Text>
       </View>
    )
}

const renderSeparator = ()=>{
    return(
     <ListSeparator/>
    )
}

      
    return (
        <View style = {styles.container}>
        <Header Title = "Order List" OnlyTitle = {true}/>
        <View style = {[styles.container, {marginBottom:20}]}>
          <FlatList
           data={AllOrderList}
          keyExtractor={(item, index) => index + ''}
          extraData = {AllOrderList}
          ItemSeparatorComponent = {renderSeparator}
          ListEmptyComponent = {RenderOrderListEmpty}
          renderItem={ RenderOrderData}
          />
        </View>
        
        </View>
    )
}
const styles = StyleSheet.create({
    container:{
        flex:1, backgroundColor:whiteColor
    }
})
export default DriverHome
