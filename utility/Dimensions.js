import {Dimensions, useWindowDimensions} from 'react-native';
import {useState, useEffect} from 'react';

export const isPortrait = () => {
  const dimension = Dimensions.get('screen');
  return dimension.height >= dimension.width;
};

export const isLandscape = () => {
  const dimension = Dimensions.get('screen');
  return dimension.width >= dimension.height;
};

// react-native-device-info removed; tablet detection via screen aspect ratio
export const isTablet = () => {
  const {width, height} = Dimensions.get('screen');
  const ratio = Math.max(width, height) / Math.min(width, height);
  return Math.min(width, height) >= 600 && ratio < 2;
};

export const isPhone = () => !isTablet();

export const useDeviceDimensions = () => {
  const {width, height} = useWindowDimensions();
  return {
    HEIGHT: Math.round(height),
    WIDTH: Math.round(width),
    isTablet,
  };
};
