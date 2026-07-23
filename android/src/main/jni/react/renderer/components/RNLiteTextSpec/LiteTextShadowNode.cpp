#include "LiteTextShadowNode.h"

#include <react/renderer/core/LayoutContext.h>

namespace facebook::react {

// Note: `RNLiteTextComponentName` is defined by the generated ShadowNodes.cpp
// (as "RNLiteText"); we reuse that symbol rather than redefining it so our
// component handle matches the generated one.

void LiteTextShadowNode::setLiteTextMeasurementsManager(
    const std::shared_ptr<LiteTextMeasurementsManager> &measurementsManager) {
  ensureUnsealed();
  measurementsManager_ = measurementsManager;
}

Size LiteTextShadowNode::measureContent(
    const LayoutContext & /*layoutContext*/,
    const LayoutConstraints &layoutConstraints) const {
  return measurementsManager_->measure(
      getSurfaceId(), getConcreteProps(), layoutConstraints);
}

} // namespace facebook::react
