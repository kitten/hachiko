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
import CollisionNode from './collision-node'
import { KVTuple, KVKey } from './constants'
import { OVERFLOW_LEVEL } from '../constants'

export const get = <T>(node: KVNode<T>, hashCode: number, key: KVKey): T => {
  const positionBitmap: Bitmap = maskHash(hashCode, node.level)

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
    const subNode = subnodes[index]
    if (subNode instanceof CollisionNode) {
      return subNode.get(key)
    }

    return get(subNode as KVNode<T>, hashCode, key)
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
  hashCode: number,
  key: KVKey,
  value: T
): KVNode<T> => {
  const dataMap = maskHash(hashCode, level)
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
  subNode: (KVNode<T> | CollisionNode<T>)
): KVNode<T> => {
  const nodeMap = setBitOnBitmap(node.nodeMap, positionBitmap)
  const dataIndex = indexBitOnBitmap(node.dataMap, positionBitmap)
  const dataMap = unsetBitOnBitmap(node.dataMap, positionBitmap)

  const content = node.content.slice()
  content.splice(dataIndex, 1)

  const nodeIndex = indexBitOnBitmap(nodeMap, positionBitmap)
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

export const set = <T>(node: KVNode<T>, hashCode: number, key: KVKey, value: T): KVNode<T> => {
  const positionBitmap: Bitmap = maskHash(hashCode, node.level)

  const { subnodes, nodeMap } = node
  const nodeBit = getBitOnBitmap(nodeMap, positionBitmap)

  // Search for node with prefix
  if (nodeBit) {
    // Set (key, value) on sub-node
    const index = indexBitOnBitmap(nodeMap, positionBitmap)
    const subNode = subnodes[index]

    let _subNode: KVNode<T> | CollisionNode<T>
    if (subNode instanceof CollisionNode) {
      _subNode = subNode.set(key, value)
    } else {
      _subNode = set(subNode, hashCode, key, value)
    }

    const _subnodes = subnodes.slice()
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
    const nextLevel = node.level + 1

    // Create subnode from collision (_key, _value) and set (key, value) on it
    // Thus following collisions will be resolved recursively

    let subNode: KVNode<T> | CollisionNode<T>
    if (nextLevel === OVERFLOW_LEVEL) {
      // We overflowed the 32-bit hash, so we need to create a CollisionNode
      subNode = new CollisionNode<T>(hashCode, [tuple, [key, value]])
    } else {
      const _hashCode = hash(_key)
      subNode = set(
        createSubNode(nextLevel, _hashCode, _key, _value),
        hashCode,
        key,
        value
      )
    }

    // Add new subnode to the current node
    return addNodeEntry(node, positionBitmap, subNode)
  }

  return addDataEntry(node, positionBitmap, key, value)
}
