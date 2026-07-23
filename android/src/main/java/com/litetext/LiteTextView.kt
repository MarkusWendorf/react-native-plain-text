package com.litetext

import android.content.Context
import android.graphics.Color
import android.text.Layout
import android.util.AttributeSet
import android.util.TypedValue
import androidx.appcompat.widget.AppCompatTextView
import com.facebook.react.uimanager.PixelUtil
import kotlin.math.ceil

// Extends AppCompatTextView (not the plain platform TextView) because that's
// what RN's own <Text> is backed by (ReactTextView extends AppCompatTextView).
// AppCompatTextView's compat font/paint resolution shifts glyph metrics
// slightly from a raw TextView; using a different base class than <Text>
// made LiteText's rendering drift out of alignment with it.
class LiteTextView : AppCompatTextView {
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
  fun setFontSizeSp(sp: Float) {
    setTextSize(TypedValue.COMPLEX_UNIT_PX, ceil(PixelUtil.toPixelFromSP(sp)))
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
