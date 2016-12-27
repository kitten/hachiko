import { SIZE, Option } from './constants'
import ensureSize from './listHelpers/ensureSize'
import ArrayNode, { emptyNode } from './rrbTree/ArrayNode'

let EMPTY_LIST: List<any>
export function emptyList<T>(): List<T> {
  if (!EMPTY_LIST) {
    EMPTY_LIST = Object.create(List.prototype)
    EMPTY_LIST.root = emptyNode<T>()
    EMPTY_LIST.levels = 1
    EMPTY_LIST.size = 0
  }

  return EMPTY_LIST as List<T>
}

export function makeList<T>(
  root: ArrayNode<T>,
  levels: number,
  size: number,
  forceCreation = false
): List<T> {
  if (
    !forceCreation &&
    !size
  ) {
    return emptyList<T>()
  }

  const res = Object.create(List.prototype)
  res.root = root
  res.levels = levels
  res.size = size
  return res
}

export default class List<T> {
  root: ArrayNode<T>
  levels: number
  size: number
  owner?: Object

  constructor() {
    return emptyList<T>()
  }

  static isList(object: any) {
    return object && object instanceof List
  }

  get(key: number, notSetVal?: T): Option<T> {
    if (!this.size) {
      return notSetVal
    }

    return this.root.get(this.levels, key, notSetVal)
  }

  set(key: number, value: T): List<T> {
    const list = ensureSize<T>(this, key + 1)
    const root = list.root.set(list.levels, key, value, this.owner)

    if (this.owner) {
      list.root = root
      list.size = root.size
      return list
    }

    return makeList<T>(
      root,
      list.levels,
      root.size
    )
  }

  push(value: T): List<T> {
    const list = ensureSize<T>(this, this.size + 1)
    const root = list.root.set(list.levels, this.size, value, this.owner)

    if (this.owner) {
      list.root = root
      list.size = root.size
      return list
    }

    return makeList<T>(
      root,
      list.levels,
      root.size
    )
  }
}
