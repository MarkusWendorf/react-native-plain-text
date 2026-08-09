/*
 * Plain C++ font-size math shared by PlainTextFont.mm's resolution and, for
 * the multiplier, by its callers' own lineHeight scaling (PlainTextShadowNode.mm,
 * RNPlainText.mm). Split out so this logic runs under tests/cpp/.
 */

#pragma once

namespace facebook::react {

/*
 * Unrounded, matching Fabric's <Text>. Legacy (non-Fabric) RN rounds instead;
 * see native-gotchas.md.
 */
double scaledFontSize(double fontSize, double fontSizeMultiplier);

/*
 * Effective accessibility font-size multiplier: `baseMultiplier` when
 * allowFontScaling is on, clamped by maxFontSizeMultiplier when that is >= 1,
 * and 1 otherwise. Takes primitives rather than RNPlainTextProps so this
 * builds without the codegen headers that struct needs.
 */
double clampFontSizeMultiplier(bool allowFontScaling, double maxFontSizeMultiplier, double baseMultiplier);

} // namespace facebook::react
