/*
 * Shared by both platforms' `PlainTextShadowNode`, so a size-affecting prop
 * can't be added to one platform's cache-invalidation comparison and
 * forgotten in the other.
 */

#pragma once

#include <react/renderer/components/RNPlainTextSpec/Props.h>
#include <react/renderer/core/ShadowNode.h>
#include <react/renderer/core/ShadowNodeFragment.h>

namespace facebook::react {

/*
 * Whether two revisions of the props would measure to the same size. Must
 * list every prop both platforms' `measureContent` reads (and, on Android,
 * every prop `PlainTextMeasurementsManager` serializes), see SYNC comment
 * in the .cpp. Yoga *style* props are excluded on purpose:
 * `YogaLayoutableShadowNode::updateYogaProps` already dirties the node on
 * style changes independently of this.
 */
bool measurementInputsEqual(
    const RNPlainTextProps &a,
    const RNPlainTextProps &b);

/*
 * Must be called from the shadow node's clone constructor, not from
 * `shouldNewRevisionDirtyMeasurement`: by then, `YogaLayoutableShadowNode::completeClone`
 * has already run with `*this`, whose `props_` the clone constructor already
 * replaced with `fragment.props`, so comparing there would always see new
 * against new. `newProps` is the new revision, and the old one is read off
 * `sourceShadowNode`.
 */
bool shouldRevisionDirtyMeasurement(
    const ShadowNode &sourceShadowNode,
    const ShadowNodeFragment &fragment,
    const RNPlainTextProps &newProps);

} // namespace facebook::react
