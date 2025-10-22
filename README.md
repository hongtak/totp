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
console.log('Secret:', secret)
// Output: Secret: JBSWY3DPEHPK3PXP...

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

## API

### `generateSecret(length = 32)`

Generates a cryptographically secure random secret.

**Parameters:**
- `length` (number, optional): Length of the random bytes to generate. Default is 32.

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
  - `digits` (number): Number of digits in the code. Default is `6`.
  - `epoch` (number): Timestamp in milliseconds. Default is `Date.now()`.
  - `algorithm` (string): Hash algorithm (`'sha1'`, `'sha256'`, `'sha512'`). Default is `'sha1'`.
  - `step` (number): Time step in seconds. Default is `30`.

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
  - `digits` (number): Number of digits in the code. Default is `6`.
  - `epoch` (number): Timestamp in milliseconds. Default is `Date.now()`.
  - `algorithm` (string): Hash algorithm. Default is `'sha1'`.
  - `step` (number): Time step in seconds. Default is `30`.
  - `window` (number): Number of time steps to check before and after current time. Default is `0`.

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
- `counter` (number): Counter value
- `opts` (object, optional): Configuration options
  - `digits` (number): Number of digits in the code. Default is `6`.
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
- `counter` (number): Counter value
- `token` (string): HOTP code to verify
- `opts` (object, optional): Configuration options
  - `digits` (number): Number of digits in the code. Default is `6`.
  - `algorithm` (string): Hash algorithm. Default is `'sha1'`.

**Returns:** Boolean indicating whether the code is valid.

**Example:**
```js
const isValid = hotp.verify(secret, 42, '12345678', {
  digits: 8
})
```

#### `hotp.generateSecret(length = 32)`

Alias for `generateSecret()`. Available on the hotp module for convenience.

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
