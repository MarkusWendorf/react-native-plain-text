#import "LiteTextView.h"

#import <react/renderer/components/LiteTextViewSpec/ComponentDescriptors.h>
#import <react/renderer/components/LiteTextViewSpec/Props.h>
#import <react/renderer/components/LiteTextViewSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

@implementation LiteTextView {
    UILabel * _label;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<LiteTextViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const LiteTextViewProps>();
    _props = defaultProps;

    _label = [[UILabel alloc] init];
    _label.numberOfLines = 0;
    _label.textColor = [UIColor blackColor];

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

    if (oldViewProps.fontSize != newViewProps.fontSize) {
        _label.font = [UIFont systemFontOfSize:newViewProps.fontSize];
    }

    [super updateProps:props oldProps:oldProps];
}

@end
