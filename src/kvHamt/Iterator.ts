import Node from './Node'
import ValueNode from './ValueNode'
import CollisionNode from './CollisionNode'
import BitmapIndexedNode from './BitmapIndexedNode'
import IterableSymbol from '../util/iteratorSymbol'

export class IteratorContext<K, T> {
  node: Node<K, T>
  index: number
  prev?: IteratorContext<K, T>

  constructor(node: Node<K, T>, prev?: IteratorContext<K, T>) {
    this.node = node
    this.prev = prev
    this.index = 0
  }
}

export interface IteratorResult<U> {
  value?: U
  done: boolean
}

export abstract class Iterator<K, T, U> {
  context?: IteratorContext<K, T>

  constructor(root: Node<K, T>) {
    this.context = root && new IteratorContext<K, T>(root)
  }

  abstract __transform(key: K, value: T): IteratorResult<U>

  next(): IteratorResult<U> {
    let { context } = this

    while (context) {
      const node = context.node
      const index = context.index++

      if (node.constructor === CollisionNode) {
        const { keys, values } = node as CollisionNode<K, T>
        const maxIndex = keys.length - 1
        if (index <= maxIndex) {
          return this.__transform(keys[index], values[index])
        }
      } else {
        const { content } = node as BitmapIndexedNode<K, T>
        const maxIndex = content.length - 1
        if (index <= maxIndex) {
          const subNode = content[index]
          if (subNode.constructor === ValueNode) {
            const { key, value } = subNode as ValueNode<K, T>
            return this.__transform(key, value)
          }

          context = this.context = new IteratorContext<K, T>(subNode, context)
          continue
        }
      }

      context = this.context = (this.context as IteratorContext<K, T>).prev
    }

    return { done: true }
  }

  [IterableSymbol](): this {
    return this
  }
}

export class KeyIterator<K, T> extends Iterator<K, T, K> {
  __transform(key: K, value: T): IteratorResult<K> {
    return {
      value: key,
      done: false
    }
  }
}

export class ValueIterator<K, T> extends Iterator<K, T, T> {
  __transform(key: K, value: T): IteratorResult<T> {
    return {
      value: value,
      done: false
    }
  }
}

export class EntryIterator<K, T> extends Iterator<K, T, [K, T]> {
  __transform(key: K, value: T): IteratorResult<[K, T]> {
    return {
      value: [ key, value ],
      done: false
    }
  }
}
