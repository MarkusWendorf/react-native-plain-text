import { useLayoutEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import type { ParamListBase } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LiteText } from 'react-native-lite-text';

type Props = NativeStackScreenProps<ParamListBase>;

export default function UsageScreen({ navigation }: Props) {
  const [showText, setShowText] = useState(false);

  // Install the compare toggle into the native stack header.
  useLayoutEffect(() => {
    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <Pressable
          onPress={() => setShowText((v) => !v)}
          hitSlop={8}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonLabel}>
            {showText ? 'Hide Text' : 'Compare Text'}
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, showText]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {CASES.map(({ key, text, style }) => (
        <View key={key} style={styles.row}>
          {/* No explicit height: the native text measures its own size. */}
          <LiteText style={style}>{text}</LiteText>
          {showText && <Text style={[style, styles.overlay]}>{text}</Text>}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 24,
    gap: 16,
  },
  row: {
    // Sized to the LiteText; the overlay Text is absolutely positioned to
    // fill this same box, so the two share a top-left origin.
    alignItems: 'flex-start',
    backgroundColor: '#d0d0d0',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.5,
    pointerEvents: 'none',
    // Transparent so the LiteText underneath stays visible for comparison.
    backgroundColor: '#ff000020',
    color: 'red',
  },
  headerButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  headerButtonLabel: {
    fontSize: 16,
    color: '#007aff',
  },
  large: {
    fontSize: 40,
  },
  regular: {
    fontSize: 20,
  },
  small: {
    fontSize: 12,
  },
  multiline: {
    width: 240,
    fontSize: 18,
  },
});

// A LiteText paired, on demand, with a regular RN <Text> drawn directly on
// top of it at 50% opacity. Anything that doesn't line up (baseline, line
// height, wrapping, glyph position) shows up immediately as a "ghost".
const CASES: { key: string; text: string; style: StyleProp<TextStyle> }[] = [
  { key: 'large', text: 'Large text', style: styles.large },
  { key: 'regular', text: 'Regular text', style: styles.regular },
  { key: 'small', text: 'Small text', style: styles.small },
  {
    key: 'multiline',
    text: 'This is a longer piece of text that should wrap onto multiple lines and size its height automatically.',
    style: styles.multiline,
  },
];
