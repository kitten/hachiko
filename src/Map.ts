import { KVKey, Predicate, Transform, Updater, Option } from './constants'
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

let EMPTY_MAP: Map<any>
function emptyMap<T>(): Map<T> {
  if (!EMPTY_MAP) {
    EMPTY_MAP = Object.create(Map.prototype)
    EMPTY_MAP.root = emptyNode<T>()
    EMPTY_MAP.size = 0
  }

  return EMPTY_MAP as Map<T>
}

function makeMap<T>(root: BitmapIndexedNode<T>, forceCreation = false): Map<T> {
  if (
    !forceCreation &&
    root.size === 0
  ) {
    return emptyMap<T>()
  }

  const res = Object.create(Map.prototype)
  res.root = root
  res.size = root.size
  res.owner = root.owner
  return res
}

export default class Map<T> extends Iterable<T> {
  root: BitmapIndexedNode<T>
  size: number
  owner?: Object

  constructor(input: any) {
    super()

    let root = emptyNode<T>()

    const owner = {}
    iterate<T>(input, (val, key) => {
      root = root.set(hash(key), key, val, owner)
    })

    return makeMap<T>(root)
  }

  static isMap(object: any) {
    return object && object instanceof Map
  }

  get(key: KVKey, notSetVal?: T): Option<T> {
    return this.root.get(hash(key), key, notSetVal)
  }

  set(key: KVKey, value: T): Map<T> {
    const root = this.root.set(hash(key), key, value, this.owner)

    if (this.owner) {
      this.root = root
      this.size = root.size
      return this
    }

    return makeMap<T>(root)
  }

  delete(key: KVKey): Map<T> {
    const root = this.root.delete(hash(key), key, this.owner) as BitmapIndexedNode<T>
    if (this.owner) {
      this.root = root
      this.size = root.size
      return this
    }

    return makeMap<T>(root)
  }

  update(key: KVKey, updater: Updater<T>): Iterable<T> {
    const value = this.get(key) as T
    return this.set(key, updater(value))
  }

  map<G>(transform: Transform<T, G>): Map<G> {
    const root = this.root.map<G>(transform, this.owner) as BitmapIndexedNode<G>
    if (this.owner) {
      const res = (this as Map<any>)
      res.root = root
      return (res as Map<G>)
    }

    return makeMap<G>(root)
  }

  clear(): Map<T> {
    return emptyMap<T>()
  }

  asMutable(): Map<T> {
    if (this.owner) {
      return this
    }

    const res = makeMap<T>(this.root, true)
    res.owner = {}
    return res
  }

  asImmutable(): Map<T> {
    if (!this.size) {
      return emptyMap<T>()
    }

    this.owner = undefined
    return this
  }

  withMutations(closure: (x: Map<T>) => void) {
    let mutable = this.asMutable()
    closure(mutable)
    return mutable.asImmutable()
  }

  __iterate(step: Predicate<T>, reverse?: boolean) {
    if (reverse) {
      return this.root.iterateReverse(step)
    }

    return this.root.iterate(step)
  }

  values(): ValueIterator<T> {
    return new ValueIterator<T>(this.root)
  }

  keys(): KeyIterator<T> {
    return new KeyIterator<T>(this.root)
  }

  entries(): EntryIterator<T> {
    return new EntryIterator<T>(this.root)
  }

  [IteratorSymbol](): EntryIterator<T> {
    return this.entries()
  }
}
