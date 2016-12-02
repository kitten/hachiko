import { KVKey, KVTuple, Option, Transform } from '../constants'
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
  }
}

function wrapIteratorContext<T>(node: Node<T>, prev?: IteratorContext<T>): IteratorContext<T> {
  const context = new IteratorContext<T>(node, prev)

  if (node.constructor !== BitmapIndexedNode) {
    return context
  }

  const subNode = (node as BitmapIndexedNode<T>).content[0]
  return wrapIteratorContext<T>(subNode, context)
}

function unwrapIteratorContext<T>(context: IteratorContext<T>): Option<IteratorContext<T>> {
  const { prev } = context
  if (!prev) {
    return undefined
  } else if (prev.index < (prev.node as BitmapIndexedNode<T>).content.length - 1) {
    return prev
  }

  return unwrapIteratorContext<T>(prev)
}

function advanceIteratorContext<T>(context: IteratorContext<T>): Option<IteratorContext<T>> {
  const unwrapped = unwrapIteratorContext<T>(context)
  if (!unwrapped) {
    return undefined
  }

  const index = unwrapped.index + 1
  const node = (unwrapped.node as BitmapIndexedNode<T>).content[index]

  unwrapped.index = index
  return wrapIteratorContext<T>(node, unwrapped)
}

export interface IteratorResult<T> {
  value?: T
  done: boolean
}

export abstract class Iterator<T, R> {
  context?: IteratorContext<T>

  constructor(root: Node<T>) {
    this.context = wrapIteratorContext<T>(root)
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

      this.context = advanceIteratorContext<T>(context)
    } else {
      const node = context.node as CollisionNode<T>
      value = node.values[context.index]
      key = node.keys[context.index]

      context.index = context.index + 1
      if (context.index >= node.values.length) {
        this.context = advanceIteratorContext<T>(context)
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
