# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

## What this is

A React Native library exposing a `LiteText` component: a lightweight static-text view backed directly by the platform's native text widget — `UILabel` on iOS, `TextView` on Android — rather than by RN's own `<Text>`. It is a **Fabric (New Architecture) native component**, scaffolded with `create-react-native-library` (`fabric-view`, `kotlin-objc`).

It is a Yarn (v4, workspaces) monorepo: the library lives in the root, and `example/` is an Expo dev-client app used to run and test changes. Do not use `npm`.

## React Native sources

The full React Native source tree is checked out as a shallow git submodule at `references/react-native` (github.com/facebook/react-native). Use it to look up native implementation details, codegen internals, `CodegenTypes`, `RCTViewComponentView`, Fabric layout, and RN's own `<Text>`/`UILabel`/`TextView` handling instead of guessing. It is reference-only — never edit it. Run `git submodule update --init --depth 1 references/react-native` to populate it if missing.

## Commands

Run from the repo root:

- `yarn typecheck` — TypeScript (`tsc`)
- `yarn lint` / `yarn lint --fix` — ESLint (+ Prettier)
- `yarn test` — Jest
- `yarn test path/to/file.test.tsx` — single test file; add `-t "name"` for a single case
- `yarn example ios` / `yarn example android` — build & run the example app (`expo run:*`)
- `yarn example start` — Metro only (JS reload; does **not** rebuild native)
- `yarn prepare` — build the shippable library with `react-native-builder-bob` (outputs to `lib/`)

Always run `yarn typecheck` and `yarn lint` after changes.

## Architecture: the four-layer prop flow

Every native prop passes through four files that must stay in sync. Adding or changing a prop means editing all four:

1. **Codegen spec** — `src/LiteTextViewNativeComponent.ts`. The `NativeProps` interface here is the source of truth; codegen turns it into the C++/Kotlin interfaces the native code implements. `codegenNativeComponent('LiteTextView')` is the native component name.
2. **JS wrapper** — `src/LiteText.native.tsx` (native) and `src/LiteText.tsx` (web/fallback, uses `<Text>`). Metro picks `.native.tsx` on device. `src/index.tsx` re-exports from `./LiteText`.
3. **iOS** — `ios/LiteTextView.mm` (+ `.h`). A `RCTViewComponentView` subclass hosting a `UILabel`; props are applied in `updateProps:` by diffing `oldViewProps`/`newViewProps`. (Intrinsic sizing adds two more iOS files — see the measurement section below.)
4. **Android** — `android/src/main/java/com/litetext/`: `LiteTextView.kt` (the `TextView` subclass), `LiteTextViewManager.kt` (`@ReactProp` setters implementing the codegen `...ManagerInterface`), `LiteTextPackage.kt` (registration).

Note the naming split: the **public JS API is `LiteText`**, but the **native component / codegen spec is `LiteTextView`** (config in `package.json` → `codegenConfig`, name `LiteTextViewSpec`).

### Prop conventions established here

- **Text-style props (e.g. `fontSize`) are NOT part of RN `ViewProps`**, so they don't flow through the native view's `style` automatically. The pattern (see `LiteText.native.tsx`): accept a `TextStyle` `style`, `StyleSheet.flatten` it, destructure the text-style keys out, pass them as **explicit codegen props**, and forward the remaining layout styles as `style`.
- Codegen types come from the **`CodegenTypes` namespace exported by `react-native`** (e.g. `CodegenTypes.WithDefault<CodegenTypes.Float, 14>`). Do **not** import from `react-native/Libraries/Types/CodegenTypes` — this project uses the strict API (`customConditions` in `tsconfig.json`), which blocks `react-native/Libraries/*` subpaths.

## Native gotchas (learned the hard way)

- **Native code changes require a full rebuild** (`yarn example ios|android`). Metro reload / Fast Refresh only picks up JS. A stale native build is the first thing to suspect when a native change "does nothing".
- **Android `TextView` needs a manual measure pass.** RN's Fabric layout assigns the view's frame directly and never calls Android's `onMeasure`, where `TextView` builds the text `Layout` it draws — so text won't render. `LiteTextView.kt` works around this by re-running `measure`+`layout` inside an overridden `requestLayout()`. Keep this.
- **Do not run `./gradlew clean`** in `example/android`. It re-runs CMake configure against the library's generated codegen dir before regenerating it, and fails. To force a clean native build instead delete the build caches by hand — `example/android/app/.cxx`, `example/android/app/build`, and `android/build` — then run `yarn example android` (the build regenerates codegen).
- Text color is hardcoded to black on both platforms (Android's theme default is gray) so the two platforms match; it is not yet theme-aware or exposed as a prop.

## Intrinsic sizing (autosizing from the native text)

In Fabric, layout runs in C++ on the shadow thread — the mounted view can never push its size back into Yoga. Intrinsic sizing is therefore done on a **custom `ShadowNode` + `ComponentDescriptor`**, not on the view. Codegen only emits non-measuring `ConcreteViewShadowNode`/`ConcreteComponentDescriptor` aliases, so we hand-write our own and override the registration.

**iOS (implemented).** Three pieces in `ios/`:
- `LiteTextShadowNode.h/.mm` — subclasses `ConcreteViewShadowNode` (reusing the generated `LiteTextViewComponentName`, but named differently to avoid clashing with the generated `LiteTextViewShadowNode` alias). It sets `LeafYogaNode + MeasurableYogaNode` in `BaseTraits()` — the `MeasurableYogaNode` trait is what makes Yoga call the measure fn — and overrides `measureContent`, which reads the props (`getConcreteProps()`), measures the string with `-[NSString boundingRectWithSize:...]` (same CoreText engine as the `UILabel`, thread-safe off-main), and returns the size `clamp`ed to Yoga's `LayoutConstraints`.
- `LiteTextComponentDescriptor.h` — `ConcreteComponentDescriptor<LiteTextShadowNode>`. Because the shadow node reuses `LiteTextViewComponentName`, its handle/name match the generated descriptor, so registering it overrides the default.
- `LiteTextView.mm` — `+componentDescriptorProvider` returns `concreteComponentDescriptorProvider<LiteTextComponentDescriptor>()` instead of the generated one, and no longer imports the generated `ComponentDescriptors.h`.
- Gotcha: `measureContent` accesses `LayoutConstraints` members, so `.mm` must `#include <react/renderer/core/LayoutConstraints.h>` (the generated shadow-node headers only forward-declare it). New `ios/*.mm` files are only compiled after a `pod install` re-scans the podspec glob.

**Android (not yet done).** Same mechanism, but Android has **no pure-Kotlin measure path** and this project currently ships **no C++/CMake/JNI**. It requires standing up a JNI target: a C++ `ShadowNode` + `ComponentDescriptor` + a `MeasurementsManager` that calls back over JNI into `FabricUIManager.measure(...)` (the `AndroidSwitch` pattern), serializing `text`/`fontSize` into the `ReadableMap` props arg, plus a Kotlin `ViewManager.measure()` override that measures an off-screen `TextView` (or reuses `TextLayoutManager.measureText`/`StaticLayout`). Until then Android still relies on the `requestLayout()` re-measure hack and explicit `width`/`height`.

## Example app

`example/` targets Expo (see `example/AGENTS.md` — check the versioned Expo docs before touching Expo config). It consumes the library via the local source through `example/react-native.config.js`, which points the dependency at the repo root.
