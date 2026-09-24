import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { base32 } from '../index.js'

describe('Base32', () => {
  it('matches RFC 4648 examples with and without padding', () => {
    const vectors = [
      ['', ''], ['f', 'MY======'], ['fo', 'MZXQ===='], ['foo', 'MZXW6==='],
      ['foob', 'MZXW6YQ='], ['fooba', 'MZXW6YTB'], ['foobar', 'MZXW6YTBOI======'],
    ]
    for (const [plain, encoded] of vectors) {
      const bytes = Buffer.from(plain)
      assert.equal(base32.encode(bytes, true), encoded)
      assert.equal(base32.encode(bytes), encoded.replace(/=+$/, ''))
      assert.deepEqual(base32.decode(encoded), bytes)
      assert.deepEqual(base32.decode(encoded.replace(/=+$/, '').toLowerCase()), bytes)
    }
  })

  it('round-trips binary inputs across byte and block boundaries', () => {
    for (let length = 0; length <= 256; length++) {
      const bytes = Buffer.from(Array.from({ length }, (_, i) => (i * 137 + length) % 256))
      assert.deepEqual(base32.decode(base32.encode(bytes)), bytes)
      assert.deepEqual(base32.decode(base32.encode(bytes, true)), bytes)
    }
  })

  it('rejects invalid lengths, padding, alphabet, and nonzero trailing bits', () => {
    for (const input of ['A', 'AAA', 'AAAAAA', '=', '========', 'MY=', 'MY=======', 'M=Y======', 'MZXW6YTB=', 'MZ', 'MZ======', 'M1', 'MY ', 'MY\n', 'ſA']) {
      assert.throws(() => base32.decode(input), Error)
    }
    assert.throws(() => base32.decode(null), TypeError)
  })
})
