import Node from './Node'
import { Transform, Option } from '../constants'
import { replaceValue, spliceIn, spliceOut } from '../util/array'
import { maskHash } from '../util/bitmap'

let EMPY_NODE: LeafNode<any>
export function emptyNode<T>(): LeafNode<T> {
  if (!EMPY_NODE) {
    EMPY_NODE = new LeafNode<any>([])
  }

  return EMPY_NODE as LeafNode<T>
}

export default class LeafNode<T> {
  content: Option<T>[]
  size: number
  owner?: Object

  constructor(
    content: Option<T>[],
    owner?: Object
  ) {
    this.content = content
    this.size = content.length
    this.owner = owner
  }

  get(key: number, notSetVal?: T): Option<T> {
    const index = maskHash(key, 0) // NOTE: The LeafNode's level can only be 0
    const value = this.content[index]

    return value === undefined ? notSetVal : value
  }

  set(key: number, value: T, owner?: Object): LeafNode<T> {
    const index = maskHash(key, 0) // NOTE: The LeafNode's level can only be 0
    if (index >= this.size) {
      return this
    }

    if (owner && owner === this.owner) {
      this.content[index] = value
      return this
    }

    const content = replaceValue(this.content, index, value)
    return new LeafNode<T>(content, owner)
  }

  map<G>(
    start: number,
    transform: Transform<number, Option<T>, Option<G>>,
    owner?: Object
  ): Node<G> {
    const length = this.content.length
    const content: Option<G>[] = new Array(length)
    for (let i = 0; i < length; i++) {
      const value = this.content[i]
      content[i] = transform(value, start + i)
    }

    if (owner && owner === this.owner) {
      const res = (this as LeafNode<any>)
      res.content = content
      return (res as LeafNode<G>)
    }

    return new LeafNode(content, owner)
  }

  push(value: Option<T>, owner?: Object): LeafNode<T> {
    const content = spliceIn(this.content, this.size, value)

    if (owner && owner === this.owner) {
      this.content = content
      this.size = this.size + 1
      return this
    }

    return new LeafNode<T>(content, owner)
  }

  pop(owner?: Object): LeafNode<T> {
    const content = spliceOut(this.content, this.size - 1)

    if (owner && owner === this.owner) {
      this.content = content
      this.size = this.size - 1
      return this
    }

    return new LeafNode<T>(content, owner)
  }
}
