/*
 * Measures <RNLiteText> off the main thread by calling back into
 * `FabricUIManager.measure(...)` over JNI, which routes to
 * `RNLiteTextManager.measure(...)` on the JS/UI side. Mirrors the pattern
 * used by RN's own AndroidProgressBar/AndroidSwitch: Fabric layout runs in C++
 * on the shadow thread, so intrinsic sizing has to hop into Java to reuse the
 * platform TextView measurement.
 */

#pragma once

#include <react/renderer/components/RNLiteTextSpec/Props.h>
#include <react/renderer/core/LayoutConstraints.h>
#include <react/utils/ContextContainer.h>

namespace facebook::react {

class LiteTextMeasurementsManager {
 public:
  LiteTextMeasurementsManager(
      const std::shared_ptr<const ContextContainer> &contextContainer)
      : contextContainer_(contextContainer) {}

  Size measure(
      SurfaceId surfaceId,
      const RNLiteTextProps &props,
      LayoutConstraints layoutConstraints) const;

 private:
  const std::shared_ptr<const ContextContainer> contextContainer_;
};

} // namespace facebook::react
