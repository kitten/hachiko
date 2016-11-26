import { Node, KVKey } from './common'
import ValueNode from './ValueNode'

import {
  maskHash,
  combineBitmaps,
  setBitOnBitmap,
  indexBitOnBitmap
} from '../util/bitmap'

export default class BitmapIndexedNode<T> {
  level: number
  bitmap: number
  content: Node<T>[]

  constructor(level: number, bitmap: number, content: Node<T>[]) {
    this.level = level
    this.bitmap = bitmap
    this.content = content
  }

  get(hashCode: number, key: KVKey, notSetVal?: T): T {
    const positionBitmap = maskHash(hashCode, this.level)
    const hasContent = combineBitmaps(this.bitmap, positionBitmap)

    if (!hasContent) {
      return notSetVal
    }

    const node = this.content[indexBitOnBitmap(this.bitmap, positionBitmap)]
    return node.get(hashCode, key, notSetVal)
  }

  set(hashCode: number, key: KVKey, value: T): Node<T> {
    const positionBitmap = maskHash(hashCode, this.level)

    const hasContent = combineBitmaps(this.bitmap, positionBitmap)
    const contentIndex = indexBitOnBitmap(this.bitmap, positionBitmap)

    // New attributes
    const content = this.content.slice()
    let bitmap: number

    if (!hasContent) {
      // Bitmap needs to be updated
      bitmap = setBitOnBitmap(this.bitmap, positionBitmap)

      const node = new ValueNode(
        this.level + 1,
        hashCode,
        key,
        value
      )

      // Insert new node inbetween other data
      content.splice(contentIndex + 1, 0, node)
    } else {
      bitmap = this.bitmap

      const node = this
        .content[contentIndex]
        .set(hashCode, key, value)

      // Update node at index
      content[contentIndex] = node
    }

    return new BitmapIndexedNode<T>(
      this.level,
      bitmap,
      content
    )
  }
}
