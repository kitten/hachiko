import { KVKey, Predicate } from './constants'

abstract class Iterable<T> {
  abstract owner?: Object

  abstract __iterate(step: Predicate<T>): boolean
  abstract asMutable(): Iterable<T>
  abstract asImmutable(): Iterable<T>
  abstract set(key: KVKey, value: T): Iterable<T>
  abstract delete(key: KVKey): Iterable<T>

  withMutations(closure: (x: Iterable<T>) => void) {
    let mutable = this.asMutable()
    closure(mutable)
    return mutable.asImmutable()
  }

  filter(predicate: Predicate<T>): Iterable<T> {
    let mutable = this.owner ? this : this.asMutable()

    this.__iterate((value: T, key: KVKey) => {
      if (!predicate(value, key)) {
        mutable = mutable.delete(key)
      }

      return false
    })

    return this.owner ? mutable : mutable.asImmutable()
  }
}

export default Iterable
