import { Dimensions } from 'react-native';

export const WINDOW_WIDTH = Dimensions.get('window').width;
export const WINDOW_HEIGHT = Dimensions.get('window').height;

// MOCKUP_DEVICE_WIDTH
export const MOCKUP_DEVICE_WIDTH = 375;

// MOCKUP_DEVICE_HEIGHT
export const MOCKUP_DEVICE_HEIGHT = 812;

export const W = (pixel) => {
  return (pixel * WINDOW_WIDTH) / MOCKUP_DEVICE_WIDTH;
};

export const H = (pixel) => {
  return (pixel * WINDOW_HEIGHT) / MOCKUP_DEVICE_HEIGHT;
};

export const fonts = {
  Font_Black: 'Roboto-Black',
  Font_BlackItalic: 'Roboto-BlackItalic',
  Font_Bold: 'Roboto-Bold',
  Font_BoldItalic: 'Roboto-BoldItalic',
  Font_Italic: 'Roboto-Italic',
  Font_Light: 'Roboto-Light',
  Font_LightItalic: 'Roboto-LightItalic',
  Font_Medium: 'Roboto-Medium',
  Font_MediumItalic: 'Roboto-MediumItalic',
  Font_Regular: 'Roboto-Regular',
  Font_Thin: 'Roboto-Thin',
  Font_ThinItalic: 'Roboto-ThinItalic',
  Lato_Black: 'Lato-Black',
  Lato_BlackItalic: 'Lato-BlackItalic',
  Lato_Bold: 'Lato-Bold',
  Lato_BoldItalic: 'Lato-BoldItalic',
  Lato_Italic: 'Lato-Italic',
  Lato_Light: 'Lato-Light',
  Lato_LightItalic: 'Lato-LightItalic',
  Lato_Regular: 'Lato-Regular',
  Lato_MediumItalic: 'Lato-HairLineItalic',
  Lato_Regular: 'Lato-Regular',

}

// export const fonts = {
//   Font_Black: 'Lato-Black',
//   Font_BlackItalic: 'Lato-BlackItalic',
//   Font_Bold: 'Lato-Bold',
//   Font_BoldItalic: 'Lato-BoldItalic',
//   Font_Italic: 'Lato-Italic',
//   Font_Light: 'Lato-Light',
//   Font_LightItalic: 'Lato-LightItalic',
//   Font_Medium: 'Lato-Regular',
//   Font_MediumItalic: 'Lato-HairLineItalic',
//   Font_Regular: 'Lato-Regular',
//  // Font_Thin: 'Roboto-Thin',
//  // Font_ThinItalic: 'Roboto-ThinItalic',
// }