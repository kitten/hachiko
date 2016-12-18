import { KVKey, KVTuple } from '../constants'
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

export interface IteratorResult<T> {
  value?: T
  done: boolean
}

export abstract class Iterator<T, R> {
  context?: IteratorContext<T>

  constructor(root: Node<T>) {
    this.context = root && new IteratorContext<T>(root)
  }

  abstract __transform(key: KVKey, value: T): IteratorResult<R>

  next(): IteratorResult<R> {
    let { context } = this

    while (context) {
      const node = context.node
      const index = context.index++

      if (node.constructor === CollisionNode) {
        const { keys, values } = node as CollisionNode<T>
        const maxIndex = keys.length - 1
        if (index <= maxIndex) {
          return this.__transform(keys[index], values[index])
        }
      } else {
        const { content } = node as BitmapIndexedNode<T>
        const maxIndex = content.length - 1
        if (index <= maxIndex) {
          const subNode = content[index]
          if (subNode.constructor === ValueNode) {
            const { key, value } = subNode as ValueNode<T>
            return this.__transform(key, value)
          }

          context = this.context = new IteratorContext<T>(subNode, context)
          continue
        }
      }

      context = this.context = (this.context as IteratorContext<T>).prev
    }

    return { done: true }
  }

  [IterableSymbol](): this {
    return this
  }
}

export class KeyIterator<T> extends Iterator<T, KVKey> {
  __transform(key: KVKey, value: T): IteratorResult<KVKey> {
    return {
      value: key,
      done: false
    }
  }
}

export class ValueIterator<T> extends Iterator<T, T> {
  __transform(key: KVKey, value: T): IteratorResult<T> {
    return {
      value: value,
      done: false
    }
  }
}

export class EntryIterator<T> extends Iterator<T, KVTuple<T>> {
  __transform(key: KVKey, value: T): IteratorResult<KVTuple<T>> {
    return {
      value: [ key, value ],
      done: false
    }
  }
}
