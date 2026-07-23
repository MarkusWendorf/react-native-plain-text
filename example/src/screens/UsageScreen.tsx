import { useLayoutEffect, useState, type ReactNode } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
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
      <Section title="Font Size">
        {FONT_SIZES.map((fontSize) => (
          <TextItem
            key={fontSize}
            showText={showText}
            style={{ fontSize }}
          >{`${fontSize}pt font size`}</TextItem>
        ))}
      </Section>
      <Section title="Font Family">
        {FONT_FAMILIES.map(({ label, fontFamily }) => (
          <TextItem
            key={label}
            showText={showText}
            style={{ fontSize: 18, fontFamily }}
          >{`${label} font family`}</TextItem>
        ))}
      </Section>
      <Section title="Font Weight">
        {FONT_WEIGHTS.map((fontWeight) => (
          <TextItem
            key={fontWeight}
            showText={showText}
            style={{ fontSize: 18, fontWeight }}
          >{`${fontWeight} font weight`}</TextItem>
        ))}
      </Section>
      <Section title="Font Style">
        <TextItem showText={showText} style={styles.italic}>
          Italic font style
        </TextItem>
        <TextItem
          showText={showText}
          style={{ fontSize: 18, fontWeight: 'bold', fontStyle: 'italic' }}
        >
          Bold italic font style
        </TextItem>
      </Section>
      <Section title="Multiline">
        <TextItem
          showText={showText}
          style={styles.multiline}
          containerStyle={styles.wideRow}
        >
          This is a longer piece of text that should wrap onto multiple lines
          and size its height automatically.
        </TextItem>
      </Section>
      <Section title="Text Align">
        <TextItem
          showText={showText}
          style={styles.alignLeft}
          containerStyle={styles.wideRow}
        >
          This text is left-aligned within a wider fixed-width box.
        </TextItem>
        <TextItem
          showText={showText}
          style={styles.alignCenter}
          containerStyle={styles.wideRow}
        >
          This text is center-aligned within a wider fixed-width box.
        </TextItem>
        <TextItem
          showText={showText}
          style={styles.alignRight}
          containerStyle={styles.wideRow}
        >
          This text is right-aligned within a wider fixed-width box.
        </TextItem>
        <TextItem
          showText={showText}
          style={styles.alignJustify}
          containerStyle={styles.wideRow}
        >
          This text is justify-aligned within a wider fixed-width box so every
          line but the last stretches to fill it.
        </TextItem>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <LiteText style={styles.sectionHeader}>{title}</LiteText>
      {children}
    </View>
  );
}

function TextItem({
  style,
  containerStyle,
  showText,
  children,
}: {
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  showText: boolean;
  children: string;
}) {
  return (
    <View style={[styles.row, containerStyle]}>
      {/* No explicit height: the native text measures its own size. */}
      <LiteText style={style}>{children}</LiteText>
      {showText && <Text style={[style, styles.overlay]}>{children}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 28,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    fontSize: 22,
  },
  row: {
    // Sized to the LiteText; the overlay Text is absolutely positioned to
    // fill this same box, so the two share a top-left origin.
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: '#d0d0d0',
  },
  // Used for demos whose LiteText itself has an explicit width: the row
  // should stretch to match instead of shrink-wrapping.
  wideRow: {
    alignSelf: 'stretch',
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
  italic: {
    fontSize: 18,
    fontStyle: 'italic',
  },
  multiline: {
    width: '100%',
    fontSize: 18,
  },
  alignLeft: {
    width: '100%',
    fontSize: 18,
    textAlign: 'left',
  },
  alignCenter: {
    width: '100%',
    fontSize: 18,
    textAlign: 'center',
  },
  alignRight: {
    width: '100%',
    fontSize: 18,
    textAlign: 'right',
  },
  alignJustify: {
    width: '100%',
    fontSize: 18,
    textAlign: 'justify',
  },
});

const FONT_SIZES = [48, 40, 32, 26, 20, 16, 13, 10];

const FONT_WEIGHTS = [
  'normal',
  'bold',
  '100',
  '300',
  '500',
  '700',
  '900',
] as const;

// Font family names aren't portable across platforms, so pick the equivalent
// built-in for each — mirrors how RN's own <Text> docs demo fontFamily.
const FONT_FAMILIES = Platform.select({
  ios: [
    { label: 'System', fontFamily: undefined },
    { label: 'Georgia', fontFamily: 'Georgia' },
    { label: 'Menlo', fontFamily: 'Menlo' },
    { label: 'Courier', fontFamily: 'Courier' },
  ],
  default: [
    { label: 'System', fontFamily: undefined },
    { label: 'serif', fontFamily: 'serif' },
    { label: 'monospace', fontFamily: 'monospace' },
    { label: 'sans-serif-condensed', fontFamily: 'sans-serif-condensed' },
  ],
});
