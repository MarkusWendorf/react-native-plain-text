#import "LiteTextView.h"

#import <react/renderer/components/LiteTextViewSpec/Props.h>
#import <react/renderer/components/LiteTextViewSpec/RCTComponentViewHelpers.h>

#import "LiteTextComponentDescriptor.h"
#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

static UIFont *LiteTextFontFromProps(const LiteTextViewProps &props)
{
    if (!props.fontFamily.empty()) {
        NSString *fontFamily = [NSString stringWithUTF8String:props.fontFamily.c_str()];
        UIFont *font = [UIFont fontWithName:fontFamily size:props.fontSize];
        if (font != nil) {
            return font;
        }
    }
    return [UIFont systemFontOfSize:props.fontSize];
}

static NSTextAlignment LiteTextAlignmentFromProp(LiteTextViewTextAlign textAlign)
{
    switch (textAlign) {
        case LiteTextViewTextAlign::Left:
            return NSTextAlignmentLeft;
        case LiteTextViewTextAlign::Right:
            return NSTextAlignmentRight;
        case LiteTextViewTextAlign::Center:
            return NSTextAlignmentCenter;
        case LiteTextViewTextAlign::Justify:
            return NSTextAlignmentJustified;
        case LiteTextViewTextAlign::Auto:
            return NSTextAlignmentNatural;
    }
}

@implementation LiteTextView {
    UILabel * _label;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<LiteTextComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const LiteTextViewProps>();
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
    const auto &oldViewProps = *std::static_pointer_cast<LiteTextViewProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<LiteTextViewProps const>(props);

    if (oldViewProps.text != newViewProps.text) {
        _label.text = [NSString stringWithUTF8String:newViewProps.text.c_str()];
    }

    if (oldViewProps.fontSize != newViewProps.fontSize ||
        oldViewProps.fontFamily != newViewProps.fontFamily) {
        _label.font = LiteTextFontFromProps(newViewProps);
    }

    if (oldViewProps.textAlign != newViewProps.textAlign) {
        _label.textAlignment = LiteTextAlignmentFromProp(newViewProps.textAlign);
    }

    [super updateProps:props oldProps:oldProps];
}

@end
