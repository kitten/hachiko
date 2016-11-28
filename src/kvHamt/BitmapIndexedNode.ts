import { Node, KVKey, IteratorStep } from './common'
import { spliceIn, replaceValue, spliceOut } from '../util/array'
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

  delete(hashCode: number, key: KVKey): Node<T> {
    const positionBitmap = maskHash(hashCode, this.level)
    const hasContent = this.bitmap & positionBitmap

    if (!hasContent) {
      return this
    }

    const contentIndex = indexBitOnBitmap(this.bitmap, positionBitmap)
    const oldNode = this.content[contentIndex]

    const node: Node<T> = oldNode.delete(hashCode, key)
    if (node === oldNode) {
      return this
    }

    let size: number
    let content: Node<T>[]

    if (node === undefined) {
      size = this.size - oldNode.size
      content = spliceOut<Node<T>>(this.content, contentIndex)
    } else {
      if (this.content.length === 1) {
        return undefined
      } else if (
        this.content.length === 2 &&
        this.level !== 0 &&
        node.constructor !== BitmapIndexedNode
      ) {
        return node
      }

      size = this.size + node.size - oldNode.size
      content = replaceValue<Node<T>>(this.content, contentIndex, node)
    }

    const bitmap = this.bitmap ^ positionBitmap

    return new BitmapIndexedNode<T>(
      this.level,
      size,
      bitmap,
      content
    )
  }

  iterate(step: IteratorStep<T>) {
    const length = this.content.length
    for (let i = 0; i < length; i++) {
      const node: Node<T> = this.content[i]
      if (node.iterate(step) === true) {
        return true
      }
    }

    return false
  }
}
