import { Node, KVKey } from './common'
import ValueNode from './ValueNode'

import {
  maskHash,
  indexBitOnBitmap
} from '../util/bitmap'

export default class BitmapIndexedNode<T> {
  level: number // NOTE: This should be the parent's level plus one
  size: number
  bitmap: number
  content: Node<T>[]

  constructor(level: number, size: number, bitmap: number, content: Node<T>[]) {
    this.level = level
    this.size = size
    this.bitmap = bitmap
    this.content = content
  }

  get(hashCode: number, key: KVKey, notSetVal?: T): T {
    const positionBitmap = maskHash(hashCode, this.level)
    const hasContent = this.bitmap & positionBitmap

    if (!hasContent) {
      return notSetVal
    }

    const node = this.content[indexBitOnBitmap(this.bitmap, positionBitmap)]

    return node.get(hashCode, key, notSetVal)
  }

  set(hashCode: number, key: KVKey, value: T): BitmapIndexedNode<T> {
    const positionBitmap = maskHash(hashCode, this.level)

    const hasContent = this.bitmap & positionBitmap
    const contentIndex = indexBitOnBitmap(this.bitmap, positionBitmap)

    // New attributes
    const content = this.content.slice()
    let bitmap: number
    let sizeDiff: number

    if (!hasContent) {
      // Bitmap needs to be updated
      bitmap = this.bitmap | positionBitmap
      sizeDiff = 1

      const node = new ValueNode(
        this.level,
        hashCode,
        key,
        value
      )

      // Insert new node inbetween other data
      content.splice(contentIndex + 1, 0, node)
    } else {
      bitmap = this.bitmap

      const oldNode = this.content[contentIndex]
      const node = oldNode.set(hashCode, key, value)
      sizeDiff = node.size - oldNode.size

      // Update node at index
      content[contentIndex] = node
    }

    return new BitmapIndexedNode<T>(
      this.level,
      this.size + sizeDiff,
      bitmap,
      content
    )
  }
}
