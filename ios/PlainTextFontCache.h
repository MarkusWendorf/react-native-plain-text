/*
 * A key -> object cache that invalidates itself when fonts are registered or
 * unregistered at runtime, mirroring RCTFont.mm's own family-name cache
 * invalidation. PlainTextFont.mm's three caches each wrap one of these.
 *
 * A miss runs `compute` and stores the result, nil included: nil means
 * "cache as unresolvable" rather than "don't cache", since a raw NSCache
 * can't store nil at all.
 */

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface PlainTextFontCache<KeyType : NSString *, ObjectType : id> : NSObject

/*
 * `countLimit` of 0 means unlimited, same as NSCache's own default.
 */
- (instancetype)initWithCountLimit:(NSUInteger)countLimit;

/*
 * `key`'s cached value, computing and storing it via `compute` on a miss.
 */
- (nullable ObjectType)objectForKey:(KeyType)key orSet:(ObjectType _Nullable (^)(void))compute;

@end

NS_ASSUME_NONNULL_END
