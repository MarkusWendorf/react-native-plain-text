#import "RNPlainText.h"

#import <React/RCTConversions.h>
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

static NSLineBreakMode RNPlainTextLineBreakModeFromProp(RNPlainTextEllipsizeMode ellipsizeMode)
{
    switch (ellipsizeMode) {
        case RNPlainTextEllipsizeMode::Head:
            return NSLineBreakByTruncatingHead;
        case RNPlainTextEllipsizeMode::Middle:
            return NSLineBreakByTruncatingMiddle;
        case RNPlainTextEllipsizeMode::Tail:
            return NSLineBreakByTruncatingTail;
        case RNPlainTextEllipsizeMode::Clip:
            return NSLineBreakByClipping;
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

// UILabel has no plain properties for lineHeight or letterSpacing, so once
// either is set the text/font/color/alignment all have to be expressed through
// an NSAttributedString. This applies whichever form is needed from the current
// props; call it whenever any text-content prop changes.
- (void)applyContentFromProps:(const RNPlainTextProps &)props
{
    UIFont *font = RNPlainTextFontFromProps(props);
    UIColor *color = props.color ? RCTUIColorFromSharedColor(props.color) : [UIColor blackColor];
    NSTextAlignment alignment = RNPlainTextAlignmentFromProp(props.textAlign);
    NSString *text = [NSString stringWithUTF8String:props.text.c_str()] ?: @"";

    BOOL hasLineHeight = props.lineHeight > 0;
    BOOL hasLetterSpacing = props.letterSpacing != 0;

    if (!hasLineHeight && !hasLetterSpacing) {
        // Plain path: let the label carry font/color/alignment directly.
        _label.font = font;
        _label.textColor = color;
        _label.textAlignment = alignment;
        _label.text = text;
        return;
    }

    NSMutableDictionary<NSAttributedStringKey, id> *attributes = [NSMutableDictionary dictionary];
    attributes[NSFontAttributeName] = font;
    attributes[NSForegroundColorAttributeName] = color;

    // letterSpacing is in points, applied directly as kerning (mirrors RN <Text>).
    if (hasLetterSpacing) {
        attributes[NSKernAttributeName] = @(props.letterSpacing);
    }

    NSMutableParagraphStyle *paragraphStyle = [NSMutableParagraphStyle new];
    paragraphStyle.alignment = alignment;
    // A paragraph style overrides the label's own lineBreakMode, so carry the
    // ellipsize mode into it to keep truncation working with attributed text.
    paragraphStyle.lineBreakMode = RNPlainTextLineBreakModeFromProp(props.ellipsizeMode);

    if (hasLineHeight) {
        // lineHeight is in points; pin the line box to it (mirrors RN <Text>).
        paragraphStyle.minimumLineHeight = props.lineHeight;
        paragraphStyle.maximumLineHeight = props.lineHeight;
        // Vertically center the glyphs within the enlarged line box, matching
        // RN <Text>'s RCTApplyBaselineOffset: shift the baseline by half the
        // difference between the requested and the font's natural line height.
        if (props.lineHeight >= font.lineHeight) {
            attributes[NSBaselineOffsetAttributeName] = @((props.lineHeight - font.lineHeight) / 2.0);
        }
    }

    attributes[NSParagraphStyleAttributeName] = paragraphStyle;
    _label.attributedText = [[NSAttributedString alloc] initWithString:text attributes:attributes];
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<RNPlainTextProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<RNPlainTextProps const>(props);

    // text/font/color/textAlign/lineHeight/letterSpacing all feed a single
    // content build (see applyContentFromProps) since they may share an
    // attributed string; ellipsizeMode does too because it lands in that
    // string's paragraph style when one is used.
    if (oldViewProps.text != newViewProps.text ||
        oldViewProps.fontSize != newViewProps.fontSize ||
        oldViewProps.fontFamily != newViewProps.fontFamily ||
        oldViewProps.fontWeight != newViewProps.fontWeight ||
        oldViewProps.fontStyle != newViewProps.fontStyle ||
        oldViewProps.textAlign != newViewProps.textAlign ||
        oldViewProps.color != newViewProps.color ||
        oldViewProps.lineHeight != newViewProps.lineHeight ||
        oldViewProps.letterSpacing != newViewProps.letterSpacing ||
        oldViewProps.ellipsizeMode != newViewProps.ellipsizeMode) {
        [self applyContentFromProps:newViewProps];
    }

    if (oldViewProps.numberOfLines != newViewProps.numberOfLines) {
        _label.numberOfLines = newViewProps.numberOfLines;
    }

    if (oldViewProps.ellipsizeMode != newViewProps.ellipsizeMode) {
        _label.lineBreakMode = RNPlainTextLineBreakModeFromProp(newViewProps.ellipsizeMode);
    }

    [super updateProps:props oldProps:oldProps];
}

@end
