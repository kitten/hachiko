import { Node, KVKey, KVTuple } from './common'
import CollisionNode from './CollisionNode'
import resolveConflict from './resolveConflict'

export default class ValueNode<T> {
  level: number
  hashCode: number
  key: KVKey
  value: T

  constructor(level: number, hashCode: number, key: KVKey, value: T) {
    this.level = level
    this.hashCode = hashCode
    this.key = key
    this.value = value
  }

  get(hashCode: number, key: KVKey, notSetVal?: T): T {
    if (key !== this.key) {
      return notSetVal
    }

    return this.value
  }

  set(hashCode: number, key: KVKey, value: T): Node<T> {
    if (key === this.key) {
      return new ValueNode<T>(
        this.level,
        this.hashCode,
        this.key,
        value
      )
    }

    if (hashCode === this.hashCode) {
      const content: KVTuple<T>[] = [
        [ this.key, this.value ],
        [ key, value ]
      ]

      return new CollisionNode(
        this.level,
        this.hashCode,
        content
      )
    }

    return resolveConflict<T>(
      this.level,
      this.hashCode,
      new ValueNode<T>(0, this.hashCode, this.key, this.value),
      hashCode,
      new ValueNode<T>(0, hashCode, key, value)
    )
  }
}
