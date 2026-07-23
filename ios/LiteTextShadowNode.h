#pragma once

#include <react/renderer/components/RNLiteTextSpec/EventEmitters.h>
#include <react/renderer/components/RNLiteTextSpec/Props.h>
#include <react/renderer/components/RNLiteTextSpec/ShadowNodes.h>
#include <react/renderer/components/RNLiteTextSpec/States.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>

namespace facebook::react {

/*
 * Custom `ShadowNode` for <RNLiteText> that measures its own intrinsic size.
 *
 * The codegen-generated `RNLiteTextShadowNode` (in ShadowNodes.h) is a plain
 * `ConcreteViewShadowNode` alias with no measure function, so Yoga clips the
 * text to whatever width/height the style specifies. This subclass opts into
 * measurement by setting the `MeasurableYogaNode` trait and overriding
 * `measureContent` — Yoga then calls it during layout and uses the returned
 * size as the node's dimensions.
 *
 * The class is named differently from the generated alias to avoid a
 * redefinition clash. It reuses the generated `RNLiteTextComponentName` so
 * its component handle/name match the default, letting our ComponentDescriptor
 * override the generated one in the provider registry.
 */
class LiteTextShadowNode final : public ConcreteViewShadowNode<
                                     RNLiteTextComponentName,
                                     RNLiteTextProps,
                                     RNLiteTextEventEmitter,
                                     RNLiteTextState> {
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

  Size measureContent(
      const LayoutContext &layoutContext,
      const LayoutConstraints &layoutConstraints) const override;
};

} // namespace facebook::react
