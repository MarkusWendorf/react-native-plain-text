/*
 * The fontVariationSettings parser: a string in, variable-font axes out.
 * Split out from PlainTextFont.mm since it touches nothing Apple.
 *
 * Grammar is Android's (FontVariationAxis.fromFontVariationSettings), so the
 * same prop value means the same thing on both platforms.
 */

#pragma once

#include <cstdint>
#include <optional>
#include <string>
#include <vector>

namespace facebook::react {

/*
 * One `"wght" 700` pair. The tag is the four-character code CoreText keys
 * variations by ('wght' -> 0x77676874).
 */
struct PlainTextFontVariationAxis {
  uint32_t tag;
  double value;
};

/*
 * The axes `settings` sets, in order, or nullopt when malformed.
 *
 * All-or-nothing on a malformed string, matching Android (TextView applies
 * nothing rather than the entries that did parse). An empty string parses to
 * no axes, hence nullopt vs. empty vector: callers must surface nullopt,
 * since applying no axes otherwise looks identical to a font with none.
 *
 * "normal" (CSS's spelling of "sets no axes") is also accepted, trimmed and
 * case-insensitively, as an alias for the empty string, matching RN's
 * Android wrapper.
 */
std::optional<std::vector<PlainTextFontVariationAxis>> parseFontVariations(const std::string &settings);

} // namespace facebook::react
