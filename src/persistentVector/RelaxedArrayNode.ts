import Node from './Node'
import { Option } from '../constants'
import { replaceValue } from '../util/array'
import { maskHash } from '../util/bitmap'
import createSizeTable from './util/createSizeTable'

function findTableIndex(
  key: number,
  level: number,
  sizeTable: number[]
): number {
  let index = maskHash(key, level)
  while (sizeTable[index] <= key) {
    index = index + 1
  }

  return index
}

export default class RelaxedArrayNode<T> {
  level: number // NOTE: This can only be >= 1
  content: Node<T>[]
  sizeTable: number[]
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
    this.sizeTable = createSizeTable(content)
    this.size = size
    this.owner = owner
  }

  get(key: number, notSetVal?: T): Option<T> {
    if (key >= this.size) {
      return notSetVal
    }

    const index = findTableIndex(key, this.level, this.sizeTable)
    const subNode = this.content[index]
    const newKey = index === 0 ? index : key - this.sizeTable[index - 1]

    return subNode.get(newKey, notSetVal)
  }

  set(key: number, value: T, owner?: Object): RelaxedArrayNode<T> {
    if (key >= this.size) {
      return this
    }

    const index = findTableIndex(key, this.level, this.sizeTable)
    const oldSubNode = this.content[index]
    const newKey = index === 0 ? index : key - this.sizeTable[index - 1]

    const subNode = oldSubNode.set(newKey, value, owner)
    if (oldSubNode === subNode) {
      return this
    }

    if (owner && owner === this.owner) {
      this.content[index] = subNode
      return this
    }

    const content = replaceValue(this.content, index, subNode)

    return new RelaxedArrayNode<T>(
      this.level,
      content,
      this.size,
      owner
    )
  }
}
