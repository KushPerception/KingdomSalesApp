# Kingdom Sales App RN 0.83 Migration

This project was created with React Native CLI on `react-native@0.83.0`.

## App Identity

- App package name: `kingdomsolutionssalesapp`
- Android application ID: `com.kingdomsolutionssalesapp`
- Android namespace: `com.kingdomsolutionssalesapp`
- Display name: `K Sales`
- Android version name: `5.3.0`

## Initial Compatibility Choices

- Hermes is enabled from the RN 0.83 template.
- React Native 0.83 runs with the New Architecture enabled by default. `newArchEnabled=true` is kept in `android/gradle.properties` because some third-party libraries still check that property explicitly for Codegen.
- `@config-plugins/react-native-blob-util` was not installed because this is a bare RN CLI app. Use `react-native-blob-util` for runtime file/blob APIs.
- `rn-fetch-blob` was not installed. Existing imports should be migrated to `react-native-blob-util`.
- `@onekeyfe/react-native-splash-screen` requires Nitro, so `react-native-nitro-modules` and `@onekeyfe/react-native-native-logger` are installed explicitly.
- `@react-native-community/progress-bar-android` was removed after the first Android build attempt because it still uses obsolete Gradle/JCenter configuration and the current app code does not import it.
- `react-native-sunmi-v2-printer` needed an Android Gradle compatibility patch for Gradle 9/AGP 8. The patch is stored in `patches/react-native-sunmi-v2-printer+1.0.3.patch` and applied by the `postinstall` script.
- `react-native-blob-util` needed a small New Architecture autolinking patch so Android can compile the package wrapper expected by RN 0.83 autolinking. The patch is stored in `patches/react-native-blob-util+0.24.7.patch`.

## Installed Replacement Packages

- `@react-native-community/async-storage` -> `@react-native-async-storage/async-storage`
- `@react-native-community/masked-view` -> `@react-native-masked-view/masked-view`
- `react-native-localization` -> `react-native-localize`
- `react-native-material-textfield` -> `react-native-paper`
- `react-native-modal-datetime-picker` -> `react-native-date-picker`
- `react-native-signature-capture` -> `react-native-signature-canvas`
- `react-native-splash-screen` -> `@onekeyfe/react-native-splash-screen`
- `react-native-sunmi-inner-printer` -> `react-native-sunmi-v2-printer`

## Suggested Next Migration Order

1. Copy shared assets and constants first: `assets`, `Images`, `utility`.
2. Migrate navigation packages and update `Navigation/AppNavigation.js` for React Navigation 7.
3. Replace old import paths across screens.
4. Migrate text fields from `react-native-material-textfield` to `react-native-paper`.
5. Migrate date picker, signature, file download/PDF, and Sunmi printer flows one at a time.
6. Add Firebase config files and run Android/iOS native builds.
