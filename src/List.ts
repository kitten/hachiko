import { Transform, Option } from './constants'
import ArrayNode from './persistentVector/ArrayNode'
import push from './listHelpers/push'
import pop from './listHelpers/pop'
import set from './listHelpers/set'
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

  get(key: number, notSetVal?: T): Option<T> {
    const { size, root, tail } = this

    if (key < 0 || key >= size) {
      return notSetVal
    } else if (key >= (root ? root.size : 0)) {
      return tail.get(key, notSetVal)
    }

    return (root as ArrayNode<T>).get(key, notSetVal)
  }

  set(key: number, value: T): List<T> {
    return set<T>(this, key, value)
  }

  push(value: T): List<T> {
    return push<T>(this, value)
  }

  pop(): List<T> {
    return pop<T>(this)
  }

  map<G>(
    transform: Transform<number, Option<T>, Option<G>>
  ): List<G> {
    let rootSize: number
    let root: Option<ArrayNode<G>>

    if (this.root) {
      root = this.root.map<G>(0, transform, this.owner) as ArrayNode<G>
      rootSize = this.root.size
    } else {
      root = undefined
      rootSize = 0
    }

    const tail = this.tail.map<G>(rootSize, transform, this.owner) as LeafNode<G>

    if (this.owner) {
      const res = (this as List<any>)
      res.root = root
      res.tail = tail
      return (res as List<G>)
    }

    return makeList<G>(tail, root)
  }

  clear(): List<T> {
    return emptyList<T>()
  }

  asMutable(): List<T> {
    if (this.owner) {
      return this
    }

    const res = makeList<T>(this.tail, this.root, true)
    res.owner = {}
    return res
  }

  asImmutable(): List<T> {
    if (!this.size) {
      return emptyList<T>()
    }

    this.owner = undefined
    return this
  }

  withMutations(closure: (x: List<T>) => void) {
    let mutable = this.asMutable()
    closure(mutable)
    return mutable.asImmutable()
  }
}
