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
import { PlainText } from 'react-native-plain-text';

type Props = NativeStackScreenProps<ParamListBase>;

export default function FeaturesScreen({ navigation }: Props) {
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
      <Section title="Color">
        {COLORS.map(({ label, color }) => (
          <TextItem
            key={label}
            showText={showText}
            style={{ fontSize: 18, color }}
          >{`${label} text color`}</TextItem>
        ))}
      </Section>
      <Section title="Background Color">
        <TextItem
          showText={showText}
          style={{ fontSize: 18, color: '#ffffff', backgroundColor: '#333333' }}
        >
          White text on a dark background
        </TextItem>
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
      <Section title="Number of Lines">
        {[1, 2, 3].map((numberOfLines) => (
          <TextItem
            key={numberOfLines}
            showText={showText}
            numberOfLines={numberOfLines}
            style={styles.multiline}
            containerStyle={styles.wideRow}
          >
            {`Clamped to ${numberOfLines} line${numberOfLines === 1 ? '' : 's'}: ` +
              'this is a longer piece of text that should truncate with an ' +
              'ellipsis once it exceeds the allotted number of lines.'}
          </TextItem>
        ))}
      </Section>
      <Section title="Ellipsize Mode">
        {ELLIPSIZE_MODES.map((ellipsizeMode) => (
          <TextItem
            key={ellipsizeMode}
            showText={showText}
            numberOfLines={1}
            ellipsizeMode={ellipsizeMode}
            style={styles.multiline}
            containerStyle={styles.wideRow}
          >
            {`ellipsizeMode "${ellipsizeMode}": this single line of text is too long to fit and gets truncated.`}
          </TextItem>
        ))}
      </Section>
      <Section title="Line Height">
        {LINE_HEIGHTS.map((lineHeight) => (
          <TextItem
            key={lineHeight}
            showText={showText}
            style={{ fontSize: 18, lineHeight }}
            containerStyle={styles.wideRow}
          >
            {`lineHeight ${lineHeight}: this is a longer piece of text that wraps ` +
              'onto multiple lines so the spacing between lines is visible.'}
          </TextItem>
        ))}
      </Section>
      <Section title="Letter Spacing">
        {LETTER_SPACINGS.map((letterSpacing) => (
          <TextItem
            key={letterSpacing}
            showText={showText}
            style={{ fontSize: 18, letterSpacing }}
          >{`letterSpacing ${letterSpacing}`}</TextItem>
        ))}
      </Section>
      {/* Font scaling follows the OS accessibility text-size setting (Dynamic
          Type on iOS, Font size on Android). Change it in Settings to see the
          first row grow while the clamped/disabled rows hold their size. */}
      <Section title="Font Scaling">
        <TextItem showText={showText} style={{ fontSize: 18 }}>
          Default: scales with the OS text-size setting.
        </TextItem>
        {/* iOS known discrepancy: UILabel's line breaker treats a plain "-"
            as a wrap point, while RN <Text> (TextKit's NSLayoutManager)
            doesn't — see the "Font scaling / line-wrapping" note in
            AGENTS.md. Swapping in a non-breaking hyphen (U+2011) works
            around it on both platforms. */}
        <TextItem showText={showText} style={{ fontSize: 18 }}>
          {'Workaround: scales the OS text‑size setting.'}
        </TextItem>
        <TextItem
          showText={showText}
          style={{ fontSize: 18 }}
          allowFontScaling={false}
        >
          allowFontScaling false: never scales.
        </TextItem>
        <TextItem
          showText={showText}
          style={{ fontSize: 18 }}
          maxFontSizeMultiplier={1.5}
        >
          maxFontSizeMultiplier 1.5: scales up to 1.5x.
        </TextItem>
      </Section>
      <Section title="Text Decoration Line">
        {TEXT_DECORATION_LINES.map((textDecorationLine) => (
          <TextItem
            key={textDecorationLine}
            showText={showText}
            style={{ fontSize: 18, textDecorationLine }}
          >{`textDecorationLine "${textDecorationLine}"`}</TextItem>
        ))}
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
      {/* Vertical alignment is Android-only (matches RN <Text>); on iOS it's a
          no-op. Each box is taller than its text so the position is visible. */}
      <Section title="Vertical Align (Android)">
        {VERTICAL_ALIGNS.map((verticalAlign) => (
          <TextItem
            key={verticalAlign}
            showText={showText}
            style={{ width: '100%', height: 72, fontSize: 18, verticalAlign }}
            containerStyle={styles.wideRow}
          >{`verticalAlign "${verticalAlign}"`}</TextItem>
        ))}
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <PlainText style={styles.sectionHeader}>{title}</PlainText>
      {children}
    </View>
  );
}

function TextItem({
  style,
  containerStyle,
  showText,
  numberOfLines,
  ellipsizeMode,
  allowFontScaling,
  maxFontSizeMultiplier,
  children,
}: {
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  showText: boolean;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  allowFontScaling?: boolean;
  maxFontSizeMultiplier?: number;
  children: string;
}) {
  return (
    <View style={[styles.row, containerStyle]}>
      {/* No explicit height: the native text measures its own size. */}
      <PlainText
        style={style}
        numberOfLines={numberOfLines}
        ellipsizeMode={ellipsizeMode}
        allowFontScaling={allowFontScaling}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
      >
        {children}
      </PlainText>
      {showText && (
        <Text
          style={[style, styles.overlay]}
          numberOfLines={numberOfLines}
          ellipsizeMode={ellipsizeMode}
          allowFontScaling={allowFontScaling}
          maxFontSizeMultiplier={maxFontSizeMultiplier}
        >
          {children}
        </Text>
      )}
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
    // Sized to the PlainText; the overlay Text is absolutely positioned to
    // fill this same box, so the two share a top-left origin.
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: '#d0d0d0',
  },
  // Used for demos whose PlainText itself has an explicit width: the row
  // should stretch to match instead of shrink-wrapping.
  wideRow: {
    alignSelf: 'stretch',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    opacity: 0.5,
    pointerEvents: 'none',
    // Transparent so the PlainText underneath stays visible for comparison.
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

const ELLIPSIZE_MODES = ['head', 'middle', 'tail', 'clip'] as const;

const LINE_HEIGHTS = [18, 26, 36];

const VERTICAL_ALIGNS = ['top', 'middle', 'bottom'] as const;

const LETTER_SPACINGS = [-2, 0, 2, 6];

const TEXT_DECORATION_LINES = [
  'none',
  'underline',
  'line-through',
  'underline line-through',
] as const;

const COLORS = [
  { label: 'Red', color: '#e5484d' },
  { label: 'Green', color: '#30a46c' },
  { label: 'Blue', color: '#3e63dd' },
];

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
