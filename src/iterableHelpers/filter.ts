import Iterable from '../Iterable'
import { Predicate } from '../constants'

const filter = <K, T>(iter: Iterable<K, T>, predicate: Predicate<K, T>, bool: boolean) => {
  let mutable = iter.owner ? iter : iter.asMutable()

  iter.__iterate((value: T, key: K) => {
    const condition = !!predicate(value, key)
    if (condition === bool) {
      mutable = mutable.delete(key)
    }

    return false
  })

  return iter.owner ? mutable : mutable.asImmutable()
}

export default filter
