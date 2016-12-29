import {
  Merger,
  Predicate,
  Reducer,
  Option,
  Transform,
  Updater,
  Dict
} from './constants'

import hash, { combineHashes, murmurHash } from './util/hash'
import reduce from './iterableHelpers/reduce'
import filter from './iterableHelpers/filter'
import { find, findEntry, findKey } from './iterableHelpers/find'
import { merge, mergeWith } from './iterableHelpers/merge'

abstract class Iterable<K, T> {
  abstract size: number
  abstract owner?: Object

  private _hashCode?: number

  static isIterable(object: any) {
    return object && object instanceof Iterable
  }

  abstract __iterate(step: Predicate<K, T>, reverse?: boolean): boolean
  abstract asMutable(): Iterable<K, T>
  abstract asImmutable(): Iterable<K, T>
  abstract get(key: K, notSetVal?: T): Option<T>
  abstract set(key: K, value: T): Iterable<K, T>
  abstract delete(key: K): Iterable<K, T>

  hashCode(): number {
    if (typeof this._hashCode !== 'number') {
      let h = 1
      this.__iterate((value: T, key: K) => {
        h = 31 * h + combineHashes(hash(value), hash(key)) | 0
        return false
      })

      this._hashCode = murmurHash(this.size, h)
    }

    return this._hashCode
  }

  isEmpty(): boolean {
    return !this.size
  }

  update(key: K, updater: Updater<T>): Iterable<K, T> {
    const value = this.get(key) as T
    return this.set(key, updater(value))
  }

  forEach(sideEffect: (value: T, key: K) => void) {
    this.__iterate((value: T, key: K) => {
      sideEffect(value, key)
      return false
    })
  }

  merge(...iterables: (Dict<T> | Iterable<K, T>)[]): Iterable<K, T> {
    return merge<K, T>(this, iterables)
  }

  mergeWith(
    merger: Merger<K | string, T>,
    ...iterables: (Dict<T> | Iterable<K, T>)[]
  ): Iterable<K, T> {
    return mergeWith<K, T>(this, merger, iterables)
  }

  mapKeys<G>(
    transform: (key: K) => G
  ): Iterable<G, T> {
    const self = (this as Iterable<any, any>)

    let mutable = (self.owner ? self : self.asMutable()) as Iterable<G, T>
    this.__iterate((value: T, key: K) => {
      const newKey = transform(key)
      if (newKey as any !== key) {
        mutable = mutable
          .delete(key as any)
          .set(newKey, value)
      }

      return false
    })

    return this.owner ? mutable : mutable.asImmutable()
  }

  mapEntries<U, G>(transform: Transform<K, T, [U, G]>): Iterable<U, G> {
    const self = (this as Iterable<any, any>)

    let mutable = (self.owner ? self : self.asMutable()) as Iterable<U, G>
    this.__iterate((value: T, key: K) => {
      const [newKey, newValue] = transform(value, key)
      if (newKey as any !== key) {
        mutable = mutable.delete(key as any)
      }

      mutable = mutable.set(newKey, newValue)
      return false
    })

    return self.owner ? mutable : mutable.asImmutable()
  }

  filter(predicate: Predicate<K, T>): Iterable<K, T> {
    return filter<K, T>(this, predicate, false)
  }

  filterNot(predicate: Predicate<K, T>): Iterable<K, T> {
    return filter<K, T>(this, predicate, true)
  }

  find(predicate: Predicate<K, T>, notSetValue?: T): Option<T> {
    return find<K, T>(this, false, predicate, notSetValue)
  }

  findLast(predicate: Predicate<K, T>, notSetValue?: T): Option<T> {
    return find<K, T>(this, true, predicate, notSetValue)
  }

  findEntry(predicate: Predicate<K, T>, notSetValue?: T): Option<[K, T] | T> {
    return findEntry<K, T>(this, false, predicate, notSetValue)
  }

  findLastEntry(predicate: Predicate<K, T>, notSetValue?: T): Option<[K, T] | T> {
    return findEntry<K, T>(this, true, predicate, notSetValue)
  }

  findKey(predicate: Predicate<K, T>, notSetValue?: K): Option<K> {
    return findKey<K, T>(this, false, predicate, notSetValue)
  }

  findLastKey(predicate: Predicate<K, T>, notSetValue?: K): Option<K> {
    return findKey<K, T>(this, true, predicate, notSetValue)
  }

  reduce<G>(reducer: Reducer<K, T, G>, initialValue?: any): G {
    return reduce<K, T, G>(
      this,
      false,
      reducer,
      initialValue
    )
  }

  reduceRight<G>(reducer: Reducer<K, T, G>, initialValue?: any): G {
    return reduce<K, T, G>(
      this,
      true,
      reducer,
      initialValue
    )
  }

  join(separator = ','): string {
    let result = ''
    this.__iterate((value: T, key: K) => {
      result = (result ? result + separator : result) + value
      return false
    })

    return result
  }

  count(predicate: Predicate<K, T>): number {
    let count = 0
    this.__iterate((value: T, key: K) => {
      if (predicate(value, key)) {
        count = count + 1
      }

      return false
    })

    return count
  }

  has(key: K): boolean {
    const NOT_SET = {} as any
    return this.get(key, NOT_SET) !== NOT_SET
  }

  includes(value: T): boolean {
    return this.__iterate((_value: T, key: K) => {
      if (value === _value) {
        return true
      }

      return false
    })
  }

  every(predicate: Predicate<K, T>) {
    return !this.__iterate((value: T, key: K) => (
      !predicate(value, key)
    ))
  }

  some(predicate: Predicate<K, T>) {
    return this.__iterate(predicate)
  }

  first(): Option<T> {
    let res: Option<T> = undefined
    this.__iterate((value: T, key: K) => {
      res = value
      return true
    })

    return res
  }

  last(): Option<T> {
    let res: Option<T> = undefined
    this.__iterate(
      (value: T, key: K) => {
        res = value
        return true
      },
      true
    )

    return res
  }
}

export default Iterable
