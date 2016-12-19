import { Predicate, Transform, Updater, Option } from './constants'
import hash from './util/hash'
import BitmapIndexedNode, { emptyNode } from './kvHamt/BitmapIndexedNode'
import Iterable from './Iterable'
import IteratorSymbol from './util/iteratorSymbol'
import iterate from './util/iterate'

import {
  KeyIterator,
  ValueIterator,
  EntryIterator
} from './kvHamt/Iterator'

let EMPTY_MAP: Map<any, any>
function emptyMap<K, T>(): Map<K, T> {
  if (!EMPTY_MAP) {
    EMPTY_MAP = Object.create(Map.prototype)
    EMPTY_MAP.root = emptyNode<K, T>()
    EMPTY_MAP.size = 0
  }

  return EMPTY_MAP as Map<K, T>
}

function makeMap<K, T>(root: BitmapIndexedNode<K, T>, forceCreation = false): Map<K, T> {
  if (
    !forceCreation &&
    root.size === 0
  ) {
    return emptyMap<K, T>()
  }

  const res = Object.create(Map.prototype)
  res.root = root
  res.size = root.size
  return res
}

export default class Map<K, T> extends Iterable<K, T> {
  root: BitmapIndexedNode<K, T>
  size: number
  owner?: Object

  constructor(input: any) {
    super()

    let root = emptyNode<K, T>()

    const owner = {}
    iterate<K, T>(input, (val, key) => {
      root = root.set(hash(key), key, val, owner)
    })

    return makeMap<K, T>(root)
  }

  static isMap(object: any) {
    return object && object instanceof Map
  }

  get(key: K, notSetVal?: T): Option<T> {
    return this.root.get(hash(key), key, notSetVal)
  }

  set(key: K, value: T): Map<K, T> {
    const root = this.root.set(hash(key), key, value, this.owner)

    if (this.owner) {
      this.root = root
      this.size = root.size
      return this
    }

    return makeMap<K, T>(root)
  }

  delete(key: K): Map<K, T> {
    const root = this.root.delete(hash(key), key, this.owner) as BitmapIndexedNode<K, T>
    if (this.owner) {
      this.root = root
      this.size = root.size
      return this
    }

    return makeMap<K, T>(root)
  }

  update(key: K, updater: Updater<T>): Iterable<K, T> {
    const value = this.get(key) as T
    return this.set(key, updater(value))
  }

  map<G>(transform: Transform<K, T, G>): Map<K, G> {
    const root = this.root.map<G>(transform, this.owner) as BitmapIndexedNode<K, G>
    if (this.owner) {
      const res = (this as Map<any, any>)
      res.root = root
      return (res as Map<K, G>)
    }

    return makeMap<K, G>(root)
  }

  clear(): Map<K, T> {
    return emptyMap<K, T>()
  }

  asMutable(): Map<K, T> {
    if (this.owner) {
      return this
    }

    const res = makeMap<K, T>(this.root, true)
    res.owner = {}
    return res
  }

  asImmutable(): Map<K, T> {
    if (!this.size) {
      return emptyMap<K, T>()
    }

    this.owner = undefined
    return this
  }

  withMutations(closure: (x: Map<K, T>) => void) {
    let mutable = this.asMutable()
    closure(mutable)
    return mutable.asImmutable()
  }

  __iterate(step: Predicate<K, T>, reverse?: boolean) {
    if (reverse) {
      return this.root.iterateReverse(step)
    }

    return this.root.iterate(step)
  }

  values(): ValueIterator<K, T> {
    return new ValueIterator<K, T>(this.root)
  }

  keys(): KeyIterator<K, T> {
    return new KeyIterator<K, T>(this.root)
  }

  entries(): EntryIterator<K, T> {
    return new EntryIterator<K, T>(this.root)
  }

  [IteratorSymbol](): EntryIterator<K, T> {
    return this.entries()
  }
}
