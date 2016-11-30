import Iterable from '../Iterable'
import { KVKey, KVTuple, Predicate, Option } from '../constants'

export const find = <T>(
  iter: Iterable<T>,
  reverse: boolean,
  predicate: Predicate<T>,
  notSetValue?: T
): Option<T> => {
  let result = notSetValue
  iter.__iterate(
    (value: T, key: KVKey) => {
      if (predicate(value, key)) {
        result = value
        return true
      }

      return false
    },
    reverse
  )

  return result
}

export const findEntry = <T>(
  iter: Iterable<T>,
  reverse: boolean,
  predicate: Predicate<T>
): Option<KVTuple<T>> => {
  let result: Option<KVTuple<T>>

  iter.__iterate(
    (value: T, key: KVKey) => {
      if (predicate(value, key)) {
        result = [ key, value ]
        return true
      }

      return false
    },
    reverse
  )

  return result
}

export const findKey = <T>(
  iter: Iterable<T>,
  reverse: boolean,
  predicate: Predicate<T>,
  notSetValue?: KVKey
): Option<KVKey> => {
  let result = notSetValue

  iter.__iterate(
    (value: T, key: KVKey) => {
      if (predicate(value, key)) {
        result = key
        return true
      }

      return false
    },
    reverse
  )

  return result
}
