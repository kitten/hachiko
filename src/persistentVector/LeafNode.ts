import { Option } from '../constants'
import { spliceIn } from '../util/array'
import { maskHash } from '../util/bitmap'

let EMPY_NODE: LeafNode<any>
export function emptyNode<T>(): LeafNode<T> {
  if (!EMPY_NODE) {
    EMPY_NODE = new LeafNode<any>([])
  }

  return EMPY_NODE as LeafNode<T>
}

export default class LeafNode<T> {
  content: T[]
  size: number
  owner?: Object

  constructor(
    content: T[],
    owner?: Object
  ) {
    this.content = content
    this.size = content.length
    this.owner = owner
  }

  get(key: number, notSetVal?: T): Option<T> {
    const index = maskHash(key, 0)
    if (index >= this.size) {
      return notSetVal
    }

    return this.content[index]
  }

  push(value: T, owner?: Object): LeafNode<T> {
    const content = spliceIn<T>(this.content, this.size, value)
    const size = this.size + 1

    if (owner && owner === this.owner) {
      this.content = content
      this.size = size
      return this
    }

    return new LeafNode<T>(
      content,
      owner
    )
  }
}
