# @hongtak/totp

A lightweight, zero-dependency Node.js library for generating and verifying Time-Based One-Time Passwords (TOTP) using HMAC-SHA1 algorithm, compliant with [RFC 6238](https://tools.ietf.org/html/rfc6238).

## Features

- 🔐 Generate TOTP codes
- ✅ Verify TOTP codes with time window support
- 🔑 Generate cryptographically secure secrets
- 📦 Zero dependencies (uses native Node.js crypto)
- 🎯 RFC 4648 Base32 encoding/decoding implementation
- ⚡ Lightweight and fast

## Installation

```bash
npm install @hongtak/totp
```

## Usage

```js
import totp from '@hongtak/totp'

// Generate a secret key
const secret = totp.generateSecret()
console.log('Secret:', secret)
// Output: Secret: JBSWY3DPEHPK3PXP...

// Generate a TOTP code
const code = totp.totpGenerate(secret)
console.log('Code:', code)
// Output: Code: 123456

// Verify a TOTP code
const isValid = totp.totpVerify(secret, code)
console.log('Valid:', isValid)
// Output: Valid: true
```

## API

### `generateSecret(length = 32)`

Generates a cryptographically secure random secret for TOTP.

**Parameters:**
- `length` (number, optional): Length of the random bytes to generate. Default is 32.

**Returns:** Base32-encoded secret string.

**Example:**
```js
const secret = totp.generateSecret()
// Returns: 'JBSWY3DPEHPK3PXP...'
```

### `totpGenerate(secret, timeStep = 30, digits = 6)`

Generates a TOTP code based on the current time.

**Parameters:**
- `secret` (string): Base32-encoded secret key
- `timeStep` (number, optional): Time step in seconds. Default is 30.
- `digits` (number, optional): Number of digits in the generated code. Default is 6.

**Returns:** String containing the TOTP code, zero-padded to the specified number of digits.

**Example:**
```js
const code = totp.totpGenerate(secret, 30, 6)
// Returns: '123456'
```

### `totpVerify(secret, code, timeStep = 30, window = 1)`

Verifies a TOTP code against the secret, allowing for time drift.

**Parameters:**
- `secret` (string): Base32-encoded secret key
- `code` (string): TOTP code to verify
- `timeStep` (number, optional): Time step in seconds. Default is 30.
- `window` (number, optional): Number of time steps to check before and after current time. Default is 1.

**Returns:** Boolean indicating whether the code is valid.

**Example:**
```js
const isValid = totp.totpVerify(secret, '123456', 30, 1)
// Returns: true or false
```

## How It Works

TOTP generates a time-based one-time password using:
1. A shared secret key (Base32-encoded)
2. Current Unix timestamp divided by a time step (default 30 seconds)
3. HMAC-SHA1 algorithm to generate a hash
4. Dynamic truncation to produce a numeric code

The verification function accounts for clock drift by checking codes within a time window (default ±1 time step).

## Base32 Encoding

This library includes a custom RFC 4648-compliant Base32 implementation for encoding and decoding secrets. The implementation:
- Uses the standard RFC 4648 alphabet: `ABCDEFGHIJKLMNOPQRSTUVWXYZ234567`
- Supports optional padding with `=` characters
- Handles case-insensitive decoding

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

Choi Hong Tak <hongtak@gmail.com>

## Repository

[https://github.com/hongtak/totp](https://github.com/hongtak/totp)