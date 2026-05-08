import React from 'react'
import {View,Text, TouchableOpacity, StyleSheet,Dimensions} from 'react-native'
import { primaryColor, whiteColor } from '../../utility/colors'
const {width,height} = Dimensions.get('window')
import {W,H, fonts} from '../../utility/GlobalStyles'

const SaveButton = (props) => {
    let{title, onPress, BgColor, borderColor,TitleColor} = props

    return (
        <View>
       
        <View style = {styles.ButtonView}>
        <TouchableOpacity style = {[styles.ButtonStyle,,{backgroundColor:BgColor?BgColor:primaryColor, borderColor:borderColor?borderColor:primaryColor}]} onPress = {onPress}>
            <Text style = {[styles.TitleText,{color:TitleColor?TitleColor:whiteColor}]}>{title}</Text>
        </TouchableOpacity>
        </View>
         </View>
    )
}
const styles = StyleSheet.create({
    ButtonStyle:{
     width:W(165), height: 50, justifyContent:'center', alignItems:'center', borderWidth:1
    },
    TitleText:{
       fontFamily:fonts.Lato_Regular,fontSize:18
    },
    ButtonView:{
        alignItems:'center', marginTop:10
    },
    fullWidthButtonStyle:{
        width:'100%', height: 48, backgroundColor: primaryColor, justifyContent:'center', alignItems:'center', borderRadius:10
    }
})


export default SaveButton
