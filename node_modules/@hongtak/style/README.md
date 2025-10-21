# Style

To use my style, use the following command in Terminal:

```console
$ npm install --save-dev @hongtak/style
```

or

```console
$ npm i -D @hongtak/style
```

To setup, you'll need to add the following lines: **(requires eslint>=v9.0.0)**

```javascript
import style from '@hongtak/style'

export default defineConfig([
  { files: ['**/*.{js,mjs,cjs}'], plugins: { js }, extends: ['js/recommended'] },
  { files: ['**/*.{js,mjs,cjs}'], languageOptions: { globals: globals.node } },
  style
])

```

Note: It recommends a use of the "engines" field of package.json. The "engines" field is used by n/no-unsupported-features/* rules.

```json
"engines": {
  "node": ">=22.11.0" // Use your node runtime version here
}
```

