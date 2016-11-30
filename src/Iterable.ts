import { KVKey, Predicate, Reducer, Option, Transform, Updater } from './constants'
import reduce from './iterableHelpers/reduce'

abstract class Iterable<T> {
  abstract size: number
  abstract owner?: Object

  abstract __iterate(step: Predicate<T>, reverse?: boolean): boolean
  abstract asMutable(): Iterable<T>
  abstract asImmutable(): Iterable<T>
  abstract set(key: KVKey, value: T): Iterable<T>
  abstract delete(key: KVKey): Iterable<T>

  withMutations(closure: (x: Iterable<T>) => void) {
    let mutable = this.asMutable()
    closure(mutable)
    return mutable.asImmutable()
  }

  isEmpty(): boolean {
    return !this.size
  }

  forEach(sideEffect: (value: T, key: KVKey) => void) {
    this.__iterate((value: T, key: KVKey) => {
      sideEffect(value, key)
      return false
    })
  }

  mapKeys(transform: Updater<KVKey>) {
    let mutable = this.owner ? this : this.asMutable()
    this.__iterate((value: T, key: KVKey) => {
      const newKey = transform(key)
      if (newKey !== key) {
        mutable = mutable
          .delete(key)
          .set(newKey, value)
      }

      return false
    })

    return this.owner ? mutable : mutable.asImmutable()
  }

  mapEntries<G>(transform: Transform<T, [KVKey, G]>): Iterable<G> {
    const self = (this as Iterable<any>)

    let mutable = (self.owner ? self : self.asMutable()) as Iterable<G>
    this.__iterate((value: T, key: KVKey) => {
      const [newKey, newValue] = transform(value, key)
      if (newKey !== key) {
        mutable = mutable.delete(key)
      }

      mutable = mutable.set(newKey, newValue)
      return false
    })

    return self.owner ? mutable : mutable.asImmutable()
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

  filterNot(predicate: Predicate<T>): Iterable<T> {
    let mutable = this.owner ? this : this.asMutable()
    this.__iterate((value: T, key: KVKey) => {
      if (predicate(value, key)) {
        mutable = mutable.delete(key)
      }

      return false
    })

    return this.owner ? mutable : mutable.asImmutable()
  }

  find(predicate: Predicate<T>, notSetValue?: T): Option<T> {
    let result = notSetValue
    this.__iterate((value: T, key: KVKey) => {
      if (predicate(value, key)) {
        result = value
        return true
      }

      return false
    })

    return result
  }

  reduce<G>(reducer: Reducer<T, G>, initialValue?: any): G {
    return reduce<T, G>(
      this,
      false,
      reducer,
      initialValue
    )
  }

  reduceRight<G>(reducer: Reducer<T, G>, initialValue?: any): G {
    return reduce<T, G>(
      this,
      true,
      reducer,
      initialValue
    )
  }

  has(key: KVKey): boolean {
    return this.__iterate((value: T, _key: KVKey) => {
      if (key === _key) {
        return true
      }

      return false
    })
  }

  includes(value: T): boolean {
    return this.__iterate((_value: T, key: KVKey) => {
      if (value === _value) {
        return true
      }

      return false
    })
  }

  every(predicate: Predicate<T>) {
    return !this.__iterate((value: T, key: KVKey) => (
      !predicate(value, key)
    ))
  }

  some(predicate: Predicate<T>) {
    return this.__iterate(predicate)
  }

  first(): Option<T> {
    let res: Option<T> = undefined
    this.__iterate((value: T, key: KVKey) => {
      res = value
      return true
    })

    return res
  }

  last(): Option<T> {
    let res: Option<T> = undefined
    this.__iterate(
      (value: T, key: KVKey) => {
        res = value
        return true
      },
      true
    )

    return res
  }
}

export default Iterable
