import { StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import LiteTextViewNativeComponent from './LiteTextViewNativeComponent';

export type LiteTextProps = {
  children?: string;
  style?: StyleProp<TextStyle>;
};

export function LiteText({ children, style }: LiteTextProps) {
  // fontSize is a text-style prop, so it doesn't flow through the native
  // ViewProps. Pull it out of the flattened style and pass it explicitly.
  const { fontSize, ...viewStyle } = StyleSheet.flatten(style) ?? {};

  return (
    <LiteTextViewNativeComponent
      text={children}
      fontSize={fontSize}
      style={viewStyle}
    />
  );
}
