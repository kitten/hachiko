import { KVKey, Predicate } from './kvHamt/common'
import hash from './util/hash'
import BitmapIndexedNode from './kvHamt/BitmapIndexedNode'

let EMPTY_MAP: Map<any>
function emptyMap<T>(): Map<T> {
  if (!EMPTY_MAP) {
    EMPTY_MAP = Object.create(Map.prototype)
    EMPTY_MAP.root = new BitmapIndexedNode(0, 0, 0, [])
    EMPTY_MAP.size = 0
  }

  return EMPTY_MAP as Map<T>
}

function makeMap<T>(root?: BitmapIndexedNode<T>, forceCreation?: boolean): Map<T> {
  if (
    !forceCreation &&
    (!root || root.size === 0)
  ) {
    return emptyMap<T>()
  }

  const res = Object.create(Map.prototype)
  res.root = root
  res.size = root.size
  res.owner = root.owner
  return res
}

export default class Map<T> {
  root?: BitmapIndexedNode<T>
  size: number
  owner?: Object

  constructor() {
    return makeMap<T>()
  }

  get(key: KVKey, notSetVal?: T): T {
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

  filter(predicate: Predicate<T>): Map<T> {
    let mutable = this.owner ? this : this.asMutable()

    this.root.iterate((value: T, key: KVKey) => {
      if (!predicate(value, key)) {
        mutable = mutable.delete(key)
      }

      return false
    })

    return this.owner ? mutable : mutable.asImmutable()
  }

  clear(): Map<T> {
    return makeMap<T>()
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
}
