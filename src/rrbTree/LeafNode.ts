import { Option } from '../constants'
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
}
