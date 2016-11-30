import Iterable from '../Iterable'
import { KVKey, Reducer } from '../constants'

const reduce = <T, G>(
  iter: Iterable<T>,
  reverse: boolean,
  reducer: Reducer<T, G>,
  initialValue?: any
): G => {
  let unset = false
  let result = initialValue
  if (typeof initialValue === 'undefined') {
    unset = true
  }

  iter.__iterate(
    (value: T, key: KVKey) => {
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
