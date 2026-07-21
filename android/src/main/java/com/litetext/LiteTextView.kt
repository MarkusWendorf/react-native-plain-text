package com.litetext

import android.content.Context
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
