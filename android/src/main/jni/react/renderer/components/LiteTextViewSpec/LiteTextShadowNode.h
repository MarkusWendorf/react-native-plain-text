/*
 * Custom `ShadowNode` for <LiteTextView> that measures its own intrinsic size.
 *
 * Mirrors the iOS `LiteTextShadowNode`: the codegen-generated
 * `LiteTextViewShadowNode` (in ShadowNodes.h) is a plain `ConcreteViewShadowNode`
 * with no measure function, so Yoga clips text to the styled width/height. This
 * subclass opts into measurement by setting the `MeasurableYogaNode` trait and
 * overriding `measureContent`.
 *
 * Unlike iOS (which measures inline with CoreText), Android has no thread-safe
 * pure-C++ text measurement, so the work is delegated to a
 * `LiteTextMeasurementsManager` that hops over JNI into the platform TextView.
 *
 * The class is named differently from the generated `LiteTextViewShadowNode`
 * alias to avoid a redefinition clash, but reuses the generated
 * `LiteTextViewComponentName` so its component handle matches the default —
 * letting our `LiteTextViewComponentDescriptor` override the generated one in
 * the provider registry.
 */

#pragma once

#include "LiteTextMeasurementsManager.h"

#include <react/renderer/components/LiteTextViewSpec/EventEmitters.h>
#include <react/renderer/components/LiteTextViewSpec/Props.h>
#include <react/renderer/components/LiteTextViewSpec/ShadowNodes.h>
#include <react/renderer/components/LiteTextViewSpec/States.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>

namespace facebook::react {

class LiteTextShadowNode final : public ConcreteViewShadowNode<
                                     LiteTextViewComponentName,
                                     LiteTextViewProps,
                                     LiteTextViewEventEmitter,
                                     LiteTextViewState> {
 public:
  using ConcreteViewShadowNode::ConcreteViewShadowNode;

  static ShadowNodeTraits BaseTraits() {
    auto traits = ConcreteViewShadowNode::BaseTraits();
    // LeafYogaNode: the text has no Yoga children participating in layout.
    traits.set(ShadowNodeTraits::Trait::LeafYogaNode);
    // MeasurableYogaNode: registers `measureContent` as the Yoga measure fn.
    traits.set(ShadowNodeTraits::Trait::MeasurableYogaNode);
    return traits;
  }

  // Associates a shared `LiteTextMeasurementsManager` with the node.
  void setLiteTextMeasurementsManager(
      const std::shared_ptr<LiteTextMeasurementsManager> &measurementsManager);

  Size measureContent(
      const LayoutContext &layoutContext,
      const LayoutConstraints &layoutConstraints) const override;

 private:
  std::shared_ptr<LiteTextMeasurementsManager> measurementsManager_;
};

} // namespace facebook::react
