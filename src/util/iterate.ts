export default function iterate<K, T>(input: any, cb: (value: T, key: K) => void) {
  if (typeof input === 'object' && !Array.isArray(input)) {
    const keys = Object.keys(input)
    const length = keys.length

    for (let i = 0; i < length; i++) {
      const key = keys[i] as any
      const value = input[key]

      cb(value, key)
    }
  }
}
