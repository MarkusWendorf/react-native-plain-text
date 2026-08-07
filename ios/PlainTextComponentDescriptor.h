#pragma once

#import "PlainTextShadowNode.h"

#include <react/renderer/core/ConcreteComponentDescriptor.h>

namespace facebook::react {

/*
 * `ComponentDescriptor` for <RNPlainText>, built on `PlainTextShadowNode`
 * instead of the codegen-generated shadow node so the component gets a
 * measure function. `RNPlainText.mm` registers this via
 * `componentDescriptorProvider` in place of the generated descriptor.
 */
using PlainTextComponentDescriptor =
    ConcreteComponentDescriptor<PlainTextShadowNode>;

} // namespace facebook::react
