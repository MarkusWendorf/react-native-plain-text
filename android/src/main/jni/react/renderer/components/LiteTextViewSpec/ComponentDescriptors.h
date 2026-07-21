/*
 * Override for the codegen-generated
 * `react/renderer/components/LiteTextViewSpec/ComponentDescriptors.h`.
 *
 * Autolinking generates a registration that does:
 *   #include <react/renderer/components/LiteTextViewSpec/ComponentDescriptors.h>
 *   providerRegistry->add(
 *       concreteComponentDescriptorProvider<LiteTextViewComponentDescriptor>());
 *
 * The generated header defines `LiteTextViewComponentDescriptor` as a plain
 * (non-measuring) `ConcreteComponentDescriptor<LiteTextViewShadowNode>`. Our
 * custom JNI CMakeLists puts this directory ahead of the generated one on the
 * include path, so this file shadows the generated header and `Concrete...
 * Provider<LiteTextViewComponentDescriptor>()` instead registers our measuring
 * descriptor — without the app or autolinking needing any changes.
 *
 * See android/src/main/jni/CMakeLists.txt and react-native.config.js.
 */

#pragma once

#include "LiteTextMeasurementsManager.h"
#include "LiteTextShadowNode.h"

#include <react/renderer/core/ConcreteComponentDescriptor.h>

namespace facebook::react {

class LiteTextViewComponentDescriptor final
    : public ConcreteComponentDescriptor<LiteTextShadowNode> {
 public:
  LiteTextViewComponentDescriptor(const ComponentDescriptorParameters &parameters)
      : ConcreteComponentDescriptor(parameters),
        measurementsManager_(
            std::make_shared<LiteTextMeasurementsManager>(contextContainer_)) {}

  void adopt(ShadowNode &shadowNode) const override {
    ConcreteComponentDescriptor::adopt(shadowNode);

    auto &liteTextShadowNode = static_cast<LiteTextShadowNode &>(shadowNode);

    // `LiteTextShadowNode` uses `LiteTextMeasurementsManager` to provide
    // measurements to Yoga.
    liteTextShadowNode.setLiteTextMeasurementsManager(measurementsManager_);
  }

 private:
  const std::shared_ptr<LiteTextMeasurementsManager> measurementsManager_;
};

} // namespace facebook::react
