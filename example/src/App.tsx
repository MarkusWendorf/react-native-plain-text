import { View, StyleSheet } from 'react-native';
import { LiteText } from 'react-native-lite-text';

export default function App() {
  return (
    <View style={styles.container}>
      {/* No explicit width/height: the native text measures its own size. */}
      <LiteText style={styles.text}>Hello from LiteText 👋</LiteText>
      <LiteText style={styles.big}>Bigger text</LiteText>
      {/* Width-constrained: height grows to fit the wrapped lines. */}
      <LiteText style={styles.wrapping}>
        This is a longer piece of text that should wrap onto multiple lines and
        size its height automatically.
      </LiteText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
