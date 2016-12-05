import { KVKey, KVTuple, Option } from '../constants'
import Node from './Node'
import ValueNode from './ValueNode'
import CollisionNode from './CollisionNode'
import BitmapIndexedNode from './BitmapIndexedNode'
import IterableSymbol from '../util/iteratorSymbol'

export class IteratorContext<T> {
  node: Node<T>
  index: number
  prev?: IteratorContext<T>

  constructor(node: Node<T>, prev?: IteratorContext<T>) {
    this.node = node
    this.prev = prev
    this.index = 0

    if (node.constructor !== BitmapIndexedNode) {
      return this
    }

    const subNode = (node as BitmapIndexedNode<T>).content[0]
    return new IteratorContext<T>(subNode, this)
  }

  unwrap(): Option<IteratorContext<T>> {
    const { prev } = this
    if (!prev) {
      return undefined
    } else if (prev.index < (prev.node as BitmapIndexedNode<T>).content.length - 1) {
      return prev
    }

    return prev.unwrap()
  }

  advance(): Option<IteratorContext<T>> {
    const unwrapped = this.unwrap()
    if (!unwrapped) {
      return undefined
    }

    const index = unwrapped.index + 1
    const node = (unwrapped.node as BitmapIndexedNode<T>).content[index]

    unwrapped.index = index
    return new IteratorContext<T>(node, unwrapped)
  }
}

export interface IteratorResult<T> {
  value?: T
  done: boolean
}

export abstract class Iterator<T, R> {
  context?: IteratorContext<T>

  constructor(root: Node<T>) {
    this.context = new IteratorContext<T>(root)
  }

  abstract __transform(key: KVKey, value: T): R

  next(): IteratorResult<R> {
    const { context } = this
    if (!context) {
      return { done: true }
    }

    let key: KVKey
    let value: T

    if (context.node.constructor === ValueNode) {
      const node = context.node as ValueNode<T>
      key = node.key
      value = node.value

      this.context = context.advance()
    } else {
      const node = context.node as CollisionNode<T>
      value = node.values[context.index]
      key = node.keys[context.index]

      context.index = context.index + 1
      if (context.index >= node.values.length) {
        this.context = context.advance()
      }
    }

    return {
      value: this.__transform(key, value),
      done: false
    }
  }

  [IterableSymbol](): this {
    return this
  }
}

export class KeyIterator<T> extends Iterator<T, KVKey> {
  __transform(key: KVKey, value: T): KVKey {
    return key
  }
}

export class ValueIterator<T> extends Iterator<T, T> {
  __transform(key: KVKey, value: T): T {
    return value
  }
}

export class EntryIterator<T> extends Iterator<T, KVTuple<T>> {
  __transform(key: KVKey, value: T): KVTuple<T> {
    return [ key, value ]
  }
}
