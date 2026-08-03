import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Pressable, StyleSheet } from 'react-native';
import type { ParamListBase } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PlainText } from 'react-native-plain-text';
import { COLOR } from '../theme';

// "Compare Text" overlays RN's own <Text> in brass on top of every specimen. Both
// the Features and the Use Cases screen offer the toggle, and it is one setting:
// turning it on in one tab and switching to the other should not put you in front
// of a screen that has quietly forgotten what you asked for. So the flag lives
// above the tab navigator rather than in either screen.
const CompareTextContext = createContext<{ showText: boolean; toggle: () => void } | undefined>(
  undefined
);

export function CompareTextProvider({ children }: { children: ReactNode }) {
  const [showText, setShowText] = useState(false);
  const toggle = useCallback(() => setShowText((v) => !v), []);
  const value = useMemo(() => ({ showText, toggle }), [showText, toggle]);

  return <CompareTextContext.Provider value={value}>{children}</CompareTextContext.Provider>;
}

// Installs the toggle into the screen's native stack header and returns the
// current state, so a screen only has to thread `showText` down to its rows.
export function useCompareText(navigation: NativeStackNavigationProp<ParamListBase>) {
  const context = useContext(CompareTextContext);
  if (context == null) {
    throw new Error('useCompareText must be used inside a CompareTextProvider');
  }
  const { showText, toggle } = context;

  useLayoutEffect(() => {
    const button = (
      <Pressable onPress={toggle} hitSlop={8} style={styles.headerButton}>
        {/* Off state says what tapping gets you (a comparison against RN's own
            <Text>); on state says how to get out of it. */}
        <PlainText style={styles.headerButtonLabel}>
          {showText ? 'Hide <Text>' : 'Vs <Text>'}
        </PlainText>
      </Pressable>
    );

    navigation.setOptions({
      // `headerRight` is what Android draws. On iOS the same element goes through
      // `unstable_headerRightItems` instead, for `hidesSharedBackground`: from
      // iOS 26 a bar button item sits on the bar's shared glass background, and
      // the rounded, shadowed capsule it puts behind this label belongs to no
      // other surface in the app.
      headerRight: () => button,
      unstable_headerRightItems: () => [
        { type: 'custom', element: button, hidesSharedBackground: true },
      ],
    });
  }, [navigation, showText, toggle]);

  return showText;
}

const styles = StyleSheet.create({
  headerButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  // Indigo keeps it reading as the one tappable thing in the bar; semibold and a
  // few points down from the title is what keeps it subordinate to it, rather
  // than a smaller size alone.
  headerButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLOR.indigo,
  },
});
