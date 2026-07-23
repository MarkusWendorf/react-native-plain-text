import { Text, type TextProps } from 'react-native';

export type PlainTextProps = Omit<TextProps, 'children'> & {
  children?: string;
};

// Web / fallback implementation.
export function PlainText({ children, ...rest }: PlainTextProps) {
  return <Text {...rest}>{children}</Text>;
}
