const toInt32 = (x: number) => (
  ((x >>> 1) & 0x40000000) | (x & 0xBFFFFFFF)
)

// Turning strings to (32-bit) number hashes
// See: http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
const hash = (x: number | string): number => {
  if (typeof x === 'number') {
    return toInt32(x)
  }

  const length = x.length
  let hash = 0

  for (let i = 0; i < length; i++) {
    hash = 31 * hash + x.charCodeAt(i) | 0
  }

  return toInt32(hash)
}

export default hash
