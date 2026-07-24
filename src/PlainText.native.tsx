import { StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import PlainTextViewNativeComponent from './PlainTextViewNativeComponent';

export type PlainTextProps = {
  children?: string;
  style?: StyleProp<TextStyle>;
};

export function PlainText({ children, style }: PlainTextProps) {
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
      style={viewStyle}
    />
  );
}
