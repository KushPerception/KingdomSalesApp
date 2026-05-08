import PropTypes from 'prop-types';
import React from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  Platform,TouchableOpacity
} from 'react-native';

const Card = props => {
  const { children, elevation, shadowOpacity,onPress, disabled  } = props;

  const cardStyle = Platform.select({
    ios: () => 
      StyleSheet.create({
        container: {
          shadowRadius:elevation, 
          shadowOpacity:shadowOpacity, 
          shadowOffset:{ width: 0, height: elevation },

          backgroundColor: props.backgroundColor,
        }
      }),
    android: () => 
      StyleSheet.create({
        container: {
          elevation:elevation,
          backgroundColor: props.backgroundColor,
        }
      })
  })();

  return(
    <View>
    {disabled?
      <View style={[cardStyle.container, props.style]}>
      {children}
    </View>
    :
    <TouchableOpacity  onPress = {onPress} style={[cardStyle.container, props.style]}>
      {children}
    </TouchableOpacity>
    }

    </View>
   
  )

}

Card.prototype = {
  backgroundColor: PropTypes.string,
  elevation: PropTypes.number,
  cornerRadius: PropTypes.number,
  shadowOpacity: PropTypes.number
}

Card.defaultProps = {
  backgroundColor: '#ffffff',
  elevation: 3,
  cornerRadius: 5,
  shadowOpacity: 0.1
}

export default Card