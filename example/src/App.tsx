import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { getMemoryFootprint } from 'react-native-memory-footprint';
import { LiteText } from 'react-native-lite-text';

const COUNT = 1000;

// How long to wait after commit before sampling memory. Native allocations
// (CoreText layout, CALayer backing stores, JS heap growth) are deferred past
// the React commit, so sampling immediately undercounts. A few frames is enough.
const SETTLE_MS = 500;

type Kind = 'lite' | 'text';

type Stats = {
  memBefore: number;
  memAfter: number;
  totalBytes: number;
  perViewBytes: number;
  timeMs: number;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <Examples />
    </SafeAreaProvider>
  );
}

function Examples() {
  const insets = useSafeAreaInsets();
  const [liteCount, setLiteCount] = useState(0);
  const [textCount, setTextCount] = useState(0);
  const [liteStats, setLiteStats] = useState<Stats | null>(null);
  const [textStats, setTextStats] = useState<Stats | null>(null);

  // Holds an in-flight measurement between the button press (state update)
  // and the moment the new views have been laid out on screen. Only one
  // measurement runs at a time, so a single ref is enough.
  const pending = useRef<{
    kind: Kind;
    memBefore: number;
    startTime: number;
  } | null>(null);

  const startMeasure = useCallback((kind: Kind) => {
    // Sample memory *before* the render that mounts the views, and mark the
    // start of the render+commit window right as we trigger the state update.
    const memBefore = getMemoryFootprint();
    const startTime = performance.now();
    pending.current = { kind, memBefore, startTime };
    if (kind === 'lite') {
      setLiteCount(COUNT);
    } else {
      setTextCount(COUNT);
    }
  }, []);

  // Runs after React has committed the new views. That commit is our
  // render+commit endpoint (captured immediately), but native memory keeps
  // growing past it, so we wait SETTLE_MS before sampling the "after" memory.
  useEffect(() => {
    const m = pending.current;
    if (!m) return;
    pending.current = null;

    const timeMs = performance.now() - m.startTime;
    const timer = setTimeout(() => {
      const memAfter = getMemoryFootprint();
      const totalBytes = memAfter - m.memBefore;
      const stats: Stats = {
        memBefore: m.memBefore,
        memAfter,
        totalBytes,
        perViewBytes: totalBytes / COUNT,
        timeMs,
      };
      if (m.kind === 'lite') {
        setLiteStats(stats);
      } else {
        setTextStats(stats);
      }
    }, SETTLE_MS);

    return () => clearTimeout(timer);
  }, [liteCount, textCount]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 },
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

      <Button
        title={`Add ${COUNT} LiteText`}
        onPress={() => startMeasure('lite')}
      />
      <StatsRow label="LiteText" stats={liteStats} />

      <Button
        title={`Add ${COUNT} Text`}
        onPress={() => startMeasure('text')}
      />
      <StatsRow label="Text" stats={textStats} />

      {Array.from({ length: liteCount }, (_, n) => (
        <LiteText key={n} style={styles.listItem}>
          {`List Item ${n + 1}`}
        </LiteText>
      ))}

      {Array.from({ length: textCount }, (_, n) => (
        <Text key={n} style={styles.listItem}>
          {`List Item ${n + 1}`}
        </Text>
      ))}
    </ScrollView>
  );
}

function StatsRow({ label, stats }: { label: string; stats: Stats | null }) {
  if (!stats) return null;
  return (
    <Text style={styles.stats}>
      {`${label}: ${formatBytes(stats.perViewBytes)}/view · ` +
        `${formatBytes(stats.totalBytes)} total · ` +
        `${stats.timeMs.toFixed(0)} ms\n` +
        `initial ${formatBytes(stats.memBefore)} → final ${formatBytes(
          stats.memAfter
        )}`}
    </Text>
  );
}

function formatBytes(bytes: number) {
  if (Math.abs(bytes) >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }
  return `${(bytes / 1024).toFixed(1)} KB`;
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
  stats: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
  },
  listItem: {
    fontSize: 50,
    backgroundColor: '#f0f0f0',
  },
});
