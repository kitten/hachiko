import { Node, KVKey } from './common'
import ValueNode from './ValueNode'
import BitmapIndexedNode from './BitmapIndexedNode'

import {
  maskHash,
  combineBitmaps
} from '../util/bitmap'

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

    const content: Node<T>[] = []

    if (aPositionBitmap < bPositionBitmap) {
      content[0] = aNode
      content[1] = bNode
    } else {
      content[0] = bNode
      content[1] = aNode
    }

    return new BitmapIndexedNode<T>(
      level,
      combineBitmaps(aPositionBitmap, bPositionBitmap),
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
    aPositionBitmap,
    [ subNode ]
  )
}
