import { Node, KVKey, IteratorStep } from './common'
import CollisionNode from './CollisionNode'
import resolveConflict from './resolveConflict'

export default class ValueNode<T> {
  level: number // NOTE: Receives their level from the parent
  size: number
  hashCode: number
  key: KVKey
  value: T
  owner?: Object

  constructor(
    level: number,
    hashCode: number,
    key: KVKey,
    value: T,
    owner?: Object
  ) {
    this.level = level
    this.size = 1
    this.hashCode = hashCode
    this.key = key
    this.value = value
    this.owner = owner
  }

  get(hashCode: number, key: KVKey, notSetVal?: T): T {
    if (key !== this.key) {
      return notSetVal
    }

    return this.value
  }

  set(hashCode: number, key: KVKey, value: T, owner?: Object): Node<T> {
    if (key === this.key) {
      if (owner && owner === this.owner) {
        this.value = value
        return this
      }

      return new ValueNode<T>(
        this.level,
        this.hashCode,
        this.key,
        value,
        owner
      )
    }

    if (hashCode === this.hashCode) {
      const keys: KVKey[] = [ this.key, key ]
      const values: T[] = [ this.value, value ]

      return new CollisionNode(
        this.level,
        this.hashCode,
        keys,
        values,
        owner
      )
    }

    return resolveConflict<T>(
      this.level,
      this.hashCode,
      this.clone(owner),
      hashCode,
      new ValueNode<T>(0, hashCode, key, value, owner),
      owner
    )
  }

  delete(hashCode: number, key: KVKey, owner?: Object) {
    if (key === this.key) {
      return undefined
    }

    return this
  }

  iterate(step: IteratorStep<T>) {
    return step(this.value, this.key)
  }

  private clone(owner?: Object): ValueNode<T> {
    return new ValueNode<T>(
      this.level,
      this.hashCode,
      this.key,
      this.value,
      owner
    )
  }
}
