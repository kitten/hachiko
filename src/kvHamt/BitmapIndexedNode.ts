import Node from './Node'
import { KVKey, Predicate } from '../constants'
import { spliceIn, replaceValue, spliceOut } from '../util/array'
import { maskHash, indexBitOnBitmap } from '../util/bitmap'
import ValueNode from './ValueNode'

export default class BitmapIndexedNode<T> {
  level: number // NOTE: This should be the parent's level plus one
  size: number
  bitmap: number
  content: Node<T>[]
  owner?: Object

  constructor(
    level: number,
    size: number,
    bitmap: number,
    content: Node<T>[],
    owner?: Object
  ) {
    this.level = level
    this.size = size
    this.bitmap = bitmap
    this.content = content
    this.owner = owner
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

  set(hashCode: number, key: KVKey, value: T, owner?: Object): BitmapIndexedNode<T> {
    const positionBitmap = maskHash(hashCode, this.level)
    const hasContent = this.bitmap & positionBitmap

    if (!hasContent) {
      const node = new ValueNode(
        this.level,
        hashCode,
        key,
        value,
        owner
      )

      const bitmap = this.bitmap | positionBitmap
      const contentIndex = indexBitOnBitmap(bitmap, positionBitmap)
      const content = spliceIn<Node<T>>(this.content, contentIndex, node)
      const size = this.size + 1

      if (owner && owner === this.owner) {
        this.size = size
        this.bitmap = bitmap
        this.content = content
        return this
      }

      return new BitmapIndexedNode<T>(
        this.level,
        size,
        bitmap,
        content,
        owner
      )
    }

    const contentIndex = indexBitOnBitmap(this.bitmap, positionBitmap)
    const oldNode = this.content[contentIndex]
    const node = oldNode.set(hashCode, key, value, owner)
    const size = this.size + node.size - oldNode.size

    if (owner && owner === this.owner) {
      this.size = size
      this.content[contentIndex] = node
      return this
    }

    const content = replaceValue(this.content, contentIndex, node)

    return new BitmapIndexedNode<T>(
      this.level,
      size,
      this.bitmap,
      content,
      owner
    )
  }

  delete(hashCode: number, key: KVKey, owner?: Object): Node<T> {
    const positionBitmap = maskHash(hashCode, this.level)
    const hasContent = this.bitmap & positionBitmap

    if (!hasContent) {
      return this
    }

    const contentIndex = indexBitOnBitmap(this.bitmap, positionBitmap)
    const oldNode = this.content[contentIndex]

    const node: Node<T> = oldNode.delete(hashCode, key, owner)
    if (node === oldNode) {
      return this
    }

    let size: number
    let content: Node<T>[]
    const contentLength = this.content.length

    if (!node) {
      if (contentLength === 1) {
        return undefined
      } else if (contentLength === 2) {
        const otherNode = this.content[1 - contentIndex]
        if (otherNode.constructor !== BitmapIndexedNode) {
          return otherNode
        }
      }

      size = this.size - oldNode.size
      content = spliceOut<Node<T>>(this.content, contentIndex)
    } else {
      size = this.size + node.size - oldNode.size
      content = replaceValue<Node<T>>(this.content, contentIndex, node)
    }

    const bitmap = this.bitmap ^ positionBitmap

    if (owner && owner === this.owner) {
      this.size = size
      this.bitmap = bitmap
      this.content = content
      return this
    }

    return new BitmapIndexedNode<T>(
      this.level,
      size,
      bitmap,
      content,
      owner
    )
  }

  iterate(step: Predicate<T>) {
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
