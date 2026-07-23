import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  text?: string;
  fontSize?: CodegenTypes.WithDefault<CodegenTypes.Float, 14>;
  textAlign?: CodegenTypes.WithDefault<
    'auto' | 'left' | 'right' | 'center' | 'justify',
    'auto'
  >;
}

export default codegenNativeComponent<NativeProps>('LiteTextView');
