import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { fonts, W, H } from '../../../utility/GlobalStyles';
import {
  darkBlueTextColor,
  darkGreyColor,
  lightGreyTextColor,
  lightGreyTextInputColor,
} from '../../../utility/colors';
import OutlinedTextInput from '../../CommonComponents/OutlinedTextInput';
import DatePicker from 'react-native-date-picker';
import {
  GreyArrowUp,
  GreyArrowDown,
  CheckedTickIcon,
} from '../../../Images/index';
import ListSeparator from '../../CommonComponents/ListSeparator';
import { AddGradientIcon } from '../../../Images/index';

const moment = require('moment');

const ProductData = props => {
  let { ProductItem, ProductIndex, RemoveItem, onAddMoreFunc } = props;

  //Divisions

  const Divisions = [
    {
      label: '1',
      value: 'Asphalt',
    },
    {
      label: '2',
      value: 'Blocks',
    },
    {
      label: '3',
      value: 'Cement',
    },
    {
      label: '4',
      value: 'Ready Mix',
    },
    {
      label: '5',
      value: 'Sandwash',
    },
  ];

  //States
  const [Quantity, setQuantity] = useState('');
  const [ShowTimePicker, setShowTimePicker] = useState('');
  const [OrderTime, setOrderTime] = useState(new Date());
  const [placingDate, setplacingDate] = useState(new Date());
  const [ShowPlacingDatePicker, setShowPlacingDatePicker] = useState(false);
  const [IceSpec, setIceSpec] = useState(false);
  const [PumpSpecs, setPumpSpecs] = useState(false);
  const [pipeFixing, setpipeFixing] = useState(false);
  const [Remark, setRemark] = useState('');
  const [DivisionName, setDivisionName] = useState('Select Division');
  const [ShowDivisionList, setShowDivisionList] = useState(false);

  //Function

  const onChanggeTime = selectedValue => {
    if (ShowTimePicker) {
      setShowTimePicker(!ShowTimePicker);
      setOrderTime(selectedValue);
    }
  };

  const onChangePacingDate = selectedValue => {
    setShowPlacingDatePicker(!ShowPlacingDatePicker);
    setplacingDate(selectedValue);
  };

  const OnSelectDivision = () => {
    setShowDivisionList(!ShowDivisionList);
  };

  const OnSelectDivisionName = divisionname => {
    setShowDivisionList(false);
    setDivisionName(divisionname);
  };

  const onClickSpecsType = SpecsType => {
    console.log('SpecsType', SpecsType);
    if (SpecsType === 'Ice') {
      setIceSpec(!IceSpec);
      //    setPumpSpecs(false)
      //    setpipeFixing(false)
    } else if (SpecsType === 'Pump') {
      //  setIceSpec(false)
      setPumpSpecs(!PumpSpecs);
      //  setpipeFixing(false)
    } else if (SpecsType === 'Pipefixing') {
      // setIceSpec(false)
      // setPumpSpecs(false)
      setpipeFixing(!pipeFixing);
    } else {
      setIceSpec(false);
      setPumpSpecs(false);
      setpipeFixing(false);
    }
  };

  const RenderDivisionData = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => OnSelectDivisionName(item?.value)}
        style={{ width: '100%', height: 40, justifyContent: 'center' }}
      >
        <Text style={{ paddingLeft: 20 }}>{item?.value}</Text>
      </TouchableOpacity>
    );
  };

  const renderSeparator = () => {
    return <ListSeparator />;
  };
  const RenderDivisionListEmpty = () => {
    return (
      <View>
        <Text>No Divisions Found</Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text
          style={{
            color: darkBlueTextColor,
            fontFamily: fonts.Font_Medium,
            fontSize: 16,
            marginLeft: 20,
            marginBottom: 10,
          }}
        >
          Product:{ProductIndex + 1}
        </Text>
        {ProductIndex === 0 ? (
          false
        ) : (
          <TouchableOpacity onPress={() => RemoveItem(ProductItem)}>
            <Text
              style={{
                color: 'red',
                fontFamily: fonts.Font_Regular,
                paddingRight: 20,
                fontSize: 16,
              }}
            >
              Remove
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.ScheduleDateText}>Select Division</Text>
      <View style={{ alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => OnSelectDivision()}
          style={styles.DateButtonStyle}
        >
          <View style={styles.DivisionArrowRow}>
            <Text>{DivisionName}</Text>

            <Image
              source={ShowDivisionList ? GreyArrowUp : GreyArrowDown}
              style={styles.DropdownImageStyle}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </View>

      {ShowDivisionList ? (
        <View style={{ alignItems: 'center' }}>
          <View style={styles.RenderDivisionStyle}>
            <FlatList
              data={Divisions}
              keyExtractor={(item, index) => index + ''}
              extraData={Divisions}
              ListEmptyComponent={RenderDivisionListEmpty}
              ItemSeparatorComponent={renderSeparator}
              renderItem={RenderDivisionData}
            />
          </View>
        </View>
      ) : (
        false
      )}

      {DivisionName === 'Ready Mix' ? (
        <View style={{ marginTop: 10 }}>
          <Text style={styles.ScheduleDateText}>Specs</Text>

          <View style={styles.radioBtnRowStyle}>
            {IceSpec ? (
              <TouchableOpacity
                onPress={() => onClickSpecsType('Ice')}
                style={styles.radioBtnRowTouch}
              >
                <Image
                  source={CheckedTickIcon}
                  style={styles.selectRadioIcon}
                />
                <Text style={styles.radioBtnTxt}>Ice</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => onClickSpecsType('Ice')}
                style={styles.radioBtnRowTouch}
              >
                <View style={styles.unspecButton} />
                <Text style={styles.radioBtnTxt}>Ice</Text>
              </TouchableOpacity>
            )}
            {PumpSpecs ? (
              <TouchableOpacity
                onPress={() => onClickSpecsType('Pump')}
                style={styles.radioBtnRowTouch}
              >
                <Image
                  source={CheckedTickIcon}
                  style={styles.selectRadioIcon}
                />
                <Text style={styles.radioBtnTxt}>Pump</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => onClickSpecsType('Pump')}
                style={styles.radioBtnRowTouch}
              >
                <View style={styles.unspecButton} />
                <Text style={styles.radioBtnTxt}>Pump</Text>
              </TouchableOpacity>
            )}
            {pipeFixing ? (
              <TouchableOpacity
                onPress={() => onClickSpecsType('Pipefixing')}
                style={styles.radioBtnRowTouch}
              >
                <Image
                  source={CheckedTickIcon}
                  style={styles.selectRadioIcon}
                />
                <Text style={styles.radioBtnTxt}>Pipe Fixing</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => onClickSpecsType('Pipefixing')}
                style={styles.radioBtnRowTouch}
              >
                <View style={styles.unspecButton} />
                <Text style={styles.radioBtnTxt}>Pipe Fixing</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        false
      )}

      <View style={{ marginTop: 10 }}>
        <OutlinedTextInput
          label="Quantity"
          value={Quantity}
          onChangeText={() => setQuantity(Quantity)}
        />
      </View>
      <Text style={styles.ScheduleDateText}>Time</Text>

      <View style={{ alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => setShowTimePicker(!ShowTimePicker)}
          style={styles.DateButtonStyle}
        >
          <Text>{moment(OrderTime).format('LT')}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.ScheduleDateText}>Placing Date</Text>

      <View style={{ alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => setShowPlacingDatePicker(!ShowPlacingDatePicker)}
          style={styles.DateButtonStyle}
        >
          <Text>{moment(placingDate).format('LL')}</Text>
        </TouchableOpacity>
      </View>

      <OutlinedTextInput
        label="Remark"
        value={Remark}
        MultilineLarge
        onChangeText={() => setRemark(Remark)}
      />

      <DatePicker
        modal
        open={!!ShowTimePicker}
        date={new Date()}
        mode="time"
        onConfirm={onChanggeTime}
        onCancel={() => setShowTimePicker(!ShowTimePicker)}
      />
      <DatePicker
        modal
        open={ShowPlacingDatePicker}
        date={new Date()}
        mode="date"
        minimumDate={new Date()}
        onConfirm={onChangePacingDate}
        onCancel={() => setShowPlacingDatePicker(!ShowPlacingDatePicker)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  ScheduleDateText: {
    fontFamily: fonts.Font_Medium,
    marginTop: 10,
    marginLeft: 20,
  },
  DateButtonStyle: {
    width: W(340),
    height: H(48),
    borderColor: darkGreyColor,
    borderWidth: 0.5,
    paddingLeft: 10,
    borderRadius: 5,
    justifyContent: 'center',
    marginTop: 10,
  },
  DivisionArrowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  DropdownImageStyle: {
    width: 22,
    height: 22,
    marginRight: 15,
  },
  RenderDivisionStyle: {
    width: W(340),
    height: 200,
    borderColor: lightGreyTextInputColor,
    borderWidth: 0.5,
  },

  radioBtnRowStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginLeft: 10,
  },
  radioBtnRowTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
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
});
export default ProductData;
