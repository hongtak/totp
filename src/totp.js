import hotp from './hotp.js'

function generate (secret, opts = {}) {
  const defaultOpts = {
    digits: 6,
    epoch: Date.now(),
    algorithm: 'sha1',
    step: 30
  }

  Object.assign(defaultOpts, opts)
  console.log(defaultOpts)
  const counter = Math.floor(defaultOpts.epoch / (defaultOpts.step * 1000))
  return hotp.generate(secret, counter, defaultOpts)
}

function verify (secret, token, opts = {}) {
  const defaultOpts = {
    digits: 6,
    epoch: Date.now(),
    algorithm: 'sha1',
    step: 30,
    window: 0
  }

  Object.assign(defaultOpts, opts)
  console.log(defaultOpts)
  const counter = Math.floor(defaultOpts.epoch / (defaultOpts.step * 1000))

  for (let i = -defaultOpts.window; i <= defaultOpts.window; i++) {
    console.log(counter + i)
    const expectedCode = hotp.generate(secret, counter + i, defaultOpts)
    if (expectedCode === token) {
      return true
    }
  }
  return false
}

export default {
  generate,
  verify
}
