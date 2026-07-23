import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiteText } from 'react-native-lite-text';

export default function UsageScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 40, paddingBottom: 40 },
      ]}
    >
      {/* No explicit width/height: the native text measures its own size. */}
      <LiteText style={styles.text}>Hello from LiteText 👋</LiteText>
      <LiteText style={styles.big}>Bigger text</LiteText>
      {/* Width-constrained: height grows to fit the wrapped lines. */}
      <LiteText style={styles.wrapping}>
        This is a longer piece of text that should wrap onto multiple lines and
        size its height automatically.
      </LiteText>
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
    gap: 10,
  },
  text: {
    fontSize: 16,
    backgroundColor: '#f0f0f0',
  },
  big: {
    fontSize: 32,
    backgroundColor: '#f0f0f0',
  },
  wrapping: {
    width: 240,
    fontSize: 16,
    backgroundColor: '#e0e8ff',
  },
});
