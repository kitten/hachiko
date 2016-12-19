import Iterable from '../Iterable'
import { Reducer } from '../constants'

const reduce = <K, T, G>(
  iter: Iterable<K, T>,
  reverse: boolean,
  reducer: Reducer<K, T, G>,
  initialValue?: any
): G => {
  let unset = false
  let result = initialValue
  if (typeof initialValue === 'undefined') {
    unset = true
  }

  iter.__iterate(
    (value: T, key: K) => {
      if (unset) {
        result = value
        unset = false
      } else {
        result = reducer(result, value, key)
      }

      return false
    },
    reverse
  )

  return result
}

export default reduce
