package com.litetext

import android.content.Context
import android.graphics.Color
import android.util.AttributeSet
import android.widget.TextView

class LiteTextView : TextView {
  constructor(context: Context?) : super(context)
  constructor(context: Context?, attrs: AttributeSet?) : super(context, attrs)
  constructor(context: Context?, attrs: AttributeSet?, defStyleAttr: Int) : super(
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
    textSize = 14f
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
