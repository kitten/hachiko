import { KVKey, Predicate, Transform, Updater, Option } from './constants'
import hash from './util/hash'
import BitmapIndexedNode from './kvHamt/BitmapIndexedNode'
import Iterable from './Iterable'

let EMPTY_MAP: Map<any>
function emptyMap<T>(): Map<T> {
  if (!EMPTY_MAP) {
    EMPTY_MAP = Object.create(Map.prototype)
    EMPTY_MAP.root = new BitmapIndexedNode(0, 0, 0, [])
    EMPTY_MAP.size = 0
  }

  return EMPTY_MAP as Map<T>
}

function makeMap<T>(root: BitmapIndexedNode<T>, forceCreation?: boolean): Map<T> {
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

  constructor() {
    super()
    return emptyMap<T>()
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

  __iterate(step: Predicate<T>) {
    return this.root.iterate(step)
  }
}
