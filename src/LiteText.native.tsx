import type { ViewProps } from 'react-native';
import LiteTextViewNativeComponent from './LiteTextViewNativeComponent';

export type LiteTextProps = Omit<ViewProps, 'children'> & {
  children?: string;
};

export function LiteText({ children, ...rest }: LiteTextProps) {
  return <LiteTextViewNativeComponent text={children} {...rest} />;
}
