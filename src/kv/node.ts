import {
  maskHash,
  getBitOnBitmap,
  setBitOnBitmap,
  unsetBitOnBitmap,
  indexBitOnBitmap,
  Bitmap
} from '../util/bitmap'

import hash from '../util/hash'
import { WIDTH, KVTuple, KVKey } from './constants'

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
    return this.__get(hashCode, key)
  }

  public __get(hash: number, key: KVKey): T {
    const positionBitmap: Bitmap = 1 << maskHash(hash, this.level)

    const { content, dataMap } = this
    const dataBit = getBitOnBitmap(dataMap, positionBitmap)
    if (dataBit) {
      // prefix lives on this node

      const tuple = content[indexBitOnBitmap(dataMap, positionBitmap)]
      const _key = tuple[0] as KVKey

      if (_key === key) {
        // HIT: key was found and value can be returned
        return tuple[1] as T
      }

      // MISS: keys don't match up
      return undefined
    }

    const { subnodes, nodeMap } = this
    const nodeBit = getBitOnBitmap(nodeMap, positionBitmap)
    if (nodeBit) {
      // prefix lives on a sub-node
      const index = indexBitOnBitmap(nodeMap, positionBitmap)
      const subNode = subnodes[index] as KVNode<T>

      return subNode.__get(hash, key)
    }

    // MISS: prefix is unknown on subtree
    return undefined
  }

  public set(key: KVKey, value: T): KVNode<T> {
    const hashCode = hash(key)
    return this.__set(hashCode, key, value)
  }

  public __set(hash: number, key: KVKey, value: T): KVNode<T> {
    const { content, subnodes, dataMap, nodeMap, level } = this

    const positionBitmap: Bitmap = 1 << maskHash(hash, level)

    // Search for node with prefix
    const nodeBit = getBitOnBitmap(nodeMap, positionBitmap)
    if (nodeBit) {
      // Set (key, value) on sub-node
      const index = indexBitOnBitmap(nodeMap, positionBitmap)
      const subNode = subnodes[index] as KVNode<T>

      const _subnodes = subnodes.slice()
      const _subNode = subNode.__set(hash, key, value)
      _subnodes[index] = _subNode

      const diffSize = _subNode.size - subNode.size

      return new KVNode<T>(
        this.content,
        _subnodes,
        this.dataMap,
        this.nodeMap,
        this.level,
        this.size + diffSize
      )
    }

    // Search for data with prefix
    const dataBit = getBitOnBitmap(dataMap, positionBitmap)
    if (dataBit) {
      const index = indexBitOnBitmap(dataMap, positionBitmap)
      const tuple = content[index]
      const _key = tuple[0] as KVKey

      if (_key === key) {
        // Overwrite value on this node
        const _content = content.slice()
        _content[index] = [key, value]

        return new KVNode<T>(
          _content,
          this.subnodes,
          this.dataMap,
          this.nodeMap,
          this.level,
          this.size
        )
      }

      const _value = tuple[1] as T

      // Create subnode from collision (_key, _value) and set (key, value) on it
      // Thus following collisions will be resolved recursively
      const subNode = this.createSubNode(_key, _value)
        .__set(hash, key, value)

      // Add new subnode to the current node
      return this.addNodeEntry(positionBitmap, subNode)
    }

    return this.addDataEntry(positionBitmap, key, value)
  }

  private addDataEntry(positionBitmap: Bitmap, key: KVKey, value: T): KVNode<T> {
    const dataMap = setBitOnBitmap(this.dataMap, positionBitmap)
    const index = WIDTH * indexBitOnBitmap(dataMap, positionBitmap)

    const content = this.content.slice()
    content.splice(index, 0, [key, value])

    return new KVNode<T>(
      content,
      this.subnodes,
      dataMap,
      this.nodeMap,
      this.level,
      this.size + 1
    )
  }

  private createSubNode(key: KVKey, value: T): KVNode<T> {
    const level = this.level + 1
    const mask = maskHash(hash(key), level)
    const dataMap = 1 << mask
    const nodeMap = 0
    const subnodes: KVNode<T>[] = []
    const size = 1

    const content = [(
      [ key, value ] as KVTuple<T>
    )]

    return new KVNode<T>(
      content,
      subnodes,
      dataMap,
      nodeMap,
      level,
      size
    )
  }

  private addNodeEntry(positionBitmap: Bitmap, subNode: KVNode<T>) {
    const nodeMap = setBitOnBitmap(this.nodeMap, positionBitmap)
    const dataIndex = WIDTH * indexBitOnBitmap(this.dataMap, positionBitmap)
    const dataMap = unsetBitOnBitmap(this.dataMap, positionBitmap)

    const content = this.content.slice()
    content.splice(dataIndex, 1)

    const nodeIndex = content.length - indexBitOnBitmap(nodeMap, positionBitmap)
    const subnodes = this.subnodes.slice()
    subnodes.splice(nodeIndex, 0, subNode)

    return new KVNode<T>(
      content,
      subnodes,
      dataMap,
      nodeMap,
      this.level,
      this.size - 1 + subNode.size
    )
  }
}

export default KVNode

