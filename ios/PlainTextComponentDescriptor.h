#pragma once

#import "PlainTextShadowNode.h"

#include <react/renderer/core/ConcreteComponentDescriptor.h>

namespace facebook::react {

/*
 * `ComponentDescriptor` for <RNPlainText>, built on our measuring
 * `PlainTextShadowNode` instead of the codegen-generated shadow node.
 * `RNPlainText.mm` registers this (via `componentDescriptorProvider`) in place
 * of the generated descriptor, which is what gives the component its measure fn.
 */
using PlainTextComponentDescriptor =
    ConcreteComponentDescriptor<PlainTextShadowNode>;

} // namespace facebook::react
