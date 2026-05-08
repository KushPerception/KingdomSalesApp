import React, { useRef } from 'react';
import BottomSwipebleModal from './BottomSwipebleModal';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const Sample = props => {
  const bottomSheet = useRef();
  //function
  const OnClickOpen = () => {
    console.log('Preview ebook called');
    bottomSheet.current?.show();
  };
  return (
    <View>
      <TouchableOpacity onPress={() => OnClickOpen()}>
        <Text>Open Modal</Text>
      </TouchableOpacity>
      <BottomSwipebleModal
        draggable={true}
        hasDraggableIcon
        ref={bottomSheet}
        height={400}
      >
        <View
          showsVerticalScrollIndicator={false}
          style={{ padding: 20, marginTop: 20 }}
        >
          <Text style={{ fontSize: 16, marginTop: 10 }}>
            A paragraph is a series of sentences that are organized and
            coherent, and are all related to a single topic. Almost every piece
            of writing you do that is longer than a few sentences should be
            organized into paragraphs. This is because paragraphs show a reader
            where the subdivisions of an essay begin and end, and thus help the
            reader see the organization of the essay and grasp its main points.
          </Text>
        </View>
      </BottomSwipebleModal>
    </View>
  );
};

export default Sample;
