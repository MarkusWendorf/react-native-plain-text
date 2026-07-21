// Consumed by React Native autolinking (community CLI and Expo). The Android
// `cmakeListsPath` override points the build at our custom JNI CMakeLists
// instead of the default generated one, so our measuring ShadowNode /
// ComponentDescriptor get compiled and registered. This is what enables
// intrinsic sizing (autosizing from the text) on Android — see
// android/src/main/jni/CMakeLists.txt.
module.exports = {
  dependency: {
    platforms: {
      android: {
        cmakeListsPath: 'src/main/jni/CMakeLists.txt',
      },
    },
  },
};
