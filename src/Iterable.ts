import {
  KVKey,
  KVTuple,
  Merger,
  Predicate,
  Reducer,
  Option,
  Transform,
  Updater,
  Dict
} from './constants'

import reduce from './iterableHelpers/reduce'
import filter from './iterableHelpers/filter'
import { find, findEntry, findKey } from './iterableHelpers/find'
import { merge, mergeWith } from './iterableHelpers/merge'

abstract class Iterable<T> {
  abstract size: number
  abstract owner?: Object

  static isIterable(object: any) {
    return object && object instanceof Iterable
  }

  abstract __iterate(step: Predicate<T>, reverse?: boolean): boolean
  abstract asMutable(): Iterable<T>
  abstract asImmutable(): Iterable<T>
  abstract get(key: KVKey, notSetVal?: T): Option<T>
  abstract set(key: KVKey, value: T): Iterable<T>
  abstract delete(key: KVKey): Iterable<T>

  isEmpty(): boolean {
    return !this.size
  }

  forEach(sideEffect: (value: T, key: KVKey) => void) {
    this.__iterate((value: T, key: KVKey) => {
      sideEffect(value, key)
      return false
    })
  }

  merge(iterables: (Dict<T>[] | Iterable<T>[])): Iterable<T> {
    return merge<T>(this, iterables)
  }

  mergeWith(merger: Merger<T>, iterables: (Dict<T>[] | Iterable<T>[])): Iterable<T> {
    return mergeWith<T>(this, merger, iterables)
  }

  mapKeys(transform: Updater<KVKey>): Iterable<T> {
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

  mapEntries<G>(transform: Transform<T, KVTuple<G>>): Iterable<G> {
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
    return filter<T>(this, predicate, false)
  }

  filterNot(predicate: Predicate<T>): Iterable<T> {
    return filter<T>(this, predicate, true)
  }

  find(predicate: Predicate<T>, notSetValue?: T): Option<T> {
    return find<T>(this, false, predicate, notSetValue)
  }

  findLast(predicate: Predicate<T>, notSetValue?: T): Option<T> {
    return find<T>(this, true, predicate, notSetValue)
  }

  findEntry(predicate: Predicate<T>, notSetValue?: T): Option<KVTuple<T>> {
    return findEntry<T>(this, false, predicate)
  }

  findEntryLast(predicate: Predicate<T>, notSetValue?: T): Option<KVTuple<T>> {
    return findEntry<T>(this, true, predicate)
  }

  findKey(predicate: Predicate<T>, notSetValue?: KVKey): Option<KVKey> {
    return findKey<T>(this, false, predicate, notSetValue)
  }

  findKeyLast(predicate: Predicate<T>, notSetValue?: KVKey): Option<KVKey> {
    return findKey<T>(this, true, predicate, notSetValue)
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

  join(separator = ','): string {
    let result = ''
    this.__iterate((value: T, key: KVKey) => {
      result = (result ? result + separator : result) + value
      return false
    })

    return result
  }

  count(predicate: Predicate<T>): number {
    let count = 0
    this.__iterate((value: T, key: KVKey) => {
      if (predicate(value, key)) {
        count = count + 1
      }

      return false
    })

    return count
  }

  has(key: KVKey): boolean {
    const NOT_SET = {} as T
    return this.get(key, NOT_SET) !== NOT_SET
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
