#include "PlainTextFontCacheKey.h"

#include <cmath>

namespace facebook::react {

namespace {
constexpr char kFieldSeparator = '|';
} // namespace

std::string faceCacheKey(const std::string &fontFamily, const std::string &fontWeight, const std::string &fontStyle)
{
  std::string key = fontFamily;
  key += kFieldSeparator;
  key += fontWeight;
  key += kFieldSeparator;
  key += fontStyle;
  return key;
}

std::string fontCacheKey(
    const std::string &faceKey,
    double fontSize,
    const std::vector<std::string> &fontVariant,
    const std::string &fontVariationSettings)
{
  std::string key = faceKey;
  key += kFieldSeparator;
  // Hundredths of a point, as an integer (avoids the padded "17.000000"
  // std::to_string gives a double), and sizes closer than that render
  // identically at any screen scale.
  key += std::to_string(std::lround(fontSize * 100));
  for (const std::string &variant : fontVariant) {
    key += kFieldSeparator;
    key += variant;
  }
  key += kFieldSeparator;
  key += fontVariationSettings;
  return key;
}

} // namespace facebook::react
