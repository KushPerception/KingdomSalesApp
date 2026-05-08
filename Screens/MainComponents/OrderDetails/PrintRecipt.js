import React,{useEffect} from 'react'
import {View,Text,Alert} from 'react-native'
import SunmiInnerPrinter from 'react-native-sunmi-v2-printer';


const PrintRecipt = () => {
//Effect
useEffect(() => {
    printDineInReceipt()
  }, [])

    const printDineInReceipt= async ()=>{
        const S1=30;
        const S2=24;
        try{
        if(SunmiInnerPrinter.hasPrinter){
        console.log("Printer available")
        await SunmiInnerPrinter.setAlignment(1);
        await SunmiInnerPrinter.setFontSize(S2);
        await SunmiInnerPrinter.printOriginalText(` \n`);
        await SunmiInnerPrinter.printOriginalText(` \n`);
        await SunmiInnerPrinter.printOriginalText(` \n`);
        await SunmiInnerPrinter.printOriginalText(`${"D.N No: BLKDN-20-10004"}\n`);
        await SunmiInnerPrinter.printOriginalText(`${"Order No: CASO-20-4359"}\n`);
        await SunmiInnerPrinter.printOriginalText(`${"Customer: ABO-HATIM BUILDING CONTRACTIONG"}\n`);
        await SunmiInnerPrinter.printOriginalText(`${"Site: AHMEDABAD"}\n`);
        await SunmiInnerPrinter.printOriginalText(`${"---------------------------------"}\n`);
        await SunmiInnerPrinter.printOriginalText(`${"ITEM"}\n`);
        await SunmiInnerPrinter.printOriginalText(`${"---------------------------------"}\n`);
        await SunmiInnerPrinter.printOriginalText(`${"H.C.B 200X200X400 7.5 N"}\n`);



        }else{
            Alert.alert("Printer not available")
        }
    
        } catch(err){
            console.log("Error",err)
      }
        }
    
    return (
        <View>
           <Text>Print functionality</Text> 
        </View>
    )
}

export default PrintRecipt
