#import "RNPlainText.h"

#import <React/RCTConversions.h>
#import <React/RCTUtils.h>
#import <react/renderer/components/RNPlainTextSpec/Props.h>
#import <react/renderer/components/RNPlainTextSpec/RCTComponentViewHelpers.h>

#import "PlainTextComponentDescriptor.h"
#import "PlainTextFont.h"
#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

// Mirrors RN's RCTEffectiveFontSizeMultiplierFromTextAttributes, reading RCTFontSizeMultiplier() directly since this runs on the main thread.
static CGFloat RNPlainTextFontSizeMultiplier(const RNPlainTextProps &props)
{
    return plainTextFontSizeMultiplier(props, RCTFontSizeMultiplier());
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

// textDecorationLine is a space-joined set of "underline"/"line-through"; substring presence toggles each independently, mirroring RN <Text>.
static BOOL RNPlainTextHasUnderline(const std::string &textDecorationLine)
{
    return textDecorationLine.find("underline") != std::string::npos;
}

static BOOL RNPlainTextHasLineThrough(const std::string &textDecorationLine)
{
    return textDecorationLine.find("line-through") != std::string::npos;
}

// Maps textDecorationStyle onto an NSUnderlineStyle (shared by the underline
// and strikethrough attributes). Mirrors RN <Text>'s iOS mapping
// (RCTNSUnderlineStyleFromTextDecorationStyle): 'double' is native; 'dotted'/
// 'dashed' use UIKit's pattern bits as an approximation. 'wavy' has no UIKit
// equivalent without a custom drawing pass, so it falls back to a single line.
static NSUnderlineStyle RNPlainTextUnderlineStyleFromProp(RNPlainTextTextDecorationStyle textDecorationStyle)
{
    switch (textDecorationStyle) {
        case RNPlainTextTextDecorationStyle::Solid:
            return NSUnderlineStyleSingle;
        case RNPlainTextTextDecorationStyle::Double:
            return NSUnderlineStyleDouble;
        case RNPlainTextTextDecorationStyle::Dotted:
            return NSUnderlineStyleSingle | NSUnderlinePatternDot;
        case RNPlainTextTextDecorationStyle::Dashed:
            return NSUnderlineStyleSingle | NSUnderlinePatternDash;
        case RNPlainTextTextDecorationStyle::Wavy:
            return NSUnderlineStyleSingle;
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

// UILabel vertically centers an overtall frame, but RN <Text> on iOS always top-aligns, so this subclass forces top alignment (textAlignVertical is Android-only).
@interface RNPlainTextLabel : UILabel
// When lineHeight exceeds the font's line height, TextKit's extra per-line space falls below the glyphs; verticalTextShift moves the whole drawn block (glyphs plus underline/strikethrough) up by half that extra, unlike NSBaselineOffsetAttributeName which shifts only glyphs.
@property (nonatomic) CGFloat verticalTextShift;
@end

@implementation RNPlainTextLabel
- (CGRect)textRectForBounds:(CGRect)bounds limitedToNumberOfLines:(NSInteger)numberOfLines
{
    CGRect rect = [super textRectForBounds:bounds limitedToNumberOfLines:numberOfLines];
    rect.origin.y = bounds.origin.y - self.verticalTextShift;
    return rect;
}

- (void)drawTextInRect:(CGRect)rect
{
    [super drawTextInRect:[self textRectForBounds:rect limitedToNumberOfLines:self.numberOfLines]];
}
@end

@implementation RNPlainText {
    RNPlainTextLabel * _label;
    // Forces the first -updateProps to apply unconditionally, since _label starts with UILabel's factory defaults (e.g. 17pt font) rather than _props' defaults, so a no-op diff would otherwise skip applying them.
    BOOL _forceApplyProps;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<PlainTextComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    _label = [[RNPlainTextLabel alloc] init];
    // UILabel's default NSLineBreakStrategyStandard wraps earlier than measureContent's boundingRectWithSize:, so disable it to match measurement and RN <Text>.
    _label.lineBreakStrategy = NSLineBreakStrategyNone;

    // _props must hold RNPlainTextProps from the start since -updateProps and -traitCollectionDidChange both static_pointer_cast it.
    static const auto defaultProps = std::make_shared<const RNPlainTextProps>();
    _props = defaultProps;

    _forceApplyProps = YES;

    self.contentView = _label;
  }

  return self;
}

// Once lineHeight or letterSpacing is set, text/font/color/alignment must go through an NSAttributedString since UILabel has no plain properties for them.
// SYNC: PlainTextShadowNode::measureContent must mirror every attribute set here (font excepted, both go through plainTextFont) or measured size won't match drawn text.
- (void)applyContentFromProps:(const RNPlainTextProps &)props
{
    CGFloat fontSizeMultiplier = RNPlainTextFontSizeMultiplier(props);
    UIFont *font = plainTextFont(props, fontSizeMultiplier);
    UIColor *color = props.color ? RCTUIColorFromSharedColor(props.color) : [UIColor blackColor];
    NSTextAlignment alignment = RNPlainTextAlignmentFromProp(props.textAlign);
    NSString *text = [NSString stringWithUTF8String:props.text.c_str()] ?: @"";

    BOOL hasLineHeight = props.lineHeight > 0;
    BOOL hasLetterSpacing = props.letterSpacing != 0;
    BOOL hasUnderline = RNPlainTextHasUnderline(props.textDecorationLine);
    BOOL hasLineThrough = RNPlainTextHasLineThrough(props.textDecorationLine);
    BOOL hasTextDecoration = hasUnderline || hasLineThrough;

    if (!hasLineHeight && !hasLetterSpacing && !hasTextDecoration) {
        // Explicitly nil attributedText: a view recycled from an attributed instance kept the old kerning/spacing even after .text and every prop were correct, so setting .text alone isn't enough.
        _label.attributedText = nil;
        _label.font = font;
        _label.textColor = color;
        _label.textAlignment = alignment;
        _label.text = text;
        _label.verticalTextShift = 0;
        return;
    }

    NSMutableDictionary<NSAttributedStringKey, id> *attributes = [NSMutableDictionary dictionary];
    attributes[NSFontAttributeName] = font;
    attributes[NSForegroundColorAttributeName] = color;

    // letterSpacing is in points, applied directly as kerning (mirrors RN <Text>).
    if (hasLetterSpacing) {
        attributes[NSKernAttributeName] = @(props.letterSpacing);
    }

    // Underline / strikethrough. UILabel has no plain property for either, so
    // like lineHeight/letterSpacing they force the attributed path. The line's
    // style follows textDecorationStyle; its color follows textDecorationColor
    // when set, otherwise the text color (matching RN <Text>).
    NSUnderlineStyle decorationStyle = RNPlainTextUnderlineStyleFromProp(props.textDecorationStyle);
    UIColor *decorationColor = props.textDecorationColor ? RCTUIColorFromSharedColor(props.textDecorationColor) : nil;
    if (hasUnderline) {
        attributes[NSUnderlineStyleAttributeName] = @(decorationStyle);
        if (decorationColor) {
            attributes[NSUnderlineColorAttributeName] = decorationColor;
        }
    }
    if (hasLineThrough) {
        attributes[NSStrikethroughStyleAttributeName] = @(decorationStyle);
        if (decorationColor) {
            attributes[NSStrikethroughColorAttributeName] = decorationColor;
        }
    }

    NSMutableParagraphStyle *paragraphStyle = [NSMutableParagraphStyle new];
    paragraphStyle.alignment = alignment;
    // A paragraph style overrides the label's own lineBreakMode, so carry ellipsizeMode into it too.
    paragraphStyle.lineBreakMode = RNPlainTextLineBreakModeFromProp(props.ellipsizeMode);

    CGFloat verticalTextShift = 0;
    if (hasLineHeight) {
        CGFloat lineHeight = props.lineHeight * fontSizeMultiplier;
        paragraphStyle.minimumLineHeight = lineHeight;
        paragraphStyle.maximumLineHeight = lineHeight;
        // Shift the drawn block up by half the extra space to center it in the enlarged line box (see verticalTextShift).
        if (lineHeight >= font.lineHeight) {
            verticalTextShift = (lineHeight - font.lineHeight) / 2.0;
        }
    }
    _label.verticalTextShift = verticalTextShift;

    attributes[NSParagraphStyleAttributeName] = paragraphStyle;
    _label.attributedText = [[NSAttributedString alloc] initWithString:text attributes:attributes];
}

// A Dynamic Type change alone touches no prop, so updateProps's diff never fires; re-derive content here since UIKit calls this independent of Fabric.
// SYNC: PlainTextView.onConfigurationChanged is the Android counterpart and must cover the same set of scaled values.
- (void)traitCollectionDidChange:(UITraitCollection *)previousTraitCollection
{
    [super traitCollectionDidChange:previousTraitCollection];

    if ([self.traitCollection.preferredContentSizeCategory
            isEqualToString:previousTraitCollection.preferredContentSizeCategory]) {
        return;
    }

    const auto &props = *std::static_pointer_cast<RNPlainTextProps const>(_props);
    if (props.allowFontScaling) {
        [self applyContentFromProps:props];
    }
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<RNPlainTextProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<RNPlainTextProps const>(props);

    // These all feed applyContentFromProps since they may share an attributed string (ellipsizeMode via its paragraph style).
    if (_forceApplyProps ||
        oldViewProps.text != newViewProps.text ||
        oldViewProps.fontSize != newViewProps.fontSize ||
        oldViewProps.fontFamily != newViewProps.fontFamily ||
        oldViewProps.fontWeight != newViewProps.fontWeight ||
        oldViewProps.fontStyle != newViewProps.fontStyle ||
        oldViewProps.fontVariant != newViewProps.fontVariant ||
        oldViewProps.fontVariationSettings != newViewProps.fontVariationSettings ||
        oldViewProps.textAlign != newViewProps.textAlign ||
        oldViewProps.color != newViewProps.color ||
        oldViewProps.lineHeight != newViewProps.lineHeight ||
        oldViewProps.letterSpacing != newViewProps.letterSpacing ||
        oldViewProps.textDecorationLine != newViewProps.textDecorationLine ||
        oldViewProps.textDecorationColor != newViewProps.textDecorationColor ||
        oldViewProps.textDecorationStyle != newViewProps.textDecorationStyle ||
        oldViewProps.ellipsizeMode != newViewProps.ellipsizeMode ||
        oldViewProps.allowFontScaling != newViewProps.allowFontScaling ||
        oldViewProps.maxFontSizeMultiplier != newViewProps.maxFontSizeMultiplier) {
        [self applyContentFromProps:newViewProps];
    }

    if (_forceApplyProps || oldViewProps.numberOfLines != newViewProps.numberOfLines) {
        _label.numberOfLines = newViewProps.numberOfLines;
    }

    if (_forceApplyProps || oldViewProps.ellipsizeMode != newViewProps.ellipsizeMode) {
        _label.lineBreakMode = RNPlainTextLineBreakModeFromProp(newViewProps.ellipsizeMode);
    }

    _forceApplyProps = NO;

    [super updateProps:props oldProps:oldProps];
}

@end
