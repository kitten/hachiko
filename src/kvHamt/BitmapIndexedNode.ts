import { Node, KVKey } from './common'
import { spliceIn, replaceValue } from '../util/array'
import { maskHash, indexBitOnBitmap } from '../util/bitmap'
import ValueNode from './ValueNode'

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

    if (!hasContent) {
      const node = new ValueNode(
        this.level,
        hashCode,
        key,
        value
      )

      const bitmap = this.bitmap | positionBitmap
      const contentIndex = indexBitOnBitmap(bitmap, positionBitmap)
      const content = spliceIn<Node<T>>(this.content, contentIndex, node)

      return new BitmapIndexedNode<T>(
        this.level,
        this.size + 1,
        bitmap,
        content
      )
    }

    const contentIndex = indexBitOnBitmap(this.bitmap, positionBitmap)

    const oldNode = this.content[contentIndex]
    const node = oldNode.set(hashCode, key, value)

    const size = this.size + node.size - oldNode.size
    const content = replaceValue(this.content, contentIndex, node)

    return new BitmapIndexedNode<T>(
      this.level,
      size,
      this.bitmap,
      content
    )
  }
}
