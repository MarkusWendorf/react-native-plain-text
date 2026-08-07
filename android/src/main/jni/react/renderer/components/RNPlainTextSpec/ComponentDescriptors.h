/*
 * Override for the codegen-generated ComponentDescriptors.h. Our custom JNI
 * CMakeLists puts this directory ahead of the generated one on the include path,
 * so this shadows the generated header and autolinking's
 * `concreteComponentDescriptorProvider<RNPlainTextComponentDescriptor>()` picks up
 * our measuring descriptor instead of the generated non-measuring one — no changes
 * needed to the app or to autolinking.
 *
 * See android/src/main/jni/CMakeLists.txt and react-native.config.js.
 */

#pragma once

#include "PlainTextMeasurementsManager.h"
#include "PlainTextShadowNode.h"

#include <react/renderer/core/ConcreteComponentDescriptor.h>

namespace facebook::react {

class RNPlainTextComponentDescriptor final
    : public ConcreteComponentDescriptor<PlainTextShadowNode> {
 public:
  RNPlainTextComponentDescriptor(const ComponentDescriptorParameters &parameters)
      : ConcreteComponentDescriptor(parameters),
        measurementsManager_(
            std::make_shared<PlainTextMeasurementsManager>(contextContainer_)) {}

  void adopt(ShadowNode &shadowNode) const override {
    ConcreteComponentDescriptor::adopt(shadowNode);

    auto &plainTextShadowNode = static_cast<PlainTextShadowNode &>(shadowNode);

    plainTextShadowNode.setPlainTextMeasurementsManager(measurementsManager_);
  }

 private:
  const std::shared_ptr<PlainTextMeasurementsManager> measurementsManager_;
};

} // namespace facebook::react
