import Node from './Node'
import { Option } from '../constants'
import { maskHash } from '../util/bitmap'

export default class ArrayNode<T> {
  level: number
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
}
