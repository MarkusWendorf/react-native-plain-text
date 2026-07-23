#import "RNPlainText.h"

#import <react/renderer/components/RNPlainTextSpec/Props.h>
#import <react/renderer/components/RNPlainTextSpec/RCTComponentViewHelpers.h>

#import "PlainTextComponentDescriptor.h"
#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

// Mirrors RCTFont.mm's core weight map (RCTConvert RCTFontWeight): the named
// aliases beyond "normal"/"bold" (e.g. "ultralight", "condensed") are dropped
// since codegen can't type fontWeight as an enum (see PlainTextViewNativeComponent.ts).
static UIFontWeight RNPlainTextFontWeightFromProp(const std::string &fontWeight)
{
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
    NSString *key = [NSString stringWithUTF8String:fontWeight.c_str()];
    NSNumber *weight = weights[key];
    return weight != nil ? (UIFontWeight)weight.doubleValue : UIFontWeightRegular;
}

static UIFont *RNPlainTextFontFromProps(const RNPlainTextProps &props)
{
    UIFontWeight weight = RNPlainTextFontWeightFromProp(props.fontWeight);
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

    return font;
}

static NSTextAlignment RNPlainTextAlignmentFromProp(RNPlainTextTextAlign textAlign)
{
    switch (textAlign) {
        case RNPlainTextTextAlign::Left:
            return NSTextAlignmentLeft;
        case RNPlainTextTextAlign::Right:
            return NSTextAlignmentRight;
        case RNPlainTextTextAlign::Center:
            return NSTextAlignmentCenter;
        case RNPlainTextTextAlign::Justify:
            return NSTextAlignmentJustified;
        case RNPlainTextTextAlign::Auto:
            return NSTextAlignmentNatural;
    }
}

@implementation RNPlainText {
    UILabel * _label;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<PlainTextComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNPlainTextProps>();
    _props = defaultProps;

    _label = [[UILabel alloc] init];
    _label.numberOfLines = 0;
    _label.textColor = [UIColor blackColor];
    // Seed the label's font from the prop defaults so the diff in updateProps
    // (which compares against defaultProps on first mount) is valid. Without
    // this, a view whose fontSize equals the default is never applied and the
    // label keeps UILabel's built-in 17pt — larger than the measured size, so
    // the text truncates.
    _label.font = [UIFont systemFontOfSize:defaultProps->fontSize];

    self.contentView = _label;
  }

  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<RNPlainTextProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<RNPlainTextProps const>(props);

    if (oldViewProps.text != newViewProps.text) {
        _label.text = [NSString stringWithUTF8String:newViewProps.text.c_str()];
    }

    if (oldViewProps.fontSize != newViewProps.fontSize ||
        oldViewProps.fontFamily != newViewProps.fontFamily ||
        oldViewProps.fontWeight != newViewProps.fontWeight ||
        oldViewProps.fontStyle != newViewProps.fontStyle) {
        _label.font = RNPlainTextFontFromProps(newViewProps);
    }

    if (oldViewProps.textAlign != newViewProps.textAlign) {
        _label.textAlignment = RNPlainTextAlignmentFromProp(newViewProps.textAlign);
    }

    [super updateProps:props oldProps:oldProps];
}

@end
