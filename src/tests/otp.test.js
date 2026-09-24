import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { base32, generateSecret, hotp, totp, otpauthURL } from '../index.js'

const seed = '12345678901234567890'
const secret = base32.encode(Buffer.from(seed))

describe('standard vectors', () => {
  it('matches all RFC 4226 HOTP vectors', () => {
    const expected = ['755224', '287082', '359152', '969429', '338314', '254676', '287922', '162583', '399871', '520489']
    expected.forEach((code, counter) => {
      assert.equal(hotp.generate(secret, counter), code)
      assert.equal(hotp.verify(secret, counter, code), true)
    })
  })

  it('matches all RFC 6238 vectors for SHA1, SHA256, and SHA512', () => {
    const rows = [
      [59, '94287082', '46119246', '90693936'],
      [1111111109, '07081804', '68084774', '25091201'],
      [1111111111, '14050471', '67062674', '99943326'],
      [1234567890, '89005924', '91819424', '93441116'],
      [2000000000, '69279037', '90698825', '38618901'],
      [20000000000, '65353130', '77737706', '47863826'],
    ]
    const algorithms = ['sha1', 'sha256', 'sha512']
    const lengths = [20, 32, 64]
    for (const [seconds, ...codes] of rows) {
      algorithms.forEach((algorithm, i) => {
        const key = base32.encode(Buffer.from(seed.repeat(4).slice(0, lengths[i])))
        const opts = { epoch: seconds * 1000, digits: 8, algorithm }
        assert.equal(totp.generate(key, opts), codes[i])
        assert.equal(totp.verify(key, codes[i], opts), true)
      })
    }
  })
})

describe('validation and verification', () => {
  it('rejects unsafe digit counts and unsupported algorithms', () => {
    for (const digits of [0, -1, 5, 9, 6.5, NaN, Infinity, '6', null]) {
      assert.throws(() => hotp.verify(secret, 0, '0', { digits }), RangeError)
    }
    for (const algorithm of ['md5', '', null, 1]) {
      assert.throws(() => hotp.generate(secret, 0, { algorithm }), RangeError)
    }
    assert.equal(hotp.generate(secret, 0, { algorithm: 'SHA1' }), '755224')
  })

  it('rejects empty or malformed secrets and options', () => {
    for (const key of ['', 'A', '=', 'M=Y======', 'MZ', null]) {
      assert.throws(() => hotp.generate(key, 0))
      assert.throws(() => totp.verify(key, '123456', { epoch: 0 }))
    }
    for (const opts of [null, [], 'options', 3]) {
      assert.throws(() => hotp.generate(secret, 0, opts), TypeError)
      assert.throws(() => totp.generate(secret, opts), TypeError)
      assert.throws(() => totp.verify(secret, '123456', opts), TypeError)
    }
  })

  it('supports unsigned 64-bit counters and rejects imprecise numbers', () => {
    // Independent expected values generated with Python hmac and struct.pack('>Q').
    assert.equal(hotp.generate(secret, 2n ** 63n), '959616')
    assert.equal(hotp.generate(secret, (1n << 64n) - 1n), '094451')
    for (const counter of [-1, -1n, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, 1n << 64n, '0', null]) {
      assert.throws(() => hotp.generate(secret, counter))
    }
  })

  it('rejects invalid time settings and excessive windows', () => {
    for (const step of [0, -1, 0.5, Infinity, NaN, null, '30']) {
      assert.throws(() => totp.generate(secret, { step }), RangeError)
      assert.throws(() => totp.verify(secret, '123456', { step }), RangeError)
    }
    for (const epoch of [-1, 0.5, Infinity, NaN, null, Number.MAX_SAFE_INTEGER + 1]) {
      assert.throws(() => totp.generate(secret, { epoch }), RangeError)
    }
    for (const window of [-1, 0.5, 11, Infinity, NaN, null, '1']) {
      assert.throws(() => totp.verify(secret, '123456', { window }), RangeError)
    }
  })

  it('handles step boundaries, both drift directions, and the Unix epoch', () => {
    assert.equal(totp.generate(secret, { epoch: 29999 }), '755224')
    assert.equal(totp.generate(secret, { epoch: 30000 }), '287082')
    for (const offset of [-1, 0, 1]) {
      const token = totp.generate(secret, { epoch: 120000 + offset * 30000 })
      assert.equal(totp.verify(secret, token, { epoch: 120000, window: 1 }), true)
      assert.equal(totp.verify(secret, token, { epoch: 120000 }), offset === 0)
    }
    const outside = totp.generate(secret, { epoch: 180000 })
    assert.equal(totp.verify(secret, outside, { epoch: 120000, window: 1 }), false)
    assert.equal(totp.verify(secret, '755224', { epoch: 0, window: 1 }), true)
    assert.equal(totp.verify(secret, '094451', { epoch: 0, window: 1 }), false)
    assert.equal(totp.verify(secret, '755224', { epoch: 0, window: 10 }), true)
  })

  it('returns false for malformed or incorrect tokens', () => {
    for (const token of [null, undefined, 755224, '', '75522', '7552240', '７５５２２４', 'abcdef', '000000']) {
      assert.equal(hotp.verify(secret, 0, token), false)
      assert.equal(totp.verify(secret, token, { epoch: 0, window: 1 }), false)
    }
  })

  it('generates secrets within the supported size bounds', () => {
    assert.equal(base32.decode(generateSecret()).length, 32)
    for (const length of [16, 20, 64, 1024]) {
      assert.equal(base32.decode(generateSecret(length)).length, length)
    }
    for (const length of [0, 15, 1025, -1, 1.5, NaN, Infinity, '32', null]) {
      assert.throws(() => generateSecret(length), RangeError)
    }
  })

  it('validates provisioning settings and normalizes secrets', () => {
    const options = { label: 'Example:user', secret }
    for (const counter of [NaN, Infinity, -1, 0.5, Number.MAX_SAFE_INTEGER + 1]) {
      assert.throws(() => otpauthURL({ ...options, type: 'hotp', counter }))
    }
    for (const extra of [{ algorithm: 'md5' }, { digits: 0 }, { period: 0 }, { issuer: 5 }, { type: '' }, { secret: 'A' }, { label: ' ' }]) {
      assert.throws(() => otpauthURL({ ...options, ...extra }))
    }
    const url = new URL(otpauthURL({ ...options, type: 'hotp', counter: (1n << 64n) - 1n }))
    assert.equal(url.searchParams.get('counter'), '18446744073709551615')
    const normalized = new URL(otpauthURL({ ...options, secret: 'my======', algorithm: 'sha256' }))
    assert.equal(normalized.searchParams.get('secret'), 'MY')
    assert.equal(normalized.searchParams.get('algorithm'), 'SHA256')
  })
})
