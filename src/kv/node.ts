import {
  maskHash,
  getBitOnBitmap,
  setBitOnBitmap,
  unsetBitOnBitmap,
  indexBitOnBitmap,
  toBitmap,
  Bitmap
} from '../util/bitmap'

import hash from '../util/hash'
import { WIDTH, KVKey } from './constants'

class KVNode<T> {
  public level: number
  public content: (KVKey | T | KVNode<T>)[]
  public dataMap: Bitmap
  public nodeMap: Bitmap
  public size: number

  public constructor(
    content?: (KVKey | T | KVNode<T>)[],
    dataMap?: number,
    nodeMap?: number,
    level?: number,
    size?: number
  ) {
    this.content = content || []
    this.dataMap = dataMap || 0
    this.nodeMap = nodeMap || 0
    this.level = level || 0
    this.size = size || 0
    return this
  }

  public get(hash: number, key: KVKey): T {
    const { content, dataMap, nodeMap, level } = this

    const bitPosition = maskHash(hash, level)

    const dataBit = getBitOnBitmap(dataMap, bitPosition)
    if (dataBit) {
      // prefix lives on this node

      const index = WIDTH * indexBitOnBitmap(dataMap, bitPosition)
      const _key = content[index] as KVKey

      if (_key === key) {
        // HIT: key was found and value can be returned
        return content[index + 1] as T
      }

      // MISS: keys don't match up
      return undefined
    }

    const nodeBit = getBitOnBitmap(nodeMap, bitPosition)
    if (nodeBit) {
      // prefix lives on a sub-node
      const index = content.length - 1 - WIDTH * indexBitOnBitmap(nodeMap, bitPosition)
      const subNode = content[index] as KVNode<T>

      return subNode.get(hash, key)
    }

    // MISS: prefix is unknown on subtree
    return undefined
  }

  public set(hash: number, key: KVKey, value: T): KVNode<T> {
    const { content, dataMap, nodeMap, level } = this

    const bitPosition = maskHash(hash, level)

    // Search for node with prefix
    const nodeBit = getBitOnBitmap(nodeMap, bitPosition)
    if (nodeBit) {
      // Set (key, value) on sub-node
      const index = content.length - 1 - WIDTH * indexBitOnBitmap(nodeMap, bitPosition)
      const subNode = content[index] as KVNode<T>

      const _content = content.slice()
      const _subNode = subNode.set(hash, key, value)
      _content[index] = _subNode

      const diffSize = _subNode.size - subNode.size

      return new KVNode<T>(
        _content,
        this.dataMap,
        this.nodeMap,
        this.level,
        this.size + diffSize
      )
    }

    // Search for data with prefix
    const dataBit = getBitOnBitmap(dataMap, bitPosition)
    if (dataBit) {
      const index = WIDTH * indexBitOnBitmap(dataMap, bitPosition)
      const _key = content[index] as KVKey

      if (_key === key) {
        // Overwrite value on this node
        const _content = content.slice()
        _content[index + 1] = value

        return new KVNode<T>(
          _content,
          this.dataMap,
          this.nodeMap,
          this.level,
          this.size
        )
      }

      const _value = content[index + 1] as T

      // Create subnode from collision (_key, _value) and set (key, value) on it
      // Thus following collisions will be resolved recursively
      const subNode = this.createSubNode(_key, _value)
        .set(hash, key, value)

      // Add new subnode to the current node
      return this.addNodeEntry(bitPosition, subNode)
    }

    return this.addDataEntry(bitPosition, key, value)
  }

  private addDataEntry(position: number, key: KVKey, value: T): KVNode<T> {
    const dataMap = setBitOnBitmap(this.dataMap, position)
    const index = WIDTH * indexBitOnBitmap(dataMap, position)

    const content = this.content.slice()
    content.splice(index, 0, key, value)

    return new KVNode<T>(
      content,
      dataMap,
      this.nodeMap,
      this.level,
      this.size + 1
    )
  }

  private createSubNode(key: KVKey, value: T): KVNode<T> {
    const level = this.level + 1
    const mask = maskHash(hash(key), level)
    const dataMap = toBitmap(mask)
    const nodeMap = 0
    const content = [ key, value ]
    const size = 1

    return new KVNode<T>(
      content,
      dataMap,
      nodeMap,
      level,
      size
    )
  }

  private addNodeEntry(position: number, subNode: KVNode<T>) {
    const nodeMap = setBitOnBitmap(this.nodeMap, position)
    const dataIndex = WIDTH * indexBitOnBitmap(this.dataMap, position)
    const dataMap = unsetBitOnBitmap(this.dataMap, position)

    // NOTE: Not using fpSplice for micro optimisation
    const content = this.content.slice()
    content.splice(dataIndex, 2)

    const nodeIndex = content.length - indexBitOnBitmap(nodeMap, position)
    content.splice(nodeIndex, 0, subNode)

    return new KVNode<T>(
      content,
      dataMap,
      nodeMap,
      this.level,
      this.size - 1 + subNode.size
    )
  }
}

export default KVNode

