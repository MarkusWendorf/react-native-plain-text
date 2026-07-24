package com.plaintext

import android.content.Context
import android.graphics.Color
import android.graphics.Typeface
import android.os.Build
import android.text.Layout
import android.text.TextUtils
import android.util.AttributeSet
import android.util.TypedValue
import android.view.Gravity
import androidx.appcompat.widget.AppCompatTextView
import com.facebook.react.common.ReactConstants
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.views.text.ReactTypefaceUtils
import kotlin.math.ceil

// Extends AppCompatTextView (not the plain platform TextView) because that's
// what RN's own <Text> is backed by (ReactTextView extends AppCompatTextView).
// AppCompatTextView's compat font/paint resolution shifts glyph metrics
// slightly from a raw TextView; using a different base class than <Text>
// made PlainText's rendering drift out of alignment with it.
class RNPlainText : AppCompatTextView {
  constructor(context: Context) : super(context)
  constructor(context: Context, attrs: AttributeSet?) : super(context, attrs)
  constructor(context: Context, attrs: AttributeSet?, defStyleAttr: Int) : super(
    context,
    attrs,
    defStyleAttr
  )

  init {
    // Default to black so text color matches iOS's UILabel default. The theme's
    // default TextView color is a gray, which would differ across platforms.
    setTextColor(Color.BLACK)
    // Seed textSize to the codegen fontSize default (14sp). Fabric only calls
    // setFontSize when the prop differs from that default, so a view using the
    // default would otherwise keep the theme's TextView size and mismatch the
    // 14sp the shadow node measures with — truncating the text.
    setFontSizeSp(14f)
    // RN's <Text> explicitly sets these (TextAttributeProps' DEFAULT_BREAK_STRATEGY /
    // DEFAULT_HYPHENATION_FREQUENCY) rather than relying on the platform/theme default,
    // which can differ (e.g. some widget styles default breakStrategy to "simple").
    // Match them so identical text wraps onto the same lines as <Text>.
    breakStrategy = Layout.BREAK_STRATEGY_HIGH_QUALITY
    hyphenationFrequency = Layout.HYPHENATION_FREQUENCY_NONE
  }

  // RN's <Text> (TextAttributeProps.setFontSize) converts sp to px via
  // ceil(PixelUtil.toPixelFromSP(sp)) and applies that as an integer px text
  // size, rather than letting the widget do its own sp->px conversion via
  // setTextSize(SP, ...). The two conversions can land on different float px
  // values (ours unrounded, RN's ceiled to a whole pixel), which shifts the
  // paint's font metrics and compounds into a growing per-line height/width
  // drift over a multiline block. Match RN's conversion exactly.
  // Mirrors RN's <Text> (TextAttributeProps#getEffectiveColor): a null value
  // resets to the black default rather than falling through to the theme's
  // gray, keeping the two platforms' unset-color rendering identical.
  fun setColor(color: Int?) {
    setTextColor(color ?: Color.BLACK)
  }

  fun setFontSizeSp(sp: Float) {
    setTextSize(TypedValue.COMPLEX_UNIT_PX, ceil(PixelUtil.toPixelFromSP(sp)))
  }

  private var fontFamily: String? = null
  private var fontWeight: Int = ReactConstants.UNSET
  private var fontStyle: Int = ReactConstants.UNSET

  // Mirrors RN's <Text> (TextAttributeProps#fontFamily): resolves against
  // ReactFontManager so custom fonts bundled the RN way (assets/fonts, or
  // registered natively) work here too, falling back to the platform default
  // when unset.
  fun setFontFamily(fontFamily: String?) {
    this.fontFamily = fontFamily
    updateTypeface()
  }

  // Mirrors RN's <Text> (TextAttributeProps#fontWeight): parses the numeric
  // ("100".."900") / "normal" / "bold" values into a raw weight so it composes
  // correctly with a custom fontFamily via ReactFontManager.TypefaceStyle.
  fun setFontWeight(fontWeight: String?) {
    this.fontWeight = ReactTypefaceUtils.parseFontWeight(fontWeight)
    updateTypeface()
  }

  fun setFontStyle(fontStyle: String?) {
    this.fontStyle = ReactTypefaceUtils.parseFontStyle(fontStyle)
    updateTypeface()
  }

  private fun updateTypeface() {
    typeface = ReactTypefaceUtils.applyStyles(
      typeface,
      if (fontStyle == Typeface.ITALIC) Typeface.ITALIC else Typeface.NORMAL,
      fontWeight,
      fontFamily,
      context.assets
    )
  }

  // Mirrors RN's <Text> (TextAttributeProps#getTextAlign): textAlign maps onto
  // Gravity rather than View.TEXT_ALIGNMENT_*, and "start"/"left"/"right"/"end"
  // are resolved against the view's layout direction so they match <Text> in
  // RTL locales too. "justify" alone is just left-aligned Gravity — actual
  // justification is a separate Layout.justificationMode (API 26+, see below).
  fun setTextAlign(textAlign: String?) {
    val isRTL = layoutDirection == LAYOUT_DIRECTION_RTL
    gravity = when (textAlign) {
      "justify" -> Gravity.LEFT
      "auto", null -> Gravity.NO_GRAVITY
      "left" -> if (isRTL) Gravity.RIGHT else Gravity.LEFT
      "right" -> if (isRTL) Gravity.LEFT else Gravity.RIGHT
      "center" -> Gravity.CENTER_HORIZONTAL
      else -> Gravity.NO_GRAVITY
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      justificationMode =
        if (textAlign == "justify") Layout.JUSTIFICATION_MODE_INTER_WORD
        else Layout.JUSTIFICATION_MODE_NONE
    }
  }

  // Mirrors RN's <Text> (ReactTextView#setNumberOfLines): 0 means unlimited,
  // so map it onto TextView's Integer.MAX_VALUE maxLines. This also bounds the
  // off-screen measure pass in the ViewManager, matching the intrinsic height.
  fun setNumberOfLines(numberOfLines: Int) {
    maxLines = if (numberOfLines <= 0) Integer.MAX_VALUE else numberOfLines
  }

  // Mirrors RN's <Text> (ReactTextView#setEllipsizeMode): "clip" removes the
  // ellipsis (text is hard-cut at maxLines); the rest map onto TruncateAt.
  fun setEllipsizeMode(ellipsizeMode: String?) {
    ellipsize = when (ellipsizeMode) {
      "head" -> TextUtils.TruncateAt.START
      "middle" -> TextUtils.TruncateAt.MIDDLE
      "clip" -> null
      // "tail", null and any unknown value fall back to the RN default.
      else -> TextUtils.TruncateAt.END
    }
  }

  // React Native's Fabric layout system assigns this view's frame directly and
  // never triggers Android's normal measure/layout pass. TextView builds the
  // text Layout it draws during onMeasure, so without this the text is never
  // rendered. Re-run measure + layout ourselves whenever a layout is requested.
  private val measureAndLayout = Runnable {
    measure(
      MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
      MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
    )
    layout(left, top, right, bottom)
  }

  override fun requestLayout() {
    super.requestLayout()
    post(measureAndLayout)
  }
}
