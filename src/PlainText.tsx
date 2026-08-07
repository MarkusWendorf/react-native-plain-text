import { Text, type StyleProp, type TextProps, type TextStyle } from 'react-native';

// Same widened type as PlainText.native.tsx — see there for why.
export type PlainTextStyle = TextStyle & { fontVariationSettings?: string };

export type PlainTextProps = Omit<TextProps, 'children' | 'style'> & {
  children?: string;
  style?: StyleProp<PlainTextStyle>;
};

// Web / fallback implementation. No translation needed: CSS supports
// `font-variation-settings` natively and react-native-web passes unrecognized
// style keys through to it.
export function PlainText({ children, style, ...rest }: PlainTextProps) {
  return (
    <Text style={style as StyleProp<TextStyle>} {...rest}>
      {children}
    </Text>
  );
}
