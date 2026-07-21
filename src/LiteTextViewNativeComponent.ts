import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  text?: string;
  fontSize?: CodegenTypes.WithDefault<CodegenTypes.Float, 14>;
}

export default codegenNativeComponent<NativeProps>('LiteTextView');
