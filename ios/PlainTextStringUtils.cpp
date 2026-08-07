#include "PlainTextStringUtils.h"

#include <algorithm>
#include <cctype>

namespace facebook::react {

namespace {
constexpr char kWhitespace[] = " \t\n\r\f\v";
} // namespace

std::string trim(const std::string &value)
{
  size_t start = value.find_first_not_of(kWhitespace);
  if (start == std::string::npos) {
    return "";
  }
  size_t end = value.find_last_not_of(kWhitespace);
  return value.substr(start, end - start + 1);
}

bool caseInsensitiveEquals(const std::string &a, const std::string &b)
{
  // Size check first: the three-iterator std::equal below doesn't stop at
  // the shorter string's end on its own.
  return a.size() == b.size() &&
      std::equal(a.begin(), a.end(), b.begin(), [](unsigned char x, unsigned char y) {
        return std::tolower(x) == std::tolower(y);
      });
}

} // namespace facebook::react
