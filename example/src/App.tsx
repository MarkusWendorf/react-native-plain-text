import { View, StyleSheet } from 'react-native';
import { LiteText } from 'react-native-lite-text';

export default function App() {
  return (
    <View style={styles.container}>
      <LiteText style={styles.text}>Hello from LiteText 👋</LiteText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    width: 240,
    height: 40,
  },
});
