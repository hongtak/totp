import { otpauthURL } from '../otpauthURL.js'
import { generateSecret } from '../index.js'
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { URL } from 'node:url'

describe('otpauthURL', () => {
  const secret = generateSecret()
  const label = 'TestApp:username'
  const totpPrefix = 'otpauth://totp/TestApp%3Ausername?'

  it('should failed otpauth URL without options', () => {
    assert.throws(() => {
      otpauthURL()
    })
  })

  it('should generate otpauth URL for TOTP', () => {
    const url = otpauthURL({
      secret,
      label
    })
    assert(url.startsWith(totpPrefix))
    const urlObj = new URL(url)
    assert.strictEqual(urlObj.searchParams.get('secret'), secret)
  })

  it('should failed otpauth URL for HOTP without counter', () => {
    assert.throws(
      () => {
        otpauthURL({
          type: 'hotp',
          secret,
          label
        })
      },
      {
        name: 'Error',
        message: 'Counter is required for HOTP'
      }
    )
  })

  it('should generate otpauth URL for HOTP with counter', () => {
    const url = otpauthURL({
      type: 'hotp',
      secret,
      label,
      counter: 10
    })
    assert(url.startsWith(totpPrefix.replace('totp', 'hotp')))
    const urlObj = new URL(url)
    assert.strictEqual(urlObj.searchParams.get('counter'), '10')
    assert.strictEqual(urlObj.searchParams.get('secret'), secret)
  })

  it('should generate otpauth URL with algorithm', () => {
    const url = otpauthURL({
      secret,
      label,
      algorithm: 'SHA256'
    })
    assert(url.startsWith(totpPrefix))
    const urlObj = new URL(url)
    assert.strictEqual(urlObj.searchParams.get('algorithm'), 'SHA256')
    assert.strictEqual(urlObj.searchParams.get('secret'), secret)
  })

  it('should generate otpauth URL with issuer', () => {
    const url = otpauthURL({
      secret,
      label,
      issuer: 'TestApp'
    })
    assert(url.startsWith(totpPrefix))
    const urlObj = new URL(url)
    assert.strictEqual(urlObj.searchParams.get('issuer'), 'TestApp')
    assert.strictEqual(urlObj.searchParams.get('secret'), secret)
  })

  it('should have period for TOTP', () => {
    const url = otpauthURL({
      secret,
      label,
      period: 60
    })
    assert(url.startsWith(totpPrefix))
    const urlObj = new URL(url)
    assert.strictEqual(urlObj.searchParams.get('period'), '60')
    assert.strictEqual(urlObj.searchParams.get('secret'), secret)
  })

  it('should generate otpauth URL without unknown options', () => {
    const url = otpauthURL({
      secret,
      label,
      foo: 'bar'
    })
    assert(url.startsWith(totpPrefix))
    const urlObj = new URL(url)
    assert.strictEqual(urlObj.searchParams.get('foo'), null)
    assert.strictEqual(urlObj.searchParams.get('secret'), secret)
  })
})
