import Node from './Node'
import { KVKey, Predicate } from '../constants'
import { copyArray, indexOf, spliceOut } from '../util/array'
import ValueNode from './ValueNode'
import resolveConflict from './resolveConflict'

export default class CollisionNode<T> {
  level: number // NOTE: Receives their level from the parent
  hashCode: number
  keys: KVKey[]
  values: T[]
  size: number
  owner?: Object

  constructor(
    level: number,
    hashCode: number,
    keys: KVKey[],
    values: T[],
    owner?: Object
  ) {
    this.level = level
    this.hashCode = hashCode
    this.keys = keys
    this.values = values
    this.size = keys.length
    this.owner = owner
  }

  get(hashCode: number, key: KVKey, notSetVal?: T): T {
    const length = this.keys.length

    for (let index = 0; index < length; index++) {
      if (this.keys[index] === key) {
        return this.values[index]
      }
    }

    return notSetVal
  }

  set(hashCode: number, key: KVKey, value: T, owner?: Object): Node<T> {
    // Resolve different hashCodes by branching off
    if (hashCode !== this.hashCode) {
      const valueNode = new ValueNode<T>(0, hashCode, key, value, owner)

      return resolveConflict<T>(
        this.level,
        this.hashCode,
        this.clone(owner),
        hashCode,
        valueNode,
        owner
      )
    }

    const length = this.keys.length
    let index: number

    for (index = 0; index < length; index++) {
      if (this.keys[index] === key) {
        break
      }
    }

    const keys = copyArray<KVKey>(this.keys)
    const values = copyArray<T>(this.values)
    keys[index] = key
    values[index] = value

    if (owner && owner === this.owner) {
      this.keys = keys
      this.values = values
      return this
    }

    return new CollisionNode<T>(
      this.level,
      this.hashCode,
      keys,
      values,
      owner
    )
  }

  delete(hashCode: number, key: KVKey, owner?: Object): Node<T> {
    const index = indexOf<KVKey>(this.keys, key)

    if (index === -1) {
      return this
    }

    const length = this.keys.length
    if (length === 1) {
      return undefined
    } else if (length === 2) {
      return new ValueNode<T>(
        this.level,
        this.hashCode,
        this.keys[index],
        this.values[index],
        owner
      )
    }

    const keys = spliceOut<KVKey>(this.keys, index)
    const values = spliceOut<T>(this.values, index)

    if (owner && owner === this.owner) {
      this.keys = keys
      this.values = values
      return this
    }

    return new CollisionNode<T>(
      this.level,
      this.hashCode,
      keys,
      values,
      owner
    )
  }

  iterate(step: Predicate<T>) {
    const length = this.keys.length
    for (let i = 0; i < length; i++) {
      const key = this.keys[i]
      const value = this.values[i]

      if (step(value, key) === true) {
        return true
      }
    }

    return false
  }

  private clone(owner?: Object): CollisionNode<T> {
    return new CollisionNode(
      this.level,
      this.hashCode,
      this.keys,
      this.values,
      owner
    )
  }
}
