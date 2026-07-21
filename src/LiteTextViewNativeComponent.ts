import { codegenNativeComponent, type ViewProps } from 'react-native';

export interface NativeProps extends ViewProps {
  text?: string;
}

export default codegenNativeComponent<NativeProps>('LiteTextView');
