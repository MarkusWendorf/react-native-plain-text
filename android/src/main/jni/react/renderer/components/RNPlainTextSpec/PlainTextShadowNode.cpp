#include "PlainTextShadowNode.h"

#include <react/renderer/core/LayoutContext.h>

namespace facebook::react {

void PlainTextShadowNode::setPlainTextMeasurementsManager(
    const std::shared_ptr<PlainTextMeasurementsManager> &measurementsManager) {
  ensureUnsealed();
  measurementsManager_ = measurementsManager;
}

Size PlainTextShadowNode::measureContent(
    const LayoutContext & /*layoutContext*/,
    const LayoutConstraints &layoutConstraints) const {
  return measurementsManager_->measure(
      getSurfaceId(), getConcreteProps(), layoutConstraints);
}

Float PlainTextShadowNode::baseline(
    const LayoutContext & /*layoutContext*/,
    Size size) const {
  return measurementsManager_->baseline(getSurfaceId(), getConcreteProps(), size);
}

} // namespace facebook::react
