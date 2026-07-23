import { StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import LiteTextViewNativeComponent from './LiteTextViewNativeComponent';

export type LiteTextProps = {
  children?: string;
  style?: StyleProp<TextStyle>;
};

export function LiteText({ children, style }: LiteTextProps) {
  // fontSize/fontFamily/textAlign are text-style props, so they don't flow
  // through the native ViewProps. Pull them out of the flattened style and
  // pass them explicitly.
  const { fontSize, fontFamily, textAlign, ...viewStyle } =
    StyleSheet.flatten(style) ?? {};

  return (
    <LiteTextViewNativeComponent
      text={children}
      fontSize={fontSize}
      fontFamily={fontFamily}
      textAlign={textAlign}
      style={viewStyle}
    />
  );
}
