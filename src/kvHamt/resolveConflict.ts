import { Node } from './common'
import BitmapIndexedNode from './BitmapIndexedNode'
import { maskHash } from '../util/bitmap'

// Branches into two sub-nodes (aNode, bNode) at aNode
export default function resolveConflict<T>(
  level: number,
  aHashCode: number,
  aNode: Node<T>,
  bHashCode: number,
  bNode: Node<T>
): Node<T> {
  const nextLevel = level + 1
  const aPositionBitmap = maskHash(aHashCode, level)
  const bPositionBitmap = maskHash(bHashCode, level)

  if (aPositionBitmap !== bPositionBitmap) {
    aNode.level = nextLevel
    bNode.level = nextLevel

    const aSubPositionBitmap = maskHash(aHashCode, nextLevel)
    const bSubPositionBitmap = maskHash(bHashCode, nextLevel)
    const content: Node<T>[] = []

    if (aSubPositionBitmap < bSubPositionBitmap) {
      content[0] = aNode
      content[1] = bNode
    } else {
      content[0] = bNode
      content[1] = aNode
    }

    return new BitmapIndexedNode<T>(
      level,
      2,
      aSubPositionBitmap | bSubPositionBitmap,
      content
    )
  }

  // Resolve deep conflict

  const subNode = resolveConflict<T>(
    nextLevel,
    aHashCode,
    aNode,
    bHashCode,
    bNode
  )

  return new BitmapIndexedNode<T>(
    level,
    1,
    aPositionBitmap,
    [ subNode ]
  )
}
