#import "PlainTextFontCache.h"

#import <CoreText/CoreText.h>

@implementation PlainTextFontCache {
  NSCache<NSString *, id> *_cache;
}

- (instancetype)initWithCountLimit:(NSUInteger)countLimit
{
  if (self = [super init]) {
    _cache = [NSCache new];
    _cache.countLimit = countLimit;

    // __weak would race +removeAllObjects against -dealloc for no benefit:
    // this instance lives in a static local for the process lifetime, so it
    // and this observer are never torn down.
    NSCache<NSString *, id> *cache = _cache;
    [NSNotificationCenter.defaultCenter
        addObserverForName:(NSNotificationName)kCTFontManagerRegisteredFontsChangedNotification
                    object:nil
                     queue:nil
                usingBlock:^(NSNotification *) {
                  [cache removeAllObjects];
                }];
  }
  return self;
}

- (nullable id)objectForKey:(NSString *)key orSet:(id _Nullable (^)(void))compute
{
  id cached = [_cache objectForKey:key];
  if (cached != nil) {
    return cached == NSNull.null ? nil : cached;
  }

  id value = compute();
  [_cache setObject:(value ?: NSNull.null) forKey:key];
  return value;
}

@end
