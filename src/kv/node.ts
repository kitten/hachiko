import hash from '../util/hash'
import { Bitmap } from '../util/bitmap'
import { KVTuple, KVKey } from './constants'
import { get, set } from './traversal'

class KVNode<T> {
  public level: number
  public content: KVTuple<T>[]
  public subnodes: KVNode<T>[]
  public dataMap: Bitmap
  public nodeMap: Bitmap
  public size: number

  public constructor(
    content?: KVTuple<T>[],
    subnodes?: KVNode<T>[],
    dataMap?: number,
    nodeMap?: number,
    level?: number,
    size?: number
  ) {
    this.content = content || []
    this.subnodes = subnodes || []
    this.dataMap = dataMap || 0
    this.nodeMap = nodeMap || 0
    this.level = level || 0
    this.size = size || 0
    return this
  }

  public get(key: KVKey): T {
    const hashCode = hash(key)
    return get<T>(this, hashCode, key)
  }

  public set(key: KVKey, value: T): KVNode<T> {
    const hashCode = hash(key)
    return set<T>(this, hashCode, key, value)
  }
}

export default KVNode

