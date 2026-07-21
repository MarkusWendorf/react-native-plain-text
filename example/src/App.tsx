import { View, StyleSheet } from 'react-native';
import { LiteText } from 'react-native-lite-text';

export default function App() {
  return (
    <View style={styles.container}>
      <LiteText style={styles.text}>Hello from LiteText 👋</LiteText>
      <LiteText style={styles.big}>Bigger text</LiteText>
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
    width: 240,
    height: 40,
    fontSize: 16,
    backgroundColor: '#f0f0f0',
  },
  big: {
    width: 240,
    height: 60,
    fontSize: 32,
    backgroundColor: '#f0f0f0',
  },
});
