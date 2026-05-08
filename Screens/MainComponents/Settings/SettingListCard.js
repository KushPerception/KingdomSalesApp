import React from 'react'
import {View,Text,StyleSheet,TouchableOpacity,Image} from 'react-native'
import { lightGreyColor, lightGreyTextColor, lightGreyTextInputColor, saperatorColor } from '../../../utility/colors'
import {ForwardGreyIcon} from '../../../Images/index'
import { fonts } from '../../../utility/GlobalStyles'
const SettingListCard = (props) => {
let {SettingListItem,onPress} = props
    return (
        <View style = {styles.CardTopCenterMargin}>
        <TouchableOpacity onPress =  {()=>onPress()} style = {styles.SettingTitleTouch}>
        <Text style = {styles.TitleTextStyle}>{SettingListItem?.title}</Text> 
        <Image source = {ForwardGreyIcon} resizeMode = "contain" style = {styles.ForwardIconStyle}/>
        </TouchableOpacity>
        </View>
    )
}
const styles = StyleSheet.create({
    CardTopCenterMargin:{
        alignItems:'center', marginTop:20
    },
    SettingTitleTouch:{
        width:'90%', height:60, flexDirection:'row', justifyContent:'space-between', alignItems:'center', borderColor:lightGreyTextInputColor, borderWidth:0.5, paddingLeft:10,paddingRight:10
    },
    ForwardIconStyle:{
        width:18,height:18
    },
    TitleTextStyle:{
        color:lightGreyColor, fontFamily:fonts.Font_Medium,
    }
})
export default SettingListCard
