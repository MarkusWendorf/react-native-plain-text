package com.litetext

import android.graphics.Color
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.LiteTextViewManagerInterface
import com.facebook.react.viewmanagers.LiteTextViewManagerDelegate

@ReactModule(name = LiteTextViewManager.NAME)
class LiteTextViewManager : SimpleViewManager<LiteTextView>(),
  LiteTextViewManagerInterface<LiteTextView> {
  private val mDelegate: ViewManagerDelegate<LiteTextView>

  init {
    mDelegate = LiteTextViewManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<LiteTextView>? {
    return mDelegate
  }

  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): LiteTextView {
    return LiteTextView(context)
  }

  @ReactProp(name = "color")
  override fun setColor(view: LiteTextView?, color: Int?) {
    view?.setBackgroundColor(color ?: Color.TRANSPARENT)
  }

  companion object {
    const val NAME = "LiteTextView"
  }
}
