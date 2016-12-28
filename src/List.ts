import ArrayNode from './persistentVector/ArrayNode'
import push from './listHelpers/push'
import LeafNode, { emptyNode } from './persistentVector/LeafNode'

let EMPTY_LIST: List<any>
export function emptyList<T>(): List<T> {
  if (!EMPTY_LIST) {
    EMPTY_LIST = Object.create(List.prototype)
    EMPTY_LIST.tail = emptyNode<T>()
    EMPTY_LIST.size = 0
  }

  return EMPTY_LIST as List<T>
}

export function makeList<T>(
  tail: LeafNode<T>,
  root?: ArrayNode<T>,
  forceCreation = false
): List<T> {
  if (
    !forceCreation &&
    (!root && !tail.size)
  ) {
    return emptyList<T>()
  }

  const res = Object.create(List.prototype)
  res.tail = tail
  res.root = root
  res.size = tail.size + (root ? root.size : 0)
  return res
}

export default class List<T> {
  tail: LeafNode<T>
  size: number
  root?: ArrayNode<T>
  owner?: Object

  constructor() {
    return emptyList<T>()
  }

  static isList(object: any) {
    return object && object instanceof List
  }

  push(value: T): List<T> {
    return push<T>(this, value)
  }
}
