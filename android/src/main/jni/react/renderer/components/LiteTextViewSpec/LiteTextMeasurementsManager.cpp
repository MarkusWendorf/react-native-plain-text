#include "LiteTextMeasurementsManager.h"

#include <fbjni/fbjni.h>
#include <folly/dynamic.h>
#include <react/jni/ReadableNativeMap.h>
#include <react/renderer/core/conversions.h>

using namespace facebook::jni;

namespace facebook::react {

Size LiteTextMeasurementsManager::measure(
    SurfaceId surfaceId,
    const LiteTextViewProps &props,
    LayoutConstraints layoutConstraints) const {
  const jni::global_ref<jobject> &fabricUIManager =
      contextContainer_->at<jni::global_ref<jobject>>("FabricUIManager");

  static auto measure =
      jni::findClassStatic("com/facebook/react/fabric/FabricUIManager")
          ->getMethod<jlong(
              jint,
              jstring,
              ReadableMap::javaobject,
              ReadableMap::javaobject,
              ReadableMap::javaobject,
              jfloat,
              jfloat,
              jfloat,
              jfloat)>("measure");

  auto minimumSize = layoutConstraints.minimumSize;
  auto maximumSize = layoutConstraints.maximumSize;

  local_ref<JString> componentName = make_jstring("LiteTextView");

  // The generic FabricUIManager.measure path takes props as a ReadableMap; the
  // Kotlin ViewManager.measure reads "text"/"fontSize" back out to size an
  // off-screen TextView. (AndroidSwitch passes null here because its size is
  // prop-independent — ours is not.)
  folly::dynamic serializedProps = folly::dynamic::object;
  serializedProps["text"] = props.text;
  serializedProps["fontSize"] = props.fontSize;
  serializedProps["fontFamily"] = props.fontFamily;
  serializedProps["fontWeight"] = props.fontWeight;
  serializedProps["fontStyle"] = toString(props.fontStyle);

  local_ref<ReadableNativeMap::javaobject> propsRNM =
      ReadableNativeMap::newObjectCxxArgs(serializedProps);
  local_ref<ReadableMap::javaobject> propsRM = make_local(
      reinterpret_cast<ReadableMap::javaobject>(propsRNM.get()));

  return yogaMeassureToSize(measure(
      fabricUIManager,
      surfaceId,
      componentName.get(),
      nullptr,
      propsRM.get(),
      nullptr,
      minimumSize.width,
      maximumSize.width,
      minimumSize.height,
      maximumSize.height));
}

} // namespace facebook::react
