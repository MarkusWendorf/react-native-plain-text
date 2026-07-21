# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

## What this is

A React Native library exposing a `LiteText` component: a lightweight static-text view backed directly by the platform's native text widget — `UILabel` on iOS, `TextView` on Android — rather than by RN's own `<Text>`. It is a **Fabric (New Architecture) native component**, scaffolded with `create-react-native-library` (`fabric-view`, `kotlin-objc`).

It is a Yarn (v4, workspaces) monorepo: the library lives in the root, and `example/` is an Expo dev-client app used to run and test changes. Do not use `npm`.

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
3. **iOS** — `ios/LiteTextView.mm` (+ `.h`). A `RCTViewComponentView` subclass hosting a `UILabel`; props are applied in `updateProps:` by diffing `oldViewProps`/`newViewProps`.
4. **Android** — `android/src/main/java/com/litetext/`: `LiteTextView.kt` (the `TextView` subclass), `LiteTextViewManager.kt` (`@ReactProp` setters implementing the codegen `...ManagerInterface`), `LiteTextPackage.kt` (registration).

Note the naming split: the **public JS API is `LiteText`**, but the **native component / codegen spec is `LiteTextView`** (config in `package.json` → `codegenConfig`, name `LiteTextViewSpec`).

### Prop conventions established here

- **Text-style props (e.g. `fontSize`) are NOT part of RN `ViewProps`**, so they don't flow through the native view's `style` automatically. The pattern (see `LiteText.native.tsx`): accept a `TextStyle` `style`, `StyleSheet.flatten` it, destructure the text-style keys out, pass them as **explicit codegen props**, and forward the remaining layout styles as `style`.
- Codegen types come from the **`CodegenTypes` namespace exported by `react-native`** (e.g. `CodegenTypes.WithDefault<CodegenTypes.Float, 14>`). Do **not** import from `react-native/Libraries/Types/CodegenTypes` — this project uses the strict API (`customConditions` in `tsconfig.json`), which blocks `react-native/Libraries/*` subpaths.

## Native gotchas (learned the hard way)

- **Native code changes require a full rebuild** (`yarn example ios|android`). Metro reload / Fast Refresh only picks up JS. A stale native build is the first thing to suspect when a native change "does nothing".
- **Android `TextView` needs a manual measure pass.** RN's Fabric layout assigns the view's frame directly and never calls Android's `onMeasure`, where `TextView` builds the text `Layout` it draws — so text won't render. `LiteTextView.kt` works around this by re-running `measure`+`layout` inside an overridden `requestLayout()`. Keep this.
- **Do not run `./gradlew clean`** in `example/android`. It re-runs CMake configure against the library's generated codegen dir before regenerating it, and fails. To force a clean native build instead delete the build caches by hand — `example/android/app/.cxx`, `example/android/app/build`, and `android/build` — then run `yarn example android` (the build regenerates codegen).
- **No intrinsic sizing yet.** The view has no measure function, so text is clipped to the explicit `width`/`height` you give it via `style`. A large `fontSize` in a small box will be cut off.
- Text color is hardcoded to black on both platforms (Android's theme default is gray) so the two platforms match; it is not yet theme-aware or exposed as a prop.

## Example app

`example/` targets Expo (see `example/AGENTS.md` — check the versioned Expo docs before touching Expo config). It consumes the library via the local source through `example/react-native.config.js`, which points the dependency at the repo root.
