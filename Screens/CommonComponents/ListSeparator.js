import React from 'react'
import {View,StyleSheet} from 'react-native'
import { lightGreyTextInputColor} from '../../utility/colors'

const ListSeparator = () => {
    return (
        <View style = {{alignItems:'center'}}>
        <View style= {styles.SeparatorStyle}/> 
        </View>
    )
}
const styles = StyleSheet.create({
    CenterAlign:{
        alignItems:'center'
    },
SeparatorStyle:{
    borderWidth:0.5, borderColor:lightGreyTextInputColor, width:'85%'
}
})
export default ListSeparator
