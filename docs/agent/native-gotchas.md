# Native gotchas

Learned the hard way. Most of these cost an afternoon the first time.

## Builds

- **Native changes require a full rebuild** (`yarn example ios|android`). Metro
  reload and Fast Refresh only pick up JS. A stale native build is the first
  thing to suspect when a native change "does nothing". (Don't run these
  yourself unless asked — see [workflow.md](workflow.md).)
- **Do not run `./gradlew clean`** in `example/android`. It re-runs CMake
  configure against the library's generated codegen dir before regenerating it,
  and fails. To force a clean native build, delete the caches by hand:
  `example/android/app/.cxx`, `example/android/app/build`, `android/build` —
  then run `yarn example android`, which regenerates codegen.
- **After editing `android/src/main/jni/**` or `react-native.config.js`**,
  autolinking output can go stale — the generated `autolinking.json` /
  `autolinking.cpp` aren't reliably invalidated. Also delete
  `example/android/build/generated/autolinking`.
- **New `ios/*.mm` files are only compiled after `pod install`** re-scans the
  podspec glob.

## Cross-platform

- **Trailing whitespace widens the measured box on Android always, on iOS
  almost always.** iOS drops it in exactly one shape: when it sits at the very
  end of a string that contains at least one line break. Measured with
  `boundingRectWithSize:` at 18pt, three trailing spaces (13.68pt):

  |                                              |             |
  | -------------------------------------------- | ----------- |
  | `"one line   "`                              | counted     |
  | `"one line   \n"`                            | counted     |
  | `"longest   \nX"` (spaces on first line)     | counted     |
  | `"X\nlongest   "` (spaces on last line)      | **dropped** |
  | `"X\nlongest   \nY"` (spaces mid-string)     | counted     |
  | `"X\nlongest   \n"` (trailing newline after) | counted     |

  Note the first and fourth rows: both end in spaces, and they disagree. A
  single-line string never drops them.

  The cause is that the platforms measure different things. Android's width is
  `Layout.getDesiredWidth`, an advance sum per paragraph with no line breaking
  involved, so nothing can be trimmed. iOS's is the used rect of a real layout,
  where the final line fragment of a multi-fragment layout has its trailing
  whitespace trimmed — and a single-line string never enters that path.

  **RN `<Text>` does exactly the same thing** — verified on device with the
  Features screen's _Wrap Detection_ rows and the Compare Text overlay, on both
  platforms. So this is inherited from the platforms' text engines via RN, not
  something this library introduces.

  Deliberately not normalized. The contract is per-platform parity with
  `<Text>`; "fixing" it would mean differing from `<Text>` on one platform to
  agree with the other, which is the worse trade for a drop-in replacement.

## Android

- **`TextView` needs a manual measure pass for prop changes that don't resize
  it.** Fabric's mount transaction calls `measure()` + `layout()` after applying
  props (`SurfaceMountingManager.updateLayout`), which covers mounting — but a
  prop change on an already-laid-out view whose size doesn't change emits no
  `updateLayout`, and nothing else rebuilds the `Layout` that `TextView` draws.
  `PlainTextView.kt` handles that in an overridden `requestLayout()`, scoped to
  views that already have a frame. Keep it, and keep the scoping: unscoped, it
  posted thousands of redundant runnables per screen.
- **A bare `TextView` inherits the theme's text color; RN `<Text>` does not.**
  With `color` unset, RN's Fabric text path adds no `ForegroundColorSpan`
  (`ReactBaseTextShadowNode`, gated on `isColorSet`) and never sets
  `paint.color` (`TextLayoutManager.updateTextPaint`), so the text draws with
  `TextPaint`'s default — black — regardless of theme. `PlainTextView.kt`
  therefore hardcodes `Color.BLACK` both at construction and as the reset value
  in `setColor(null)`. Don't "fix" this to `?android:attr/textColor`: it would
  make `PlainText` turn white in dark mode where a swapped-out `<Text>` stayed
  black. iOS matches for the same reason — RN's `RCTAttributedTextUtils.mm`
  falls back to `[UIColor blackColor]`, not `labelColor`.

## iOS

- **Accepted limitation: wrapped text can break one word earlier than RN
  `<Text>` at the same width.** `UILabel` needs slightly more horizontal space
  per character than RN's TextKit-based `<Text>`, so near a width limit a word
  can land on the next line where RN keeps it. This is inherent to `UILabel` vs
  TextKit, not a sizing bug — the box already gets the correct full width.
  Fixing it would mean rendering through TextKit, defeating the point of the
  library.
- **A bare hyphen (`-`) is a wrap point for `UILabel` but not for RN `<Text>`**,
  so `"text-size"` can split as `"text-"` / `"size"` on iOS. Use a non-breaking
  hyphen (U+2011, `‑`) where that split is unwanted — see the "Non-breaking
  hyphen" row in the Features screen's Font Scaling section.
