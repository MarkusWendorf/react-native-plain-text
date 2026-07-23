import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getMemoryFootprint } from 'react-native-memory-footprint';
import { PlainText } from 'react-native-plain-text';

const COUNT = 1000;

const FONT_SIZES = [
  { label: 'Large', value: 56 },
  { label: 'Regular', value: 20 },
  { label: 'Small', value: 14 },
] as const;

// How long to wait after commit before sampling memory. Native allocations
// (CoreText layout, CALayer backing stores, JS heap growth) are deferred past
// the React commit, so sampling immediately undercounts. Android defers more
// (GC timing, TextView layout) so it needs a longer settle window than iOS.
const SETTLE_MS = Platform.select({ android: 2000, default: 500 });

type Kind = 'plain' | 'text';

type Stats = {
  memBefore: number;
  memAfter: number;
  totalBytes: number;
  perViewBytes: number;
  timeMs: number;
};

export default function PerformanceScreen() {
  const insets = useSafeAreaInsets();
  const [plainCount, setPlainCount] = useState(0);
  const [textCount, setTextCount] = useState(0);
  const [plainStats, setPlainStats] = useState<Stats | null>(null);
  const [textStats, setTextStats] = useState<Stats | null>(null);
  const [fontSize, setFontSize] = useState<number>(56);

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
    if (kind === 'plain') {
      setPlainCount(COUNT);
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
      if (m.kind === 'plain') {
        setPlainStats(stats);
      } else {
        setTextStats(stats);
      }
    }, SETTLE_MS);

    return () => clearTimeout(timer);
  }, [plainCount, textCount]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 40, paddingBottom: 40 },
      ]}
    >
      <View style={styles.selector}>
        {FONT_SIZES.map(({ label, value }) => {
          const selected = value === fontSize;
          return (
            <Pressable
              key={value}
              onPress={() => setFontSize(value)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <Text
                style={[
                  styles.optionLabel,
                  selected && styles.optionLabelSelected,
                ]}
              >
                {`${label} (${value})`}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Button
        title={`Add ${COUNT} PlainText`}
        onPress={() => startMeasure('plain')}
      />
      <StatsRow label="PlainText" stats={plainStats} />

      <Button
        title={`Add ${COUNT} Text`}
        onPress={() => startMeasure('text')}
      />
      <StatsRow label="Text" stats={textStats} />

      {Array.from({ length: plainCount }, (_, n) => (
        <PlainText key={n} style={[styles.listItem, { fontSize }]}>
          {`List Item ${n + 1}`}
        </PlainText>
      ))}

      {Array.from({ length: textCount }, (_, n) => (
        <Text key={n} style={[styles.listItem, { fontSize }]}>
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
  stats: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
  },
  listItem: {
    backgroundColor: '#f0f0f0',
  },
  selector: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007aff',
  },
  optionSelected: {
    backgroundColor: '#007aff',
  },
  optionLabel: {
    fontSize: 13,
    color: '#007aff',
  },
  optionLabelSelected: {
    color: '#fff',
  },
});
