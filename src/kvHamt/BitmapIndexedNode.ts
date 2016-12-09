import Node from './Node'
import { KVKey, Predicate, Transform, Option } from '../constants'
import { spliceIn, replaceValue, spliceOut } from '../util/array'
import { maskHash, indexBitOnBitmap } from '../util/bitmap'
import ValueNode from './ValueNode'

let EMPTY_NODE: BitmapIndexedNode<any>
export function emptyNode<T>(): BitmapIndexedNode<T> {
  if (!EMPTY_NODE) {
    EMPTY_NODE = new BitmapIndexedNode<any>(0, 0, 0, [])
  }

  return EMPTY_NODE as BitmapIndexedNode<T>
}

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

  get(hashCode: number, key: KVKey, notSetVal?: T): Option<T> {
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
        this.level + 1,
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

  delete(hashCode: number, key: KVKey, owner?: Object): Option<Node<T>> {
    const positionBitmap = maskHash(hashCode, this.level)
    const hasContent = this.bitmap & positionBitmap
    if (!hasContent) {
      return this
    }

    const contentIndex = indexBitOnBitmap(this.bitmap, positionBitmap)
    const oldNode = this.content[contentIndex]

    if (!oldNode) {
      console.log(this.content)
    }

    const node: Option<Node<T>> = oldNode.delete(hashCode, key, owner)
    if (node === oldNode) {
      return this
    }

    let bitmap: number
    let size: number
    let content: Node<T>[]
    const contentLength = this.content.length

    if (!node) {
      const isRoot = this.level === 0
      if (!isRoot && contentLength === 1) {
        return undefined
      } else if (!isRoot && contentLength === 2) {
        const otherNode = this.content[1 - contentIndex]

        if (otherNode.constructor !== BitmapIndexedNode) {
          if (owner && owner === otherNode.owner) {
            otherNode.level = this.level
            return otherNode
          }

          const _otherNode = otherNode.clone()
          _otherNode.level = this.level
          return _otherNode
        }
      }

      bitmap = this.bitmap ^ positionBitmap
      size = this.size - oldNode.size
      content = spliceOut<Node<T>>(this.content, contentIndex)
    } else {
      bitmap = this.bitmap
      size = this.size + node.size - oldNode.size
      content = replaceValue<Node<T>>(this.content, contentIndex, node)
    }

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

  map<G>(transform: Transform<T, G>, owner?: Object): Node<G> {
    const length = this.content.length
    const content: Node<G>[] = new Array(length)
    for (let i = 0; i < length; i++) {
      const node = this.content[i]
      content[i] = node.map<G>(transform, owner)
    }

    if (owner && owner === this.owner) {
      const res = (this as BitmapIndexedNode<any>)
      res.content = content
      return (res as BitmapIndexedNode<G>)
    }

    return new BitmapIndexedNode<G>(
      this.level,
      this.size,
      this.bitmap,
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

  iterateReverse(step: Predicate<T>) {
    for (let i = this.content.length; i >= 0; i--) {
      const node: Node<T> = this.content[i]
      if (node.iterateReverse(step) === true) {
        return true
      }
    }

    return false
  }

  clone(owner?: Object): BitmapIndexedNode<T> {
    return new BitmapIndexedNode<T>(
      this.level,
      this.size,
      this.bitmap,
      this.content,
      owner
    )
  }
}
