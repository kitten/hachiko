import {
  maskHash,
  getBitOnBitmap,
  setBitOnBitmap,
  unsetBitOnBitmap,
  indexBitOnBitmap,
  toBitmap
} from '../bitmap'

import fpSplice from '../util/fpSplice'
import hash from '../util/hash'
import { Bitmap } from '../bitmap'
import { WIDTH, KVKey } from './constants'

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
      _content[index] = subNode.set(hash, key, value)

      return this.modify(_content)
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
        return this.modify(_content)
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

  private modify(
    content?: (KVKey | T | KVNode<T>)[],
    dataMap?: number,
    nodeMap?: number,
    level?: number
  ): KVNode<T> {
    return new KVNode<T>(
      content || this.content,
      typeof dataMap === 'number' ? dataMap : this.dataMap,
      typeof nodeMap === 'number' ? nodeMap : this.nodeMap,
      typeof level === 'number' ? level : this.level
    )
  }

  private addDataEntry(position: number, key: KVKey, value: T): KVNode<T> {
    const dataMap = setBitOnBitmap(this.dataMap, position)
    const index = WIDTH * indexBitOnBitmap(dataMap, position)
    const content = fpSplice(this.content, index, 0, key, value)

    return this.modify(
      content,
      dataMap
    )
  }

  private createSubNode(key: KVKey, value: T): KVNode<T> {
    const level = this.level + 1
    const mask = maskHash(hash(key), level)
    const dataMap = toBitmap(mask)

    return new KVNode<T>([ key, value ], dataMap, 0, level)
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

    return this.modify(content, dataMap, nodeMap)
  }
}

export default KVNode

