# react-native-lite-text

A lighter-weight `<Text>` for React Native. `LiteText` renders straight to
the platform's native text widget (`UILabel` on iOS, `TextView` on Android)
instead of going through RN's own text layout pipeline, so it uses less
memory and renders faster. The tradeoff: no nested or mixed-style text, just
a single string with one style (see [Compatibility](#compatibility)). That
covers the large majority of real-world `<Text>` usage (body copy, labels,
list and feed content), making `LiteText` a drop-in-*shaped* swap for
perf-conscious apps and design systems alike. It's an early, evolving
library, and feedback drives what gets built next.

Early measurements with the example app's Performance tab (rough,
self-measured, take as directional):

| Text size | `LiteText` | RN `Text` |
| --- | --- | --- |
| iOS, small | 28 KB | 56 KB |
| iOS, regular | 43 KB | 83 KB |
| iOS, large | 154 KB | 405 KB |
| Android, typical instance | 38 KB | 51 KB |

## Installation


```sh
npm install react-native-lite-text
```


## Usage

```jsx
import { LiteText } from "react-native-lite-text";

// ...

<LiteText style={{ fontSize: 16 }}>Hello from LiteText 👋</LiteText>
```

### Compatibility

`LiteText` is a drop-in-*shaped* replacement for RN's `<Text>`, but it's an early package and only supports a subset of `<Text>`'s props and styles so far. The tables below track what works today versus what's still on the roadmap.

Legend: ✅ supported · 🔜 planned, not yet available

#### Style props (via `style={{ ... }}`)

| Style | Status | Notes |
| --- | :---: | --- |
| `fontSize` | ✅ | |
| `color` | 🔜 | |
| `fontWeight` | ✅ | |
| `fontFamily` | ✅ | |
| `lineHeight` | 🔜 | |
| `fontStyle` | ✅ | `'normal' \| 'italic'` |
| `textAlign` | ✅ | |
| `textDecorationLine` | 🔜 | |
| `letterSpacing` | 🔜 | |
| `textTransform` | 🔜 | |
| `textAlignVertical` | 🔜 | Android only |
| `verticalAlign` | 🔜 | |
| `textDecorationColor` | 🔜 | |
| `textDecorationStyle` | 🔜 | |
| `textShadowColor` / `textShadowOffset` / `textShadowRadius` | 🔜 | |
| `fontVariant` | 🔜 | |
| `writingDirection` | 🔜 | |
| `userSelect` | 🔜 | |
| `includeFontPadding` | 🔜 | Android only |
| All other `ViewStyle` props (`width`, `height`, `margin`, `padding`, `backgroundColor`, `opacity`, etc.) | ✅ | Forwarded to the native view as-is. |

#### Component props

| Prop | Status | Notes |
| --- | :---: | --- |
| `children` | ✅ | Plain `string` only — no nested `<Text>`/styled fragments. |
| `numberOfLines` | 🔜 | |
| `ellipsizeMode` | 🔜 | |
| `onPress` / `onLongPress` | 🔜 | |
| `selectable` | 🔜 | |
| `allowFontScaling` / `maxFontSizeMultiplier` | 🔜 | |
| `adjustsFontSizeToFit` / `minimumFontScale` | 🔜 | |
| `testID` / `accessibilityRole` / other accessibility props | 🔜 | |
| `onTextLayout` | 🔜 | |
| `selectionColor` (Android) / `suppressHighlighting` (iOS) | 🔜 | |
| `dataDetectorType` (Android) | 🔜 | |

> Want a prop or style bumped up the list? Open an issue — real-world usage drives what gets built next.

> **Sizing:** `LiteText` measures and sizes itself to its content automatically (no need to set an explicit `width`/`height`), matching how RN's `<Text>` behaves.


## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
