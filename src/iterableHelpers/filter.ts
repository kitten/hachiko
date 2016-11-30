import Iterable from '../Iterable'
import { KVKey, Predicate } from '../constants'

const filter = <T>(iter: Iterable<T>, predicate: Predicate<T>, bool: boolean) => {
  let mutable = iter.owner ? iter : iter.asMutable()

  iter.__iterate((value: T, key: KVKey) => {
    const condition = !!predicate(value, key)
    if (condition === bool) {
      mutable = mutable.delete(key)
    }

    return false
  })

  return iter.owner ? mutable : mutable.asImmutable()
}

export default filter
