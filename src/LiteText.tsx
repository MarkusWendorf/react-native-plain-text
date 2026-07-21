import { Text, type TextProps } from 'react-native';

export type LiteTextProps = Omit<TextProps, 'children'> & {
  children?: string;
};

// Web / fallback implementation.
export function LiteText({ children, ...rest }: LiteTextProps) {
  return <Text {...rest}>{children}</Text>;
}
