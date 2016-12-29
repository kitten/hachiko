import Node from './Node'
import { Option } from '../constants'
import { copyArray } from '../util/array'
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

  setLeafNode(key: number, node: LeafNode<T>, owner?: Object): ArrayNode<T> {
    const index = maskHash(key, this.level)

    const content: Node<T>[] = copyArray(this.content)
    let size: number

    if (this.level === 1) {
      content[index] = node
      size = this.size + node.size
    } else {
      const oldSubNode = (
        this.content[index] ||
        new ArrayNode<T>(this.level - 1, [], 0, owner)
      ) as ArrayNode<T>

      const subNode = oldSubNode.setLeafNode(key, node)

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

  getLeafNode(key: number): Option<LeafNode<T>> {
    const index = maskHash(key, this.level)
    const subNode = this.content[index]

    if (!subNode) {
      return undefined
    } else if (this.level === 0) {
      return subNode as LeafNode<T>
    }

    return (subNode as ArrayNode<T>).getLeafNode(key)
  }
}
