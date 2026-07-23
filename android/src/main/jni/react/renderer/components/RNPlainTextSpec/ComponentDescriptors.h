/*
 * Override for the codegen-generated
 * `react/renderer/components/RNPlainTextSpec/ComponentDescriptors.h`.
 *
 * Autolinking generates a registration that does:
 *   #include <react/renderer/components/RNPlainTextSpec/ComponentDescriptors.h>
 *   providerRegistry->add(
 *       concreteComponentDescriptorProvider<RNPlainTextComponentDescriptor>());
 *
 * The generated header defines `RNPlainTextComponentDescriptor` as a plain
 * (non-measuring) `ConcreteComponentDescriptor<RNPlainTextShadowNode>`. Our
 * custom JNI CMakeLists puts this directory ahead of the generated one on the
 * include path, so this file shadows the generated header and `Concrete...
 * Provider<RNPlainTextComponentDescriptor>()` instead registers our measuring
 * descriptor — without the app or autolinking needing any changes.
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

    // `PlainTextShadowNode` uses `PlainTextMeasurementsManager` to provide
    // measurements to Yoga.
    plainTextShadowNode.setPlainTextMeasurementsManager(measurementsManager_);
  }

 private:
  const std::shared_ptr<PlainTextMeasurementsManager> measurementsManager_;
};

} // namespace facebook::react
