/*
 * Small string helpers with no home of their own in
 * PlainTextFontVariations.cpp. Touches nothing Apple despite living under ios/.
 */

#pragma once

#include <string>

namespace facebook::react {

/*
 * `value` with any leading and trailing whitespace removed, or "" when it is
 * whitespace-only or empty.
 */
std::string trim(const std::string &value);

bool caseInsensitiveEquals(const std::string &a, const std::string &b);

} // namespace facebook::react
