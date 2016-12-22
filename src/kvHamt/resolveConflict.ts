import Node from './Node'
import BitmapIndexedNode from './BitmapIndexedNode'
import { maskHash, indexBitOnBitmap } from '../util/bitmap'

// Branches into two sub-nodes (aNode, bNode) at aNode
export default function resolveConflict<K, T>(
  level: number,
  aHashCode: number,
  aNode: Node<K, T>,
  bHashCode: number,
  bNode: Node<K, T>,
  owner?: Object
): Node<K, T> {
  const nextLevel = level + 1
  const aPositionBitmap = 1 << maskHash(aHashCode, level)
  const bPositionBitmap = 1 << maskHash(bHashCode, level)

  if (aPositionBitmap === bPositionBitmap) {
    // Resolve deep conflict

    const subNode = resolveConflict<K, T>(
      nextLevel,
      aHashCode,
      aNode,
      bHashCode,
      bNode,
      owner
    )

    return new BitmapIndexedNode<K, T>(
      level,
      subNode.size,
      aPositionBitmap,
      [ subNode ],
      owner
    )
  }

  aNode.level = nextLevel
  bNode.level = nextLevel

  const bitmap = aPositionBitmap | bPositionBitmap

  const content: Node<K, T>[] = new Array(2)
  const aIndex = indexBitOnBitmap(bitmap, aPositionBitmap)
  const bIndex = 1 - aIndex

  content[aIndex] = aNode
  content[bIndex] = bNode

  return new BitmapIndexedNode<K, T>(
    level,
    aNode.size + bNode.size,
    bitmap,
    content,
    owner
  )
}
