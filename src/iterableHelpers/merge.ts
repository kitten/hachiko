import Iterable from '../Iterable'
import { Dict, Merger } from '../constants'

export const merge = <K, T>(
  iter: Iterable<K, T>,
  iterables: (Dict<T> | Iterable<K, T>)[]
): Iterable<K, T> => {
  if (!iterables.length) {
    return iter
  }

  let mutable = iter.owner ? iter : iter.asMutable()

  const length = iterables.length
  for (let i = 0; i < length; i++) {
    const iterable = iterables[i]

    if (!Iterable.isIterable(iterable)) {
      const _iterable = (iterable as Dict<T>)
      const keys = Object.keys(_iterable)
      const length = keys.length

      for (let j = 0; j < length; j++) {
        const key = keys[j] as any
        mutable = mutable.set(key, _iterable[key])
      }
    } else {
      (iterable as Iterable<K, T>).__iterate((value: T, key: K) => {
        mutable = mutable.set(key, value)
        return false
      })
    }
  }

  return iter.owner ? mutable : mutable.asImmutable()
}

export const mergeWith = <K, T>(
  iter: Iterable<K, T>,
  merger: Merger<K | string, T>,
  iterables: (Dict<T> | Iterable<K, T>)[]
): Iterable<K, T> => {
  if (!iterables.length) {
    return iter
  }

  let mutable = iter.owner ? iter : iter.asMutable()

  const length = iterables.length
  for (let i = 0; i < length; i++) {
    const iterable = iterables[i]

    if (!Iterable.isIterable(iterable)) {
      const _iterable = (iterable as Dict<T>)
      const keys = Object.keys(_iterable)
      const length = keys.length

      for (let j = 0; j < length; j++) {
        const key = keys[j] as any
        const prev = mutable.get(key)
        const next = (prev !== undefined) ?
          merger(prev, _iterable[key], key) :
          _iterable[key]

        mutable = mutable.set(key, next)
      }
    } else {
      (iterable as Iterable<K, T>).__iterate((value: T, key: K) => {
        const prev = mutable.get(key)
        const next = (prev !== undefined) ?
          merger(prev, value, key) :
          value

        mutable = mutable.set(key, next)
        return false
      })
    }
  }

  return iter.owner ? mutable : mutable.asImmutable()
}
