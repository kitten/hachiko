import { Bitmap } from '../bitmap'
import { KVKey } from './constants'
import { get, set } from './helpers'
import hash from '../util/hash'

class KVNode<T> {
  public level: number
  public content: (KVKey | T | KVNode<T>)[]
  public dataMap: Bitmap
  public nodeMap: Bitmap

  public constructor(
    content?: (KVKey | T | KVNode<T>)[],
    dataMap?: number,
    nodeMap?: number,
    level?: number
  ) {
    this.content = content || []
    this.dataMap = dataMap || 0
    this.nodeMap = nodeMap || 0
    this.level = level || 0

    return this
  }

  public get(key: KVKey): T {
    return get<T>(this, hash(key), key)
  }

  public set(key: KVKey, value: T): KVNode<T> {
    return set<T>(this, hash(key), key, value)
  }
}

export default KVNode

