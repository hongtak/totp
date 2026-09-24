const algorithms = ['sha1', 'sha256', 'sha512']
const maxCounter = (1n << 64n) - 1n

function integer(value, name, min, max) {
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new RangeError(`${name} must be an integer between ${min} and ${max}`)
  }
  return value
}

function options(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('Options must be an object')
  }
  return value
}

function algorithm(value = 'sha1') {
  if (typeof value !== 'string' || !algorithms.includes(value.toLowerCase())) {
    throw new RangeError('Algorithm must be SHA1, SHA256, or SHA512')
  }
  return value.toLowerCase()
}

function digits(value = 6) {
  return integer(value, 'Digits', 6, 8)
}

function counter(value) {
  if (typeof value === 'number') {
    integer(value, 'Counter', 0, Number.MAX_SAFE_INTEGER)
  } else if (typeof value !== 'bigint') {
    throw new TypeError('Counter must be a number or bigint')
  }
  const result = BigInt(value)
  if (result < 0n || result > maxCounter) {
    throw new RangeError('Counter must fit in an unsigned 64-bit integer')
  }
  return result
}

function period(value = 30) {
  return integer(value, 'Time step', 1, Number.MAX_SAFE_INTEGER)
}

export { integer, options, algorithm, digits, counter, period }
