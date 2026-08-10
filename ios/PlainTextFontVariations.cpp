#include "PlainTextFontVariations.h"

#include "PlainTextStringUtils.h"

#include <cctype>
#include <cmath>
#include <cstdlib>

namespace facebook::react {

namespace {

constexpr char kWhitespace[] = " \t\n\r\f\v";

// One `"wght" 700` pair out of a fontVariationSettings string.
//
// Grammar is Android's (FontVariationAxis.fromFontVariationSettings), no
// laxer, so the prop can't mean different things across platforms.
bool parseEntry(const std::string &entry, PlainTextFontVariationAxis &axis)
{
  size_t start = entry.find_first_not_of(kWhitespace);
  if (start == std::string::npos) {
    return false;
  }

  char quote = entry[start];
  if (quote != '\'' && quote != '"') {
    return false;
  }
  // Requiring the closing quote at start+5 also proves the four tag
  // characters at [start+1, start+4] exist.
  if (start + 5 >= entry.size() || entry[start + 5] != quote) {
    return false;
  }

  uint32_t tag = 0;
  for (size_t offset = 1; offset <= 4; ++offset) {
    unsigned char character = static_cast<unsigned char>(entry[start + offset]);
    if (character < 0x20 || character > 0x7E) {
      return false;
    }
    tag = (tag << 8) | character;
  }

  const char *number = entry.c_str() + start + 6;
  char *numberEnd = nullptr;
  double parsed = std::strtod(number, &numberEnd);
  // Android runs this through Float.parseFloat, close to strtod but not
  // identical. Rejecting non-finite values is a deliberate divergence: no
  // font has an axis at infinity, but Java would accept "Infinity"/"NaN" here.
  if (numberEnd == number || !std::isfinite(parsed)) {
    return false;
  }
  for (const char *rest = numberEnd; *rest != '\0'; ++rest) {
    if (std::isspace(static_cast<unsigned char>(*rest)) == 0) {
      return false;
    }
  }

  axis.tag = tag;
  axis.value = parsed;
  return true;
}

} // namespace

std::optional<std::vector<PlainTextFontVariationAxis>> parseFontVariations(const std::string &settings)
{
  // "normal" is CSS's spelling of "sets no axes", not something
  // fromFontVariationSettings itself recognizes (RN's Android wrapper
  // special-cases it the same way). Compared trimmed, but only the comparison
  // sees the trimmed form: pre-trimming here would turn a whitespace-only
  // string (rejected by the grammar) into "" (accepted as no axes).
  if (caseInsensitiveEquals(trim(settings), "normal")) {
    return std::vector<PlainTextFontVariationAxis>{};
  }

  std::vector<PlainTextFontVariationAxis> axes;
  if (settings.empty()) {
    return axes;
  }

  // Android's parser reads the comma as the value terminator and runs off
  // the string's end, so `"wght" 700,` is one axis there. A trailing comma
  // ends the list here too, to match (only a trailing one, since a leading
  // or interior empty entry throws on Android too).
  size_t lastCharacter = settings.find_last_not_of(kWhitespace);
  bool endsWithComma = lastCharacter != std::string::npos && settings[lastCharacter] == ',';

  size_t position = 0;
  while (true) {
    size_t separator = settings.find(',', position);
    size_t end = separator == std::string::npos ? settings.size() : separator;

    if (separator == std::string::npos && endsWithComma) {
      break;
    }

    PlainTextFontVariationAxis axis{};
    if (!parseEntry(settings.substr(position, end - position), axis)) {
      return std::nullopt;
    }
    axes.push_back(axis);

    if (separator == std::string::npos) {
      break;
    }
    position = separator + 1;
  }
  return axes;
}

} // namespace facebook::react
