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
    if (
      !prev ||
      prev.index < (prev.node as BitmapIndexedNode<T>).content.length - 1
    ) {
      return prev
    }

    return prev.unwrap()
  }

  advance(): Option<IteratorContext<T>> {
    const unwrapped = this.unwrap()
    if (!unwrapped) {
      return unwrapped
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
  context: IteratorContext<T>

  constructor(root: Node<T>) {
    this.context = new IteratorContext<T>(root)
  }

  abstract __transform(key: KVKey, value: T): R

  next(): IteratorResult<R> {
    const { context } = this
    if (!context) {
      return { done: true }
    }

    const { node, index } = context

    if (node.constructor === ValueNode) {
      this.context = context.advance() as IteratorContext<T>
      const done = !this.context

      return {
        value: this.__transform(
          (node as ValueNode<T>).key,
          (node as ValueNode<T>).value
        ),
        done
      }
    }

    const { values, keys } = (node as CollisionNode<T>)
    const nextIndex = index + 1
    context.index = nextIndex

    let done = false
    if (nextIndex >= values.length) {
      this.context = context.advance() as IteratorContext<T>
      done = !this.context
    }

    return {
      value: this.__transform(keys[index], values[index]),
      done
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
