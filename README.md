# react-native-lite-text

Fast and Lightweight static text package for React Native

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

`LiteText` renders static text using the platform's native text widget
(`UILabel` on iOS, `TextView` on Android).

### Props

| Prop       | Type                  | Description                                                             |
| ---------- | --------------------- | ----------------------------------------------------------------------- |
| `children` | `string`              | The text to display.                                                    |
| `style`    | `StyleProp<TextStyle>`| `fontSize` sets the font size; remaining layout styles apply as usual.  |

> **Note:** This is an early package. Currently only `fontSize` (via `style`) and the text content are supported, and the view does not yet size itself to its content — give it an explicit `width`/`height` via `style`.


## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
