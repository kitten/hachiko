import { KVKey } from './kvHamt/common'
import hash from './util/hash'
import BitmapIndexedNode from './kvHamt/BitmapIndexedNode'

let EMPTY_MAP: Map<any>
function makeMap<T>(root?: BitmapIndexedNode<T>): Map<T> {
  if (!root || !root.size) {
    if (!EMPTY_MAP) {
      EMPTY_MAP = Object.create(Map.prototype)
      EMPTY_MAP.root = new BitmapIndexedNode(0, 0, 0, [])
      EMPTY_MAP.size = 0
    }

    return EMPTY_MAP as Map<T>
  }

  const res = Object.create(Map.prototype)
  res.root = root
  res.size = root.size
  return res
}

export default class Map<T> {
  root?: BitmapIndexedNode<T>
  size: number

  constructor() {
    return makeMap<T>()
  }

  get(key: KVKey, notSetVal?: T): T {
    return this.root.get(hash(key), key, notSetVal)
  }

  set(key: KVKey, value: T): Map<T> {
    return makeMap<T>(this.root.set(hash(key), key, value))
  }

  delete(key: KVKey): Map<T> {
    const node = this.root.delete(hash(key), key) as BitmapIndexedNode<T>
    return makeMap<T>(node)
  }

  clear(): Map<T> {
    return makeMap<T>()
  }
}
