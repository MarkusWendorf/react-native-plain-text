#import "PlainTextShadowNode.h"

#import <react/renderer/core/LayoutConstraints.h>

#import <UIKit/UIKit.h>
#import <cmath>

namespace facebook::react {

Size PlainTextShadowNode::measureContent(
    const LayoutContext & /*layoutContext*/,
    const LayoutConstraints &layoutConstraints) const {
  const auto &props = getConcreteProps();

  NSString *text = [NSString stringWithUTF8String:props.text.c_str()];
  if (text == nil) {
    text = @"";
  }

  // Mirrors RNPlainTextFontFromProps in RNPlainText.mm, so the measured size
  // matches what the mounted UILabel will render.
  static NSDictionary<NSString *, NSNumber *> *weights = @{
      @"normal" : @(UIFontWeightRegular),
      @"bold" : @(UIFontWeightBold),
      @"100" : @(UIFontWeightUltraLight),
      @"200" : @(UIFontWeightThin),
      @"300" : @(UIFontWeightLight),
      @"400" : @(UIFontWeightRegular),
      @"500" : @(UIFontWeightMedium),
      @"600" : @(UIFontWeightSemibold),
      @"700" : @(UIFontWeightBold),
      @"800" : @(UIFontWeightHeavy),
      @"900" : @(UIFontWeightBlack),
  };
  NSString *fontWeightKey = [NSString stringWithUTF8String:props.fontWeight.c_str()];
  NSNumber *weightNumber = weights[fontWeightKey];
  UIFontWeight weight = weightNumber != nil ? (UIFontWeight)weightNumber.doubleValue : UIFontWeightRegular;
  BOOL italic = props.fontStyle == RNPlainTextFontStyle::Italic;

  UIFont *font;
  if (!props.fontFamily.empty()) {
    NSString *fontFamily = [NSString stringWithUTF8String:props.fontFamily.c_str()];
    UIFontDescriptor *descriptor = [UIFontDescriptor fontDescriptorWithFontAttributes:@{
        UIFontDescriptorFamilyAttribute : fontFamily,
        UIFontDescriptorTraitsAttribute : @{UIFontWeightTrait : @(weight)},
    }];
    font = [UIFont fontWithDescriptor:descriptor size:props.fontSize];
  } else {
    font = [UIFont systemFontOfSize:props.fontSize weight:weight];
  }

  if (italic) {
    UIFontDescriptor *italicDescriptor = [font.fontDescriptor
        fontDescriptorWithSymbolicTraits:font.fontDescriptor.symbolicTraits | UIFontDescriptorTraitItalic];
    font = [UIFont fontWithDescriptor:italicDescriptor size:props.fontSize];
  }

  // Build the same attributes the mounted UILabel renders with, so the measured
  // size matches. Kerning (letterSpacing) widens the text; a pinned line height
  // (lineHeight) changes each line's height. Both mirror RNPlainText.mm's
  // applyContentFromProps.
  NSMutableDictionary<NSAttributedStringKey, id> *attributes = [NSMutableDictionary dictionary];
  attributes[NSFontAttributeName] = font;

  if (props.letterSpacing != 0) {
    attributes[NSKernAttributeName] = @(props.letterSpacing);
  }

  // The per-line height used to cap numberOfLines: the pinned lineHeight when
  // set, otherwise the font's natural line height.
  Float perLineHeight = static_cast<Float>(font.lineHeight);
  if (props.lineHeight > 0) {
    NSMutableParagraphStyle *paragraphStyle = [NSMutableParagraphStyle new];
    paragraphStyle.minimumLineHeight = props.lineHeight;
    paragraphStyle.maximumLineHeight = props.lineHeight;
    attributes[NSParagraphStyleAttributeName] = paragraphStyle;
    perLineHeight = static_cast<Float>(props.lineHeight);
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
                                attributes:attributes
                                   context:nil];

  Size size{
      .width = static_cast<Float>(std::ceil(rect.size.width)),
      .height = static_cast<Float>(std::ceil(rect.size.height)),
  };

  // Cap the height to numberOfLines (0 = unlimited), matching the mounted
  // UILabel's own line clamp. UILabel truncates to N lines of perLineHeight,
  // so bound the measured height the same way; min() keeps text that already
  // fits in fewer lines from being inflated.
  if (props.numberOfLines > 0) {
    Float maxHeight = static_cast<Float>(std::ceil(props.numberOfLines * perLineHeight));
    size.height = std::min(size.height, maxHeight);
  }

  return layoutConstraints.clamp(size);
}

} // namespace facebook::react
