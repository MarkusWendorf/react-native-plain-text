#import "LiteTextShadowNode.h"

#import <react/renderer/core/LayoutConstraints.h>

#import <UIKit/UIKit.h>
#import <cmath>

namespace facebook::react {

Size LiteTextShadowNode::measureContent(
    const LayoutContext & /*layoutContext*/,
    const LayoutConstraints &layoutConstraints) const {
  const auto &props = getConcreteProps();

  NSString *text = [NSString stringWithUTF8String:props.text.c_str()];
  if (text == nil) {
    text = @"";
  }

  // Mirrors LiteTextFontFromProps in LiteTextView.mm — falls back to the
  // system font when fontFamily is unset or names a font UIKit can't resolve,
  // so the measured size matches what the mounted UILabel will render.
  UIFont *font;
  if (!props.fontFamily.empty()) {
    NSString *fontFamily = [NSString stringWithUTF8String:props.fontFamily.c_str()];
    font = [UIFont fontWithName:fontFamily size:props.fontSize];
  }
  if (font == nil) {
    font = [UIFont systemFontOfSize:props.fontSize];
  }

  // Measure with the same text engine that renders the UILabel (CoreText, via
  // NSString drawing). This runs on the Fabric shadow thread; NSAttributed
  // string measurement is thread-safe. Height is unbounded so multi-line text
  // grows vertically; width is capped to the constraint so wrapping matches
  // what the mounted UILabel will do.
  CGSize maxSize =
      CGSizeMake(layoutConstraints.maximumSize.width, CGFLOAT_MAX);

  CGRect rect = [text boundingRectWithSize:maxSize
                                   options:NSStringDrawingUsesLineFragmentOrigin
                                attributes:@{NSFontAttributeName : font}
                                   context:nil];

  Size size{
      .width = static_cast<Float>(std::ceil(rect.size.width)),
      .height = static_cast<Float>(std::ceil(rect.size.height)),
  };

  return layoutConstraints.clamp(size);
}

} // namespace facebook::react
