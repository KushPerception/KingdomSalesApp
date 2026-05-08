import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { PurpleColor } from '../../utility/colors';

const ButtonWithLoader = props => {
  const { title, onPress, loading } = props;

  const styles = StyleSheet.create({
    loadMoreBtn: {
      paddingVertical: 10,
      paddingHorizontal: 25,
      backgroundColor: PurpleColor,
      borderRadius: 4,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    btnText: {
      color: 'white',
      fontSize: 15,
      textAlign: 'center',
    },
  });

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      //On Click of button load more data
      style={styles.loadMoreBtn}
    >
      <Text style={styles.btnText}>{title}</Text>
      {loading ? (
        <ActivityIndicator color="white" style={{ marginLeft: 8 }} />
      ) : null}
    </TouchableOpacity>
  );
};

export default ButtonWithLoader;
