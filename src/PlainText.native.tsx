import { StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import PlainTextViewNativeComponent from './PlainTextViewNativeComponent';

export type PlainTextProps = {
  children?: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  allowFontScaling?: boolean;
  maxFontSizeMultiplier?: number;
};

// RN <Text> supports both the Android-specific `textAlignVertical` and the
// cross-platform `verticalAlign` style. When both are set, `verticalAlign`
// wins (RN applies it as an override), and its 'middle' value maps to the
// native prop's 'center'. Mirror that here so the native side sees one value.
function resolveTextAlignVertical(
  textAlignVertical: TextStyle['textAlignVertical'],
  verticalAlign: TextStyle['verticalAlign']
): 'auto' | 'top' | 'bottom' | 'center' | undefined {
  if (verticalAlign != null) {
    return verticalAlign === 'middle' ? 'center' : verticalAlign;
  }
  return textAlignVertical;
}

export function PlainText({
  children,
  style,
  numberOfLines,
  ellipsizeMode,
  allowFontScaling,
  maxFontSizeMultiplier,
}: PlainTextProps) {
  // color/fontSize/fontFamily/fontWeight/fontStyle/textAlign are text-style
  // props, so they don't flow through the native ViewProps. Pull them out of
  // the flattened style and pass them explicitly.
  const {
    color,
    fontSize,
    fontFamily,
    fontWeight,
    fontStyle,
    textAlign,
    textAlignVertical,
    verticalAlign,
    textDecorationLine,
    lineHeight,
    letterSpacing,
    ...viewStyle
  } = StyleSheet.flatten(style) ?? {};

  return (
    <PlainTextViewNativeComponent
      text={children}
      color={color}
      fontSize={fontSize}
      fontFamily={fontFamily}
      fontWeight={fontWeight != null ? String(fontWeight) : undefined}
      fontStyle={fontStyle}
      textAlign={textAlign}
      textAlignVertical={resolveTextAlignVertical(
        textAlignVertical,
        verticalAlign
      )}
      textDecorationLine={textDecorationLine}
      lineHeight={lineHeight}
      letterSpacing={letterSpacing}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={viewStyle}
    />
  );
}
