import {
  maskHash,
  getBitOnBitmap,
  setBitOnBitmap,
  unsetBitOnBitmap,
  indexBitOnBitmap,
  Bitmap
} from '../util/bitmap'

import hash from '../util/hash'

import KVNode from './node'
import { KVTuple, KVKey } from './constants'

export const get = <T>(node: KVNode<T>, hash: number, key: KVKey): T => {
  const positionBitmap: Bitmap = 1 << maskHash(hash, node.level)

  const { content, dataMap } = node
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

  const { subnodes, nodeMap } = node
  const nodeBit = getBitOnBitmap(nodeMap, positionBitmap)
  if (nodeBit) {
    // prefix lives on a sub-node
    const index = indexBitOnBitmap(nodeMap, positionBitmap)
    const subNode = subnodes[index] as KVNode<T>

    return get(subNode, hash, key)
  }

  // MISS: prefix is unknown on subtree
  return undefined
}

const addDataEntry = <T>(
  node: KVNode<T>,
  positionBitmap: Bitmap,
  key: KVKey,
  value: T
): KVNode<T> => {
  const dataMap = setBitOnBitmap(node.dataMap, positionBitmap)
  const index = indexBitOnBitmap(dataMap, positionBitmap)

  const content = node.content.slice()
  content.splice(index, 0, [key, value])

  return new KVNode<T>(
    content,
    node.subnodes,
    dataMap,
    node.nodeMap,
    node.level,
    node.size + 1
  )
}

const createSubNode = <T>(
  level: number,
  key: KVKey,
  value: T
): KVNode<T> => {
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

const addNodeEntry = <T>(
  node: KVNode<T>,
  positionBitmap: Bitmap,
  subNode: KVNode<T>
): KVNode<T> => {
  const nodeMap = setBitOnBitmap(node.nodeMap, positionBitmap)
  const dataIndex = indexBitOnBitmap(node.dataMap, positionBitmap)
  const dataMap = unsetBitOnBitmap(node.dataMap, positionBitmap)

  const content = node.content.slice()
  content.splice(dataIndex, 1)

  const nodeIndex = content.length - indexBitOnBitmap(nodeMap, positionBitmap)
  const subnodes = node.subnodes.slice()
  subnodes.splice(nodeIndex, 0, subNode)

  return new KVNode<T>(
    content,
    subnodes,
    dataMap,
    nodeMap,
    node.level,
    node.size - 1 + subNode.size
  )
}

export const set = <T>(node: KVNode<T>, hash: number, key: KVKey, value: T): KVNode<T> => {
  const positionBitmap: Bitmap = 1 << maskHash(hash, node.level)

  const { subnodes, nodeMap } = node
  const nodeBit = getBitOnBitmap(nodeMap, positionBitmap)

  // Search for node with prefix
  if (nodeBit) {
    // Set (key, value) on sub-node
    const index = indexBitOnBitmap(nodeMap, positionBitmap)
    const subNode = subnodes[index] as KVNode<T>

    const _subnodes = subnodes.slice()
    const _subNode = set(subNode, hash, key, value)
    _subnodes[index] = _subNode

    const diffSize = _subNode.size - subNode.size

    return new KVNode<T>(
      node.content,
      _subnodes,
      node.dataMap,
      node.nodeMap,
      node.level,
      node.size + diffSize
    )
  }

  const { content, dataMap } = node
  const dataBit = getBitOnBitmap(dataMap, positionBitmap)

  // Search for data with prefix
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
        node.subnodes,
        node.dataMap,
        node.nodeMap,
        node.level,
        node.size
      )
    }

    const _value = tuple[1] as T

    // Create subnode from collision (_key, _value) and set (key, value) on it
    // Thus following collisions will be resolved recursively
    const subNode = set(
      createSubNode(node.level + 1, _key, _value),
      hash,
      key,
      value
    )

    // Add new subnode to the current node
    return addNodeEntry(node, positionBitmap, subNode)
  }

  return addDataEntry(node, positionBitmap, key, value)
}
