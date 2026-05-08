import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  Platform,
} from "react-native";
import {
  TopBarHeaderIcon,
  BackWhiteIcon,
  AddUserIcon,
  LogoutIcon,
} from "../../Images/index";
import { BlackColor, whiteColor } from "../../utility/colors";
import { fonts } from "../../utility/GlobalStyles";
import Strings from "../../utility/strings";
const Header = (props) => {
  let {
    Title,
    RightIcon,
    onPressRight,
    OnlyLogo = true,
    OnlyTitle,
    BackTitle,
    onBackPress,
    RightTitleBackTitle,
    RightTitle,
    CenterTitleRightIcon,
    HomeScreenHeader,
    onPressRight2,
    DriverHomeHeader,
    onSyncPress,
    sync,
    InternetStatus,
    driverOrd,
  } = props;
  return (
    <View>
      {OnlyTitle ? (
        <ImageBackground
          source={TopBarHeaderIcon}
          style={styles.TopHeaderImageCenterTitle}
        >
          <Text style={styles.OnlyTitleTextStyle}>{Title}</Text>
        </ImageBackground>
      ) : (
        false
      )}

      {BackTitle ? (
        <ImageBackground
          source={TopBarHeaderIcon}
          style={styles.LeftBackArrowTouch}
        >
          <TouchableOpacity onPress={onBackPress} style={styles.LeftIconTouch}>
            <Image
              resizeMode="contain"
              source={BackWhiteIcon}
              style={styles.AddIconStyle}
            />
          </TouchableOpacity>
          <View>
            <Text
              style={[
                styles.BactTitleTextStyle,
                { marginLeft: InternetStatus ? 20 : 0 },
              ]}
            >
              {Title}
            </Text>
            {driverOrd && (
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <Text
                  style={{
                    ...styles.BactTitleTextStyle,
                    width: 125,
                    height: 21,
                    borderRadius: 11,
                    backgroundColor: InternetStatus
                      ? "transparent"
                      : BlackColor,
                    textAlign: "center",
                    fontWeight: "400",
                    fontStyle: "normal",
                    color: InternetStatus
                      ? "rgba(70, 222, 113, 1)"
                      : " rgba(255, 118, 118, 1)",
                  }}
                >
                  {InternetStatus ? "Online" : "You're Offline"}
                </Text>
              </View>
            )}
          </View>
          <View style={{ marginRight: 60 }} />
        </ImageBackground>
      ) : (
        false
      )}

      {CenterTitleRightIcon ? (
        <ImageBackground
          source={TopBarHeaderIcon}
          style={styles.CenterTitleRightIconImage}
        >
          <View />
          <Text style={[styles.BactTitleTextStyle, { marginLeft: 20 }]}>
            {Title}
          </Text>
          <TouchableOpacity
            onPress={onPressRight}
            style={styles.RightIconTouch}
          >
            <Image source={AddUserIcon} style={styles.AddIconStyle} />
          </TouchableOpacity>
        </ImageBackground>
      ) : (
        false
      )}

      {HomeScreenHeader ? (
        <ImageBackground
          source={TopBarHeaderIcon}
          style={styles.CenterTitleRightIconImage}
        >
          <View />
          <Text style={[styles.BactTitleTextStyle, { marginLeft: 65 }]}>
            {Title}
          </Text>
          <View style={{ flexDirection: "row" }}>
            {/* <TouchableOpacity
              onPress={onPressRight}
              style={styles.RightIconTouch}
            >
              <Image source={AddUserIcon} style={styles.AddIconStyle} />
            </TouchableOpacity> */}
            <TouchableOpacity
              onPress={onPressRight2}
              style={styles.RightIconTouch}
            >
              <Image source={LogoutIcon} style={styles.AddIconStyle} />
            </TouchableOpacity>
          </View>
        </ImageBackground>
      ) : (
        false
      )}

      {RightTitleBackTitle ? (
        <ImageBackground
          source={TopBarHeaderIcon}
          style={styles.CenterTitleRightIconImage}
        >
          <TouchableOpacity style={styles.LeftIconTouch} onPress={onBackPress}>
            <Image
              source={BackWhiteIcon}
              style={styles.AddIconStyle}
              resizeMode={"contain"}
            />
          </TouchableOpacity>
          <View>
            <Text
              style={[
                styles.BactTitleTextStyle,
                { marginLeft: InternetStatus ? 20 : 0 },
              ]}
            >
              {Title}
            </Text>
            {driverOrd && (
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <Text
                  style={{
                    ...styles.BactTitleTextStyle,
                    width: 125,
                    height: 21,
                    borderRadius: 11,
                    backgroundColor: InternetStatus
                      ? "transparent"
                      : BlackColor,
                    textAlign: "center",
                    fontWeight: "400",
                    fontStyle: "normal",
                    color: InternetStatus
                      ? "rgba(70, 222, 113, 1)"
                      : " rgba(255, 118, 118, 1)",
                  }}
                >
                  {InternetStatus ? "Online" : "You're Offline"}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={onPressRight} style={{ marginRight: 20 }}>
            <Text
              style={{
                color: whiteColor,
                fontFamily: fonts.Font_Medium,
              }}
            >
              {RightTitle}
            </Text>
          </TouchableOpacity>
        </ImageBackground>
      ) : (
        false
      )}

      {DriverHomeHeader ? (
        <ImageBackground
          source={TopBarHeaderIcon}
          // style={styles.CenterTitleRightIconImage}
        >
          <View style={styles.CenterTitleRightIconImage}>
            {sync && (
              <TouchableOpacity
                style={{
                  ...styles.LeftIconTouch,
                  backgroundColor: "green",
                  marginLeft: 10,
                  width: 50,
                  height: 40,
                  borderRadius: 6,
                  paddingLeft: 0,
                }}
                onPress={onSyncPress}
              >
                <Text
                  style={{
                    color: whiteColor,
                    fontFamily: fonts.Font_Medium,
                    fontSize: 16,
                    textAlign: "center",
                  }}
                >
                  {Strings.syncOrder}
                </Text>
              </TouchableOpacity>
            )}
            <View>
              <Text style={[styles.BactTitleTextStyle, { marginLeft: 20 }]}>
                {Title}
              </Text>
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <Text
                  style={{
                    ...styles.BactTitleTextStyle,
                    width: 125,
                    height: 21,
                    borderRadius: 11,
                    backgroundColor: InternetStatus
                      ? "transparent"
                      : BlackColor,
                    textAlign: "center",
                    fontWeight: "400",
                    fontStyle: "normal",
                    color: InternetStatus
                      ? "rgba(70, 222, 113, 1)"
                      : " rgba(255, 118, 118, 1)",
                  }}
                >
                  {InternetStatus ? "Online" : "You're Offline"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onPressRight}
              style={styles.RightIconTouch}
            >
              <Image source={LogoutIcon} style={styles.AddIconStyle} />
            </TouchableOpacity>
          </View>
        </ImageBackground>
      ) : (
        false
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  HeaderRowContainer: {
    width: "100%",
    height: 60,
    marginTop: 40,
    alignItems: "center",
  },
  TopHeaderImageCenterTitle: {
    width: "100%",
    height: 60,
    marginTop: Platform.OS === "ios" ? 50 : 30,
    justifyContent: "center",
    alignItems: "center",
  },
  LogoImageStyle: {
    width: "50%",
    height: 60,
  },
  AddIconStyle: {
    width: 20,
    height: 20,
  },
  RightIconTouch: {
    width: 50,
    height: 60,
    justifyContent: "center",
    paddingLeft: 10,
  },
  OnlyTitleTextStyle: {
    fontSize: 18,
    fontFamily: fonts.Font_Medium,
    color: whiteColor,
  },
  HeaderTitleTextStyle: {
    fontFamily: fonts.Font_Medium,
    color: whiteColor,
  },
  LeftBackArrowTouch: {
    width: "100%",
    height: 60,
    marginTop: Platform.OS === "ios" ? 50 : 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  LeftIconTouch: {
    width: 50,
    height: 50,
    justifyContent: "center",
    paddingLeft: 10,
  },
  BactTitleTextStyle: {
    color: whiteColor,
    fontFamily: fonts.Font_Medium,
    fontSize: 16,
  },
  CenterTitleRightIconImage: {
    width: "100%",
    height: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Platform.OS === "ios" ? 50 : 30,
    alignItems: "center",
  },
});
export default Header;
