# @hongtak/totp

A lightweight, zero-dependency Node.js library for generating and verifying Time-Based One-Time Passwords (TOTP) and HMAC-Based One-Time Passwords (HOTP), compliant with [RFC 6238](https://tools.ietf.org/html/rfc6238) and [RFC 4226](https://tools.ietf.org/html/rfc4226).

## Features

- 🔐 Generate TOTP and HOTP codes
- ✅ Verify TOTP codes with time window support
- 🔑 Generate cryptographically secure secrets
- 🔧 Support for multiple hash algorithms (SHA-1, SHA-256, SHA-512)
- 📦 Zero dependencies (uses native Node.js crypto)
- 🎯 RFC 4648 Base32 encoding/decoding implementation
- ⚡ Lightweight and fast
- 🎨 Flexible options API

## Installation

```bash
npm install @hongtak/totp
```

## Usage

### TOTP (Time-Based One-Time Password)

```js
import { generateSecret, totp } from '@hongtak/totp'

// Generate a secret key
const secret = generateSecret()
// Store the secret securely; do not log it.

// Generate a TOTP code
const code = totp.generate(secret)
console.log('Code:', code)
// Output: Code: 123456

// Verify a TOTP code
const isValid = totp.verify(secret, code)
console.log('Valid:', isValid)
// Output: Valid: true

// Generate with custom options
const code8Digit = totp.generate(secret, {
  digits: 8,
  step: 60,
  algorithm: 'sha256'
})
```

### HOTP (HMAC-Based One-Time Password)

```js
import { generateSecret, hotp } from '@hongtak/totp'

const secret = generateSecret()
const counter = 0

// Generate an HOTP code
const code = hotp.generate(secret, counter)
console.log('Code:', code)
// Output: Code: 123456

// Verify an HOTP code
const isValid = hotp.verify(secret, counter, code)
console.log('Valid:', isValid)
// Output: Valid: true

// Generate with custom options
const code8Digit = hotp.generate(secret, counter, {
  digits: 8,
  algorithm: 'sha512'
})
```

### Base32 Encoding/Decoding

```js
import { base32 } from '@hongtak/totp'

// Encode
const encoded = base32.encode(Buffer.from('Hello World'))
console.log(encoded)
// Output: JBSWY3DPEBLW64TMMQ

// Decode
const decoded = base32.decode('JBSWY3DPEBLW64TMMQ')
console.log(decoded.toString())
// Output: Hello World
```

### Getting an otpauth:// URL

```js
import { otpauthURL, generateSecret } from '@hongtak/totp'

const secret = generateSecret()

// Generate otpauthURL
const url = otpauthURL({
  secret,
  label: 'TestApp:username',
  issuer: 'TestApp'
})
console.log(url)
// Output: otpauth://totp/TestApp%3Ausername?secret=XXXXXX...&issuer=TestApp
```

## API

### `generateSecret(length = 32)`

Generates a cryptographically secure random secret.

**Parameters:**
- `length` (number, optional): Number of random bytes to generate, an integer from 16 to 1024. Default is 32.

**Returns:** Base32-encoded secret string.

**Example:**
```js
const secret = generateSecret()
// Returns: 'JBSWY3DPEHPK3PXP...'
```

---

### TOTP API

#### `totp.generate(secret, opts = {})`

Generates a TOTP code based on the current time.

**Parameters:**
- `secret` (string): Base32-encoded secret key
- `opts` (object, optional): Configuration options
  - `digits` (number): Number of digits: `6`, `7`, or `8`. Default is `6`.
  - `epoch` (number): Nonnegative safe integer Unix timestamp in milliseconds. Default is `Date.now()`.
  - `algorithm` (string): Hash algorithm (`'sha1'`, `'sha256'`, `'sha512'`). Default is `'sha1'`.
  - `step` (number): Positive safe integer time step in seconds. Default is `30`.

**Returns:** String containing the TOTP code.

**Example:**
```js
const code = totp.generate(secret, {
  digits: 8,
  step: 60,
  algorithm: 'sha256'
})
```

#### `totp.verify(secret, token, opts = {})`

Verifies a TOTP code against the secret, allowing for time drift.

**Parameters:**
- `secret` (string): Base32-encoded secret key
- `token` (string): TOTP code to verify
- `opts` (object, optional): Configuration options
  - `digits` (number): Number of digits: `6`, `7`, or `8`. Default is `6`.
  - `epoch` (number): Nonnegative safe integer Unix timestamp in milliseconds. Default is `Date.now()`.
  - `algorithm` (string): Hash algorithm. Default is `'sha1'`.
  - `step` (number): Positive safe integer time step in seconds. Default is `30`.
  - `window` (number): Integer from `0` to `10`: time steps to check before and after the current time. Default is `0`.

**Returns:** Boolean indicating whether the code is valid.

**Example:**
```js
const isValid = totp.verify(secret, '12345678', {
  digits: 8,
  window: 1
})
```

---

### HOTP API

#### `hotp.generate(secret, counter, opts = {})`

Generates an HOTP code based on a counter value.

**Parameters:**
- `secret` (string): Base32-encoded secret key
- `counter` (number | bigint): Nonnegative unsigned 64-bit counter. Numbers must be safe integers; use `bigint` for larger values.
- `opts` (object, optional): Configuration options
  - `digits` (number): Number of digits: `6`, `7`, or `8`. Default is `6`.
  - `algorithm` (string): Hash algorithm (`'sha1'`, `'sha256'`, `'sha512'`). Default is `'sha1'`.

**Returns:** String containing the HOTP code.

**Example:**
```js
const code = hotp.generate(secret, 42, {
  digits: 8,
  algorithm: 'sha512'
})
```

#### `hotp.verify(secret, counter, token, opts = {})`

Verifies an HOTP code against the secret and counter.

**Parameters:**
- `secret` (string): Base32-encoded secret key
- `counter` (number | bigint): Nonnegative unsigned 64-bit counter. Numbers must be safe integers; use `bigint` for larger values.
- `token` (string): HOTP code to verify
- `opts` (object, optional): Configuration options
  - `digits` (number): Number of digits: `6`, `7`, or `8`. Default is `6`.
  - `algorithm` (string): Hash algorithm. Default is `'sha1'`.

**Returns:** Boolean indicating whether the code is valid.

**Example:**
```js
const isValid = hotp.verify(secret, 42, '12345678', {
  digits: 8
})
```

---

### Base32 API

#### `base32.encode(input, padding = false)`

Encodes binary data to Base32 string.

**Parameters:**
- `input` (Buffer): Binary data to encode
- `padding` (boolean, optional): Whether to include padding. Default is `false`.

**Returns:** Base32-encoded string.

**Example:**
```js
const encoded = base32.encode(Buffer.from('Hello'))
// Returns: 'JBSWY3DP'
```

#### `base32.decode(input)`

Decodes a Base32 string to binary data.

**Parameters:**
- `input` (string): Base32-encoded string

**Returns:** Buffer containing decoded binary data.

**Example:**
```js
const decoded = base32.decode('JBSWY3DP')
// Returns: Buffer containing 'Hello'
```

---

### `otpauthURL(opts = {})`

Getting an otpauth:// URL

**Parameters:**
- `opts` (object): Configuration options
  - `type` (string): Valid types are hotp and totp. Default is `totp`.
  - `label` (string): The label is used to identify which account a key is associated with.
  - `secret` (string): Base32-encoded secret key.
  - `issuer` (string, optional): Indicating the provider or service this account is associated with.
  - `algorithm` (string, optional): Hash algorithm: `sha1`, `sha256` or `sha512`.
  - `digits` (number, optional): `6`, `7`, or `8`.
  - `counter` (number | bigint): Required for HOTP; a nonnegative unsigned 64-bit integer. Numbers must be safe integers.
  - `period` (number, optional): Positive safe integer seconds; used only for TOTP.

---

## Validation and compatibility

Invalid secrets and configuration throw errors. Verification returns `false` for malformed or incorrect tokens when the secret and configuration are valid. Tokens must be strings containing exactly the configured number of ASCII digits.

- Algorithms are case-insensitive and limited to SHA1, SHA256, and SHA512.
- Digits must be 6, 7, or 8. Verification windows are limited to 10 steps in each direction (at most 21 candidate codes).
- Epochs are nonnegative safe integer milliseconds; steps and provisioning periods are positive safe integer seconds.
- HOTP counters cover `0n` through `18446744073709551615n`. Use `bigint` above `Number.MAX_SAFE_INTEGER`.
- Base32 decoding accepts lowercase and either correctly padded or unpadded input. It rejects misplaced padding, invalid lengths, and nonzero unused trailing bits. Empty Base32 data may be decoded, but OTP operations reject empty secrets.
- `generateSecret` accepts 16–1024 bytes. Imported secrets must decode to at least one byte; callers should provision strong random secrets, preferably using `generateSecret()`.
- Provisioning URLs normalize secrets to uppercase, unpadded Base32 and reject unsupported algorithms.

These checks intentionally reject values previously accepted silently, including zero digits, infinite time steps, negative counters, malformed secrets, and excessive windows. Applications using those values must update their configuration before upgrading. Existing valid defaults are unchanged. TypeScript declarations are included; TypeScript projects should install `@types/node` for Node.js types.

## Secure integration

The verification functions are stateless. Your application must enforce rate limits and prevent replay:

- For HOTP, atomically advance the stored counter after a successful verification so concurrent requests cannot reuse it.
- For TOTP, atomically record successful use and reject reuse during the acceptance window. With clock-drift windows, track the actual matched time step; the boolean `verify` result alone does not identify it. Applications can match candidate steps with `generate` and their own timing-safe comparison.
- Protect stored secrets and provisioning URLs from unauthorized access. Do not put them in application logs.
- Keep verification windows as small as practical. Larger windows accept more possible codes.

Token comparisons use Node's `timingSafeEqual` after checking token format and length. TOTP verification checks all eligible steps rather than returning at the first match. This does not make surrounding application logic timing-safe automatically.

## Development

Requires Node.js 24 or later.

```bash
npm ci
npm test
npm run lint
```

Tests include RFC HOTP/TOTP vectors, Base32 vectors and binary round trips, time-window boundaries, unsigned counter boundaries, and invalid-input regressions. Publishing runs tests and lint first; tests and development configuration are excluded from the package.

## How It Works

### TOTP (Time-Based OTP)

TOTP generates a time-based one-time password using:
1. A shared secret key (Base32-encoded)
2. Current Unix timestamp divided by a time step (default 30 seconds)
3. HMAC algorithm (SHA-1, SHA-256, or SHA-512) to generate a hash
4. Dynamic truncation to produce a numeric code

The verification function accounts for clock drift by checking codes within a time window.

### HOTP (HMAC-Based OTP)

HOTP generates a counter-based one-time password using:
1. A shared secret key (Base32-encoded)
2. A counter value that increments with each use
3. HMAC algorithm to generate a hash
4. Dynamic truncation to produce a numeric code

### Base32 Encoding

This library includes a custom RFC 4648-compliant Base32 implementation:
- Uses the standard RFC 4648 alphabet: `ABCDEFGHIJKLMNOPQRSTUVWXYZ234567`
- Supports optional padding with `=` characters
- Handles case-insensitive decoding

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

Choi Hong Tak <hongtak@gmail.com>

## Repository

[https://github.com/hongtak/totp](https://github.com/hongtak/totp)
