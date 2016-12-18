import Cache from './Cache'

const toInt32 = (x: number) => (
  ((x >>> 1) & 0x40000000) | (x & 0xBFFFFFFF)
)

// Turning strings to (32-bit) number hashes
// See: http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
const hashString = (x: string): number => {
  const length = x.length
  let hash = 0

  for (let i = 0; i < length; i++) {
    hash = 31 * hash + x.charCodeAt(i) | 0
  }

  return toInt32(hash)
}

const objectCache = new Cache<number>()
let objectHashId = 1
const hashObject = (x: any): number => {
  let hash = objectCache.get(x)
  if (hash !== undefined) {
    return hash
  }

  hash = ++objectHashId
  objectCache.set(x, hash)

  return hash
}

// See: https://github.com/facebook/immutable-js/blob/master/src/Hash.js#L12
const hash = (input: any): number => {
  let x = input

  if (x === false || x === null || x === undefined) {
    return 0
  } else if (x === true) {
    return 1
  } else if (typeof x.valueOf === 'function') {
    x = x.valueOf()
  }

  const typeOf = typeof x

  // Number
  if (typeOf === 'number') {
    if (x !== x || x === Infinity) {
      return 0
    }

    return toInt32(x as number)
  } else if (typeOf === 'string') {
    return hashString(x as string)
  } else if (typeof x.hashCode === 'function') {
    return x.hashCode() as number
  } else if (typeOf === 'object') {
    return hashObject(x)
  } else if (typeof x.toString === 'function') {
    return hashString(x.toString())
  }

  throw new TypeError(`Value ${x} cannot be hashed.`)
}

export default hash
