import hotp, { matches } from './hotp.js'
import * as validate from './validation.js'

function settings(opts) {
  validate.options(opts)
  const epoch = validate.integer(opts.epoch === undefined ? Date.now() : opts.epoch, 'Epoch', 0, Number.MAX_SAFE_INTEGER)
  const step = validate.period(opts.step)
  return {
    counter: BigInt(epoch) / (1000n * BigInt(step)),
    digits: validate.digits(opts.digits),
    algorithm: validate.algorithm(opts.algorithm),
  }
}

function generate(secret, opts = {}) {
  const config = settings(opts)
  return hotp.generate(secret, config.counter, config)
}

function verify(secret, token, opts = {}) {
  const config = settings(opts)
  const window = validate.integer(opts.window === undefined ? 0 : opts.window, 'Window', 0, 10)
  let valid = false
  for (let i = -window; i <= window; i++) {
    const counter = config.counter + BigInt(i)
    if (counter < 0n) {
      continue
    }
    const expected = hotp.generate(secret, counter, config)
    // Check every candidate so the matching time step does not cause an early return.
    valid = matches(expected, token) || valid
  }
  return valid
}

export default { generate, verify }
