import { Platform, StyleSheet } from 'react-native';
import { Section, TextItem } from '../components/Specimen';

// German sentence with a long compound word, for dictionary hyphenation ("auto").
const HYPHENATION_LANG_SPECIMEN =
  'Die Reisekrankenversicherung war früher nur etwas für Geschäftsreisende, heute nutzen sie auch ganz normale Familien.';

// Same sentence with a soft hyphen (U+00AD) at every syllable break, for the
// "none"/"manual" rows.
const HYPHENATION_SOFT_HYPHEN_SPECIMEN =
  'Die Rei­se­kran­ken­ver­si­che­rung war früh­er nur et­was für Ge­schäfts­rei­sen­de, heu­te nut­zen sie auch ganz nor­ma­le Fa­mi­li­en.';

const HYPHENATION_FOOTER = Platform.select({
  ios: '`hyphens`, PlainText-only. RN <Text> has no iOS hyphenation control.',
  default:
    '`hyphens` resolves against android_hyphenationFrequency natively (see PlainTextView.kt). Known gap: Android has no "soft hyphens only" mode, so "manual" (mapped to NORMAL frequency) also enables automatic dictionary hyphenation for words with no inserted soft hyphen.',
});

export function HyphenationSection({ showText }: { showText: boolean }) {
  return (
    <Section title="Hyphenation" footer={HYPHENATION_FOOTER}>
      {/* Specimen carries soft hyphens (U+00AD) at each syllable break.
          "manual" breaks at one; "none" strips them. */}
      <TextItem
        label='hyphens="none": soft hyphens stripped, word stays whole'
        showText={showText}
        style={[styles.hyphenationRow, { hyphens: 'none' }]}
      >
        {HYPHENATION_SOFT_HYPHEN_SPECIMEN}
      </TextItem>
      {/* No soft hyphens: on iOS "manual" invents no break points, unlike "auto".
          On Android, "manual" maps to NORMAL frequency (known gap, see footer),
          so this row can still show an automatic dictionary break. */}
      <TextItem
        label='hyphens="manual": no soft hyphens — no break on iOS; Android may still hyphenate automatically (known gap)'
        showText={showText}
        style={[styles.hyphenationRow, { hyphens: 'manual' }]}
      >
        {HYPHENATION_LANG_SPECIMEN}
      </TextItem>
      <TextItem
        label='hyphens="manual" (default): breaks at inserted soft hyphens on both platforms'
        showText={showText}
        style={[styles.hyphenationRow, { hyphens: 'manual' }]}
      >
        {HYPHENATION_SOFT_HYPHEN_SPECIMEN}
      </TextItem>
      {/* "auto" needs a dictionary; lang="de" picks it. */}
      <TextItem
        label='hyphens="auto", lang="de": dictionary hyphenation'
        showText={showText}
        lang="de"
        style={[styles.hyphenationRow, { hyphens: 'auto' }]}
      >
        {HYPHENATION_LANG_SPECIMEN}
      </TextItem>
      {/* Android only: iOS ignores android_hyphenationFrequency. */}
      {Platform.OS === 'android' && (
        <TextItem
          label='android_hyphenationFrequency="full", lang="de": RN <Text> compat'
          showText={showText}
          lang="de"
          android_hyphenationFrequency="full"
          style={styles.hyphenationRow}
        >
          {HYPHENATION_LANG_SPECIMEN}
        </TextItem>
      )}
    </Section>
  );
}

const styles = StyleSheet.create({
  // Fixed narrow width: at 100% the word wrapped at the preceding space rather
  // than mid-word, so no row showed a real hyphen.
  hyphenationRow: {
    width: 210,
    fontSize: 20,
  },
});
