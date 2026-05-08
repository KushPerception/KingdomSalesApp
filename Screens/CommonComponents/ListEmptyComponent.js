import React from 'react'
import {View,Text,StyleSheet} from 'react-native'
const ListEmptyComponent = (props) => {
    let {EmptyTitle} = props
    return (
        <View style = {styles.container}>
            <Text>{EmptyTitle}</Text>
        </View>
    )
}
const styles = StyleSheet.create({
    container:{
        flex:1,justifyContent:'center', alignItems:'center'
    }
})
export default ListEmptyComponent
