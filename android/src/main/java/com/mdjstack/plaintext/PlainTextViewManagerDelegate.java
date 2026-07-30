package com.mdjstack.plaintext;

import androidx.annotation.Nullable;
import com.facebook.react.bridge.ColorPropConverter;
import com.facebook.react.bridge.DynamicFromObject;
import com.facebook.react.uimanager.BackgroundStyleApplicator;
import com.facebook.react.uimanager.LengthPercentage;
import com.facebook.react.uimanager.style.BorderRadiusProp;
import com.facebook.react.uimanager.style.BorderStyle;
import com.facebook.react.uimanager.style.LogicalEdge;
import com.facebook.react.viewmanagers.RNPlainTextManagerDelegate;

/**
 * The generated delegate, plus the border styles.
 *
 * <p>Borders are view styles, not text styles, so nothing about them appears in our codegen spec —
 * they arrive as flattened raw props alongside our own. Getting them <em>drawn</em> is Android-only
 * work:
 *
 * <ul>
 *   <li>The insets are free on both platforms: Yoga folds border width into the shadow view's
 *       contentInsets exactly like padding, so the text is already inset by {@code
 *       PlainTextViewManager.setPadding}. Only the drawing is missing.
 *   <li>iOS draws them for us — {@code RCTViewComponentView} owns the border layer.
 *   <li>Android draws nothing unless the view manager asks it to. {@code BaseViewManager} has no
 *       borderWidth/borderColor/borderStyle setters at all, and its {@code setBorderRadius}
 *       overloads only log "unsupported property". Every view family that supports borders declares
 *       its own setters forwarding to {@code BackgroundStyleApplicator}; this is ours.
 * </ul>
 *
 * <p>It lives in a delegate rather than in {@code @ReactProp} setters on the view manager because a
 * view manager that has a delegate is <em>only</em> driven through it: {@code
 * ViewManager.updateProperties} hands every prop to {@code ViewManagerDelegate.setProperty} and
 * never falls back to reflecting over annotations, so a {@code @ReactProp} for a prop the codegen
 * spec doesn't declare would never be called. RN's own {@code ReactTextViewManager} can use
 * annotations precisely because it has no generated delegate.
 *
 * <p>Java rather than Kotlin, unlike the rest of the library: subclassing the generated Java
 * delegate from Kotlin fails to compile, because the two {@code receiveCommand} overloads {@code
 * ViewManagerDelegate} declares for Java/Kotlin compatibility collapse onto one JVM signature
 * across the Java class in between ("inherited platform declarations clash").
 *
 * <p>{@code BackgroundStyleApplicator} composes rather than replaces: it keeps one
 * CompositeBackgroundDrawable per view, which is also what {@code BaseViewManager}'s backgroundColor
 * setter writes into — so a background and a border coexist.
 */
class PlainTextViewManagerDelegate
    extends RNPlainTextManagerDelegate<PlainTextView, PlainTextViewManager> {
  PlainTextViewManagerDelegate(PlainTextViewManager viewManager) {
    super(viewManager);
  }

  @Override
  public void setProperty(PlainTextView view, String propName, @Nullable Object value) {
    // This runs once per prop, per view, per transaction, and the props that
    // actually flow on a text-heavy screen — text, fontSize, color — are never
    // border props. So gate on the prefix first: startsWith bails on the first
    // character for all of them, where reaching the switch below would hash the
    // whole name (String caches its hash, but these arrive fresh from the props
    // map each transaction, so it is computed every time).
    if (propName.startsWith("border")) {
      switch (propName) {
        // Yoga's seven border widths. There are no block-axis widths to mirror
        // the block-axis colors — RN has none either.
        case "borderWidth":
          applyBorderWidth(view, LogicalEdge.ALL, value);
          return;
        case "borderLeftWidth":
          applyBorderWidth(view, LogicalEdge.LEFT, value);
          return;
        case "borderRightWidth":
          applyBorderWidth(view, LogicalEdge.RIGHT, value);
          return;
        case "borderTopWidth":
          applyBorderWidth(view, LogicalEdge.TOP, value);
          return;
        case "borderBottomWidth":
          applyBorderWidth(view, LogicalEdge.BOTTOM, value);
          return;
        case "borderStartWidth":
          applyBorderWidth(view, LogicalEdge.START, value);
          return;
        case "borderEndWidth":
          applyBorderWidth(view, LogicalEdge.END, value);
          return;

        case "borderColor":
          applyBorderColor(view, LogicalEdge.ALL, value);
          return;
        case "borderLeftColor":
          applyBorderColor(view, LogicalEdge.LEFT, value);
          return;
        case "borderRightColor":
          applyBorderColor(view, LogicalEdge.RIGHT, value);
          return;
        case "borderTopColor":
          applyBorderColor(view, LogicalEdge.TOP, value);
          return;
        case "borderBottomColor":
          applyBorderColor(view, LogicalEdge.BOTTOM, value);
          return;
        case "borderStartColor":
          applyBorderColor(view, LogicalEdge.START, value);
          return;
        case "borderEndColor":
          applyBorderColor(view, LogicalEdge.END, value);
          return;
        case "borderBlockColor":
          applyBorderColor(view, LogicalEdge.BLOCK, value);
          return;
        case "borderBlockStartColor":
          applyBorderColor(view, LogicalEdge.BLOCK_START, value);
          return;
        case "borderBlockEndColor":
          applyBorderColor(view, LogicalEdge.BLOCK_END, value);
          return;

        // All thirteen corners RN supports: the four physical ones, the logical
        // top/bottom-start/end pairs, and the CSS logical-logical set.
        case "borderRadius":
          applyBorderRadius(view, BorderRadiusProp.BORDER_RADIUS, value);
          return;
        case "borderTopLeftRadius":
          applyBorderRadius(view, BorderRadiusProp.BORDER_TOP_LEFT_RADIUS, value);
          return;
        case "borderTopRightRadius":
          applyBorderRadius(view, BorderRadiusProp.BORDER_TOP_RIGHT_RADIUS, value);
          return;
        case "borderBottomRightRadius":
          applyBorderRadius(view, BorderRadiusProp.BORDER_BOTTOM_RIGHT_RADIUS, value);
          return;
        case "borderBottomLeftRadius":
          applyBorderRadius(view, BorderRadiusProp.BORDER_BOTTOM_LEFT_RADIUS, value);
          return;
        case "borderTopStartRadius":
          applyBorderRadius(view, BorderRadiusProp.BORDER_TOP_START_RADIUS, value);
          return;
        case "borderTopEndRadius":
          applyBorderRadius(view, BorderRadiusProp.BORDER_TOP_END_RADIUS, value);
          return;
        case "borderBottomStartRadius":
          applyBorderRadius(view, BorderRadiusProp.BORDER_BOTTOM_START_RADIUS, value);
          return;
        case "borderBottomEndRadius":
          applyBorderRadius(view, BorderRadiusProp.BORDER_BOTTOM_END_RADIUS, value);
          return;
        case "borderStartStartRadius":
          applyBorderRadius(view, BorderRadiusProp.BORDER_START_START_RADIUS, value);
          return;
        case "borderStartEndRadius":
          applyBorderRadius(view, BorderRadiusProp.BORDER_START_END_RADIUS, value);
          return;
        case "borderEndStartRadius":
          applyBorderRadius(view, BorderRadiusProp.BORDER_END_START_RADIUS, value);
          return;
        case "borderEndEndRadius":
          applyBorderRadius(view, BorderRadiusProp.BORDER_END_END_RADIUS, value);
          return;

        case "borderStyle":
          BackgroundStyleApplicator.setBorderStyle(
              view, value == null ? null : BorderStyle.fromString((String) value));
          return;

        default:
          // A border prop we don't handle (borderCurve, say) — let the chain
          // below have it.
          break;
      }
    }

    // Everything our codegen spec declares, plus the base view props.
    super.setProperty(view, propName, value);
  }

  /** Widths arrive in DIP; BackgroundStyleApplicator scales them. null clears. */
  private static void applyBorderWidth(PlainTextView view, LogicalEdge edge, @Nullable Object value) {
    BackgroundStyleApplicator.setBorderWidth(
        view, edge, value == null ? null : ((Double) value).floatValue());
  }

  private static void applyBorderColor(PlainTextView view, LogicalEdge edge, @Nullable Object value) {
    BackgroundStyleApplicator.setBorderColor(
        view, edge, ColorPropConverter.getColor(value, view.getContext()));
  }

  private static void applyBorderRadius(
      PlainTextView view, BorderRadiusProp corner, @Nullable Object value) {
    // A radius may be a percentage string, hence the Dynamic round-trip.
    // setFromDynamic warns for any other type, null included, so a cleared
    // radius short-circuits here.
    LengthPercentage radius =
        value == null ? null : LengthPercentage.setFromDynamic(new DynamicFromObject(value), false);
    BackgroundStyleApplicator.setBorderRadius(view, corner, radius);
  }
}
