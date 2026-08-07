// Consumed by RN autolinking. `cmakeListsPath` points the Android build at
// our custom JNI CMakeLists (android/src/main/jni/CMakeLists.txt) instead of
// the generated default, so the measuring ShadowNode / ComponentDescriptor
// get compiled and intrinsic sizing works.
module.exports = {
  dependency: {
    platforms: {
      android: {
        cmakeListsPath: 'src/main/jni/CMakeLists.txt',
      },
    },
  },
};
