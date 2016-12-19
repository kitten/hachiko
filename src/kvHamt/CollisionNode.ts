import Node from './Node'
import { Predicate, Transform, Option } from '../constants'
import { copyArray, indexOf, spliceOut } from '../util/array'
import ValueNode from './ValueNode'
import resolveConflict from './resolveConflict'

export default class CollisionNode<K, T> {
  level: number // NOTE: Receives their level from the parent
  hashCode: number
  keys: K[]
  values: T[]
  size: number
  owner?: Object

  constructor(
    level: number,
    hashCode: number,
    keys: K[],
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

  get(hashCode: number, key: K, notSetVal?: T): Option<T> {
    const length = this.keys.length

    for (let index = 0; index < length; index++) {
      if (this.keys[index] === key) {
        return this.values[index]
      }
    }

    return notSetVal
  }

  set(hashCode: number, key: K, value: T, owner?: Object): Node<K, T> {
    // Resolve different hashCodes by branching off
    if (hashCode !== this.hashCode) {
      const valueNode = new ValueNode<K, T>(0, hashCode, key, value, owner)

      return resolveConflict<K, T>(
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

    const keys = copyArray<K>(this.keys)
    const values = copyArray<T>(this.values)
    keys[index] = key
    values[index] = value

    if (owner && owner === this.owner) {
      this.keys = keys
      this.values = values
      this.size = keys.length
      return this
    }

    return new CollisionNode<K, T>(
      this.level,
      this.hashCode,
      keys,
      values,
      owner
    )
  }

  delete(hashCode: number, key: K, owner?: Object): Option<Node<K, T>> {
    const index = indexOf<K>(this.keys, key)

    if (index === -1) {
      return this
    }

    const length = this.keys.length
    if (length === 1) {
      return undefined
    } else if (length === 2) {
      return new ValueNode<K, T>(
        this.level,
        this.hashCode,
        this.keys[1 - index],
        this.values[1 - index],
        owner
      )
    }

    const keys = spliceOut<K>(this.keys, index)
    const values = spliceOut<T>(this.values, index)

    if (owner && owner === this.owner) {
      this.keys = keys
      this.values = values
      this.size = keys.length
      return this
    }

    return new CollisionNode<K, T>(
      this.level,
      this.hashCode,
      keys,
      values,
      owner
    )
  }

  map<G>(transform: Transform<K, T, G>, owner?: Object): Node<K, G> {
    const length = this.keys.length
    const values = new Array(length)
    for (let i = 0; i < length; i++) {
      const key = this.keys[i]
      const value = this.values[i]
      values[i] = transform(value, key)
    }

    if (owner && owner === this.owner) {
      const res = (this as CollisionNode<any, any>)
      res.values = values
      return (res as CollisionNode<K, G>)
    }

    return new CollisionNode<K, G>(
      this.level,
      this.hashCode,
      this.keys,
      values,
      owner
    )
  }

  iterate(step: Predicate<K, T>) {
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

  iterateReverse(step: Predicate<K, T>) {
    for (let i = this.keys.length - 1; i >= 0; i--) {
      const key = this.keys[i]
      const value = this.values[i]

      if (step(value, key) === true) {
        return true
      }
    }

    return false
  }

  clone(owner?: Object): CollisionNode<K, T> {
    return new CollisionNode(
      this.level,
      this.hashCode,
      this.keys,
      this.values,
      owner
    )
  }
}
