import Node from './Node'
import { Transform, Option, BUCKET_SIZE } from '../constants'
import { replaceValue, copyArray, push, pop } from '../util/array'
import { maskHash } from '../util/bitmap'
import LeafNode from './LeafNode'

export default class ArrayNode<T> {
  level: number // NOTE: This can only be >= 1
  content: Node<T>[]
  size: number
  owner?: Object

  constructor(
    level: number,
    content: Node<T>[],
    size: number,
    owner?: Object
  ) {
    this.level = level
    this.content = content
    this.size = size
    this.owner = owner
  }

  get(key: number, notSetVal?: T): Option<T> {
    const index = maskHash(key, this.level)
    const subNode = this.content[index]
    if (!subNode) {
      return notSetVal
    }

    return subNode.get(key, notSetVal)
  }

  set(key: number, value: T, owner?: Object): ArrayNode<T> {
    const index = maskHash(key, this.level)
    if (index >= this.content.length) {
      return this
    }

    const oldSubNode = this.content[index]
    const subNode = oldSubNode.set(key, value, owner)

    if (oldSubNode === subNode) {
      return this
    }

    if (owner && owner === this.owner) {
      this.content[index] = subNode
      return this
    }

    const content = replaceValue(this.content, index, subNode)

    return new ArrayNode<T>(
      this.level,
      content,
      this.size,
      owner
    )
  }

  map<G>(
    transform: Transform<number, Option<T>, Option<G>>,
    owner?: Object
  ): Node<G> {
    const length = this.content.length
    const content: Node<G>[] = new Array(length)
    for (let i = 0; i < length; i++) {
      const node = this.content[i]
      content[i] = node.map<G>(transform, owner)
    }

    if (owner && owner === this.owner) {
      const res = (this as ArrayNode<any>)
      res.content = content
      return (res as ArrayNode<G>)
    }

    return new ArrayNode(
      this.level,
      content,
      this.size,
      owner
    )
  }

  pushLeafNode(node: LeafNode<T>, owner?: Object): ArrayNode<T> {
    let content: Node<T>[]
    let size: number

    if (this.level === 1) {
      content = push(this.content, node)
      size = this.size + BUCKET_SIZE // NOTE: Since node.size should always be BUCKET_SIZE here
    } else {
      const index = maskHash(this.size, this.level)

      const oldSubNode = (
        this.content[index] ||
        new ArrayNode<T>(this.level - 1, [], 0, owner)
      ) as ArrayNode<T>

      const subNode = oldSubNode.pushLeafNode(node, owner)

      content = copyArray(this.content)
      content[index] = subNode
      size = this.size - oldSubNode.size + subNode.size
    }

    if (owner && owner === this.owner) {
      this.content = content
      this.size = size
      return this
    }

    return new ArrayNode<T>(
      this.level,
      content,
      size,
      owner
    )
  }

  popLeafNode(owner?: Object): Option<ArrayNode<T>> {
    const contentLength = this.content.length

    let content: Node<T>[]
    let size: number

    if (this.level === 1) {
      if (contentLength === 1) {
        return undefined
      }

      content = pop(this.content)
      size = this.size - BUCKET_SIZE
    } else {
      const index = contentLength - 1
      const oldSubNode = this.content[index] as ArrayNode<T>
      const subNode = oldSubNode.popLeafNode(owner)

      if (!subNode && contentLength === 1) {
        return undefined
      } else if (!subNode) {
        content = pop(this.content)
        size = this.size - oldSubNode.size
      } else {
        content = replaceValue(this.content, index, subNode)
        size = this.size - oldSubNode.size + subNode.size
      }
    }

    if (owner && owner === this.owner) {
      this.content = content
      this.size = size
      return this
    }

    return new ArrayNode<T>(
      this.level,
      content,
      size,
      owner
    )
  }

  lastLeafNode(): LeafNode<T> {
    const subNode = this.content[this.content.length - 1]
    if (this.level === 1) {
      return subNode as LeafNode<T>
    }

    return (subNode as ArrayNode<T>).lastLeafNode()
  }
}
