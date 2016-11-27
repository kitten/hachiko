import { Node } from './common'
import BitmapIndexedNode from './BitmapIndexedNode'
import { maskHash, indexBitOnBitmap } from '../util/bitmap'

// Branches into two sub-nodes (aNode, bNode) at aNode
export default function resolveConflict<T>(
  level: number,
  aHashCode: number,
  aNode: Node<T>,
  bHashCode: number,
  bNode: Node<T>
): Node<T> {
  const nextLevel = level + 1
  const aPositionBitmap = maskHash(aHashCode, nextLevel)
  const bPositionBitmap = maskHash(bHashCode, nextLevel)

  if (aPositionBitmap === bPositionBitmap) {
    // Resolve deep conflict

    const subNode = resolveConflict<T>(
      nextLevel,
      aHashCode,
      aNode,
      bHashCode,
      bNode
    )

    return new BitmapIndexedNode<T>(
      nextLevel,
      subNode.size,
      aPositionBitmap,
      [ subNode ]
    )
  }

  aNode.level = nextLevel
  bNode.level = nextLevel

  const bitmap = aPositionBitmap | bPositionBitmap

  const content: Node<T>[] = new Array(2)
  const aIndex = indexBitOnBitmap(bitmap, aPositionBitmap)
  const bIndex = indexBitOnBitmap(bitmap, bPositionBitmap)

  content[aIndex] = aNode
  content[bIndex] = bNode

  return new BitmapIndexedNode<T>(
    nextLevel,
    aNode.size + bNode.size,
    bitmap,
    content
  )
}
