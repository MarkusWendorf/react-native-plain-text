import {
  codegenNativeComponent,
  type CodegenTypes,
  type ColorValue,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  text?: string;
  color?: ColorValue;
  fontSize?: CodegenTypes.WithDefault<CodegenTypes.Float, 14>;
  fontFamily?: string;
  // A free string rather than a literal union: codegen enums are C++ enum
  // members named after each value, and members can't start with a digit
  // (as the '100'..'900' weights would), so it's parsed on the native side
  // instead (mirrors how RN's own <Text> types AndroidTextInputNativeComponent's
  // fontWeight as plain `string`).
  fontWeight?: string;
  fontStyle?: CodegenTypes.WithDefault<'normal' | 'italic', 'normal'>;
  textAlign?: CodegenTypes.WithDefault<
    'auto' | 'left' | 'right' | 'center' | 'justify',
    'auto'
  >;
}

export default codegenNativeComponent<NativeProps>('RNPlainText');
