import React, {Component} from 'react';
import {TouchableWithoutFeedback, StyleSheet, Modal, View} from 'react-native';
import {whiteColor} from '../../utility/colors';

export default class SimpleCenterAlignModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
    };
  }

  //Function
  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }
  show() {
    this.setModalVisible(true);
  }

  close() {
    this.setModalVisible(false);
  }

  render() {
    const {onRequestClose, transparent, children, height, width} = this.props;
    const {modalVisible} = this.state;

    return (
      <View>
        <Modal
          visible={modalVisible}
          animationType={'fade'}
          transparent={true}
          onRequestClose={onRequestClose}>
          <View style={styles.modalContent}>
            <TouchableWithoutFeedback
              style={styles.CloseModalTouch}
              onPress={() => this.close()}>
              <View style={styles.modalOverlay}>
                <View style={[styles.modalcontentcontainer,{height:height,width:width}]}>{children}</View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    backgroundColor: '#25252599',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalcontentcontainer: {
   
    backgroundColor: whiteColor,
   // borderRadius: 10,
  },
  CloseModalTouch: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
