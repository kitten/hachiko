import Node from './Node'
import { Predicate, Transform, Option } from '../constants'
import CollisionNode from './CollisionNode'
import resolveConflict from './resolveConflict'

export default class ValueNode<K, T> {
  level: number // NOTE: Receives their level from the parent
  size: number
  hashCode: number
  key: K
  value: T
  owner?: Object

  constructor(
    level: number,
    hashCode: number,
    key: K,
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

  get(hashCode: number, key: K, notSetVal?: T): Option<T> {
    if (key !== this.key) {
      return notSetVal
    }

    return this.value
  }

  set(hashCode: number, key: K, value: T, owner?: Object): Node<K, T> {
    if (key === this.key) {
      if (owner && owner === this.owner) {
        this.value = value
        return this
      }

      return new ValueNode<K, T>(
        this.level,
        this.hashCode,
        this.key,
        value,
        owner
      )
    }

    if (hashCode === this.hashCode) {
      const keys: K[] = [ this.key, key ]
      const values: T[] = [ this.value, value ]

      return new CollisionNode(
        this.level,
        this.hashCode,
        keys,
        values,
        owner
      )
    }

    return resolveConflict<K, T>(
      this.level,
      this.hashCode,
      this.clone(owner),
      hashCode,
      new ValueNode<K, T>(0, hashCode, key, value, owner),
      owner
    )
  }

  delete(hashCode: number, key: K, owner?: Object): Option<ValueNode<K, T>> {
    if (key === this.key) {
      return undefined
    }

    return this
  }

  map<G>(transform: Transform<K, T, G>, owner?: Object): Node<K, G> {
    const value = transform(this.value, this.key)

    if (owner && owner === this.owner) {
      const res = (this as ValueNode<any, any>)
      res.value = value
      return (res as ValueNode<K, G>)
    }

    return new ValueNode<K, G>(
      this.level,
      this.hashCode,
      this.key,
      value,
      owner
    )
  }

  iterate(step: Predicate<K, T>) {
    return step(this.value, this.key)
  }

  iterateReverse(step: Predicate<K, T>) {
    return step(this.value, this.key)
  }

  clone(owner?: Object): ValueNode<K, T> {
    return new ValueNode<K, T>(
      this.level,
      this.hashCode,
      this.key,
      this.value,
      owner
    )
  }
}
