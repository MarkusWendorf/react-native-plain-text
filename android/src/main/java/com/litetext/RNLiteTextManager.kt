package com.litetext

import android.content.Context
import android.view.View
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNLiteTextManagerInterface
import com.facebook.react.viewmanagers.RNLiteTextManagerDelegate
import com.facebook.yoga.YogaMeasureMode
import com.facebook.yoga.YogaMeasureOutput

@ReactModule(name = RNLiteTextManager.NAME)
class RNLiteTextManager : SimpleViewManager<RNLiteText>(),
  RNLiteTextManagerInterface<RNLiteText> {
  private val mDelegate: ViewManagerDelegate<RNLiteText>

  init {
    mDelegate = RNLiteTextManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<RNLiteText>? {
    return mDelegate
  }

  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): RNLiteText {
    return RNLiteText(context)
  }

  @ReactProp(name = "text")
  override fun setText(view: RNLiteText?, text: String?) {
    view?.text = text
  }

  // TextView.textSize uses SP units, which matches React Native's default of
  // scaling font sizes with the user's accessibility font settings.
  @ReactProp(name = "fontSize")
  override fun setFontSize(view: RNLiteText?, fontSize: Float) {
    view?.setFontSizeSp(fontSize)
  }

  @ReactProp(name = "fontFamily")
  override fun setFontFamily(view: RNLiteText?, fontFamily: String?) {
    view?.setFontFamily(fontFamily)
  }

  @ReactProp(name = "fontWeight")
  override fun setFontWeight(view: RNLiteText?, fontWeight: String?) {
    view?.setFontWeight(fontWeight)
  }

  @ReactProp(name = "fontStyle")
  override fun setFontStyle(view: RNLiteText?, fontStyle: String?) {
    view?.setFontStyle(fontStyle)
  }

  @ReactProp(name = "textAlign")
  override fun setTextAlign(view: RNLiteText?, textAlign: String?) {
    view?.setTextAlign(textAlign)
  }

  // Called from C++ (LiteTextMeasurementsManager, via FabricUIManager.measure)
  // on the Fabric layout thread to compute the view's intrinsic size. Fabric
  // never runs Android's normal onMeasure for our view, so this is where the
  // text is actually measured. `props` carries the "text"/"fontSize" serialized
  // by the C++ side; we size an off-screen TextView exactly as it will render.
  override fun measure(
    context: Context,
    localData: ReadableMap?,
    props: ReadableMap?,
    state: ReadableMap?,
    width: Float,
    widthMode: YogaMeasureMode,
    height: Float,
    heightMode: YogaMeasureMode,
    attachmentsPositions: FloatArray?
  ): Long {
    val view = RNLiteText(context)
    view.text = props?.getString("text") ?: ""
    // fontSize is in SP, matching the setFontSize prop setter above.
    val fontSize = if (props?.hasKey("fontSize") == true) props.getDouble("fontSize") else 14.0
    view.setFontSizeSp(fontSize.toFloat())
    // props serializes an unset fontFamily as "" (the C++ std::string default),
    // not null — normalize so this matches the setFontFamily prop setter path.
    view.setFontFamily(props?.getString("fontFamily")?.ifEmpty { null })
    view.setFontWeight(props?.getString("fontWeight")?.ifEmpty { null })
    view.setFontStyle(props?.getString("fontStyle")?.ifEmpty { null })

    view.measure(
      toMeasureSpec(width, widthMode),
      toMeasureSpec(height, heightMode)
    )

    return YogaMeasureOutput.make(
      PixelUtil.toDIPFromPixel(view.measuredWidth.toFloat()),
      PixelUtil.toDIPFromPixel(view.measuredHeight.toFloat())
    )
  }

  // The size constraints already arrive in pixels — FabricUIManager's
  // getYogaSize() converts the C++ (point-based) LayoutConstraints to px before
  // this is called — so they map straight onto an Android MeasureSpec without
  // any further dp->px scaling. (The output above is converted back to DIP.)
  private fun toMeasureSpec(size: Float, mode: YogaMeasureMode): Int {
    return when (mode) {
      YogaMeasureMode.EXACTLY -> View.MeasureSpec.makeMeasureSpec(size.toInt(), View.MeasureSpec.EXACTLY)
      YogaMeasureMode.AT_MOST -> View.MeasureSpec.makeMeasureSpec(size.toInt(), View.MeasureSpec.AT_MOST)
      else -> View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED)
    }
  }

  companion object {
    const val NAME = "RNLiteText"
  }
}
