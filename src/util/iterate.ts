import { KVKey } from '../constants'

export default function iterate<T>(input: any, cb: (value: T, key: KVKey) => void) {
  if (typeof input === 'object' && !Array.isArray(input)) {
    const keys = Object.keys(input)
    const length = keys.length

    for (let i = 0; i < length; i++) {
      const key = keys[i]
      const value = input[key]

      cb(value, key)
    }
  }
}
