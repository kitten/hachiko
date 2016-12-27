import Node from './Node'
import { Option, BUCKET_SIZE } from '../constants'
import { replaceValue } from '../util/array'
import { maskHash } from '../util/bitmap'
import ValueNode from './ValueNode'

let EMPTY_NODE: ArrayNode<any>
export function emptyNode<T>(): ArrayNode<T> {
  if (!EMPTY_NODE) {
    EMPTY_NODE = new ArrayNode<any>(new Array(BUCKET_SIZE))
  }

  return EMPTY_NODE as ArrayNode<T>
}

export default class ArrayNode<T> {
  content: Node<T>[]
  size: number
  owner?: Object

  constructor(
    content: Node<T>[],
    size: number,
    owner?: Object
  ) {
    this.content = content
    this.size = size
    this.owner = owner
  }

  get(level: number, key: number, notSetVal?: T): Option<T> {
    const index = maskHash(key, level)
    const subNode = this.content[index]
    if (!subNode) {
      return notSetVal
    }

    return subNode.get(level - 1, key, notSetVal)
  }

  set(level: number, key: number, value: T, owner?: Object): ArrayNode<T> {
    const index = maskHash(key, level)
    const oldNode = this.content[index]

    let node: Node<T>
    let size = this.size

    if (!oldNode && level === 0) {
      node = new ValueNode<T>(value, owner)
      size = size + 1
    } else if (!oldNode) {
      node = emptyNode<T>().set(level - 1, key, value, owner)
      size = size + node.size
    } else {
      node = oldNode.set(level - 1, key, value, owner)
      size = size - oldNode.size + node.size
    }

    if (owner && owner === this.owner) {
      this.size = size
      this.content[index] = node
      return this
    }

    const content = replaceValue(this.content, index, node)

    return new ArrayNode<T>(
      content,
      size,
      owner
    )
  }
}
