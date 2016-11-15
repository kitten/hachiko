// Turning strings to (32-bit) number hashes
// See: http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
const hash = (x: number | string): number => {
  if (typeof x === 'number') {
    return x
  } else if (!x.length) {
    return 0
  }

  const length = x.length
  let hash = 0

  for (let i = 0; i < length; i++) {
    const charCode = x.charCodeAt(i)
    hash = (((hash << 5) - hash) + charCode) | 0
  }

  return hash
}

export default hash
