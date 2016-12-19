import Iterable from '../Iterable'
import { Predicate, Option } from '../constants'

export const find = <K, T>(
  iter: Iterable<K, T>,
  reverse: boolean,
  predicate: Predicate<K, T>,
  notSetValue?: T
): Option<T> => {
  let result = notSetValue
  iter.__iterate(
    (value: T, key: K) => {
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

export const findEntry = <K, T>(
  iter: Iterable<K, T>,
  reverse: boolean,
  predicate: Predicate<K, T>,
  notSetValue?: T
): Option<[K, T] | T> => {
  let result: Option<[K, T] | T> = notSetValue

  iter.__iterate(
    (value: T, key: K) => {
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

export const findKey = <K, T>(
  iter: Iterable<K, T>,
  reverse: boolean,
  predicate: Predicate<K, T>,
  notSetValue?: K
): Option<K> => {
  let result = notSetValue

  iter.__iterate(
    (value: T, key: K) => {
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
