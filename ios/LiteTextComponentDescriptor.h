#pragma once

#import "LiteTextShadowNode.h"

#include <react/renderer/core/ConcreteComponentDescriptor.h>

namespace facebook::react {

/*
 * `ComponentDescriptor` for <LiteTextView>, built on our measuring
 * `LiteTextShadowNode` instead of the codegen-generated shadow node.
 * `LiteTextView.mm` registers this (via `componentDescriptorProvider`) in place
 * of the generated descriptor, which is what gives the component its measure fn.
 */
using LiteTextComponentDescriptor =
    ConcreteComponentDescriptor<LiteTextShadowNode>;

} // namespace facebook::react
