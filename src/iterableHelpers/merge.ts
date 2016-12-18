import Iterable from '../Iterable'
import { KVKey, Dict, Merger } from '../constants'

export const merge = <T>(iter: Iterable<T>, iterables: (Dict<T> | Iterable<T>)[]): Iterable<T> => {
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
        const key = keys[j]
        mutable = mutable.set(key, _iterable[key])
      }
    } else {
      (iterable as Iterable<T>).__iterate((value: T, key: KVKey) => {
        mutable = mutable.set(key, value)
        return false
      })
    }
  }

  return iter.owner ? mutable : mutable.asImmutable()
}

export const mergeWith = <T>(
  iter: Iterable<T>,
  merger: Merger<T>,
  iterables: (Dict<T> | Iterable<T>)[]
): Iterable<T> => {
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
        const key = keys[j]
        const prev = mutable.get(key)
        const next = (prev !== undefined) ?
          merger(prev, _iterable[key], key) :
          _iterable[key]

        mutable = mutable.set(key, next)
      }
    } else {
      (iterable as Iterable<T>).__iterate((value: T, key: KVKey) => {
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
