import {
  maskHash,
  toBitmap,
  getBitOnBitmap,
  setBitOnBitmap,
  unsetBitOnBitmap,
  indexBitOnBitmap
} from '../bitmap'

import fpSplice from '../util/fpSplice'
import hash from '../util/hash'
import KVNode from './node'
import { WIDTH, KVKey } from './constants'

function modify<T>(
  node: KVNode<T>,
  content?: (KVKey | T | KVNode<T>)[],
  dataMap?: number,
  nodeMap?: number,
  level?: number
): KVNode<T> {
  return new KVNode<T>(
    content || node.content,
    typeof dataMap === 'number' ? dataMap : node.dataMap,
    typeof nodeMap === 'number' ? nodeMap : node.nodeMap,
    typeof level === 'number' ? level : node.level
  )
}

function addDataEntry<T>(node: KVNode<T>, position: number, key: KVKey, value: T): KVNode<T> {
  const dataMap = setBitOnBitmap(node.dataMap, position)
  const index = WIDTH * indexBitOnBitmap(dataMap, position)
  const content = fpSplice(node.content, index, 0, key, value)

  return modify<T>(
    node,
    content,
    dataMap
  )
}

function createSubNode<T>(node: KVNode<T>, key: KVKey, value: T) {
  const level = node.level + 1
  const mask = maskHash(hash(key), level)
  const dataMap = toBitmap(mask)

  return new KVNode<T>([ key, value ], dataMap, 0, level)
}

function addNodeEntry<T>(node: KVNode<T>, position: number, subNode: KVNode<T>) {
  const nodeMap = setBitOnBitmap(node.nodeMap, position)
  const dataIndex = WIDTH * indexBitOnBitmap(node.dataMap, position)
  const dataMap = unsetBitOnBitmap(node.dataMap, position)
  const nodeIndex = indexBitOnBitmap(nodeMap, position)

  // NOTE: Not using fpSplice for micro optimisation
  const content = node.content.slice()
  content.splice(dataIndex, 2)
  content.splice(content.length - nodeIndex, 0, subNode)

  return modify<T>(node, content, dataMap, nodeMap)
}

export function get<T>(node: KVNode<T>, hash: number, key: KVKey): T {
  const { content, dataMap, nodeMap, level } = node

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
    const index = WIDTH * indexBitOnBitmap(nodeMap, bitPosition)
    const subNode = content[content.length - 1 - index] as KVNode<T>

    return get<T>(subNode, hash, key)
  }

  // MISS: prefix is unknown on subtree
  return undefined
}

export function set<T>(node: KVNode<T>, hash: number, key: KVKey, value: T): KVNode<T> {
  const { content, dataMap, nodeMap, level } = node

  const bitPosition = maskHash(hash, level)

  // Search for node with prefix
  const nodeBit = getBitOnBitmap(nodeMap, bitPosition)
  if (nodeBit) {
    // Set (key, value) on sub-node
    const index = WIDTH * indexBitOnBitmap(nodeMap, bitPosition)
    const subNode = content[content.length - 1 - index] as KVNode<T>

    return set<T>(subNode, hash, key, value)
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
      return modify<T>(node, _content)
    }

    const _value = content[index + 1] as T

    // Create subnode from collision (_key, _value) and set (key, value) on it
    // Thus following collisions will be resolved recursively
    const subNode = set<T>(
      createSubNode<T>(node, _key, _value),
      hash,
      key,
      value
    )

    // Add new subnode to the current node
    return addNodeEntry<T>(node, bitPosition, subNode)
  }

  return addDataEntry<T>(node, bitPosition, key, value)
}

