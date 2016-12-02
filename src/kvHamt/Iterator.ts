import { KVKey, Option, Transform } from '../constants'
import Node from './Node'
import ValueNode from './ValueNode'
import CollisionNode from './CollisionNode'
import BitmapIndexedNode from './BitmapIndexedNode'
import IterableSymbol from '../util/iteratorSymbol'

export class IteratorContext<T> {
  node: Node<T>
  index: number
  prev?: IteratorContext<T>

  constructor(node: Node<T>, index: number, prev?: IteratorContext<T>) {
    this.node = node
    this.index = index
    this.prev = prev
  }
}

function makeIteratorContext<T>(root: Node<T>): Option<IteratorContext<T>> {
  let context: Option<IteratorContext<T>> = undefined
  let node = root

  while (node.constructor === BitmapIndexedNode) {
    context = new IteratorContext<T>(node, 0, context)
    node = (node as BitmapIndexedNode<T>).content[0]
  }

  return new IteratorContext<T>(node, 0, context)
}

function advanceIteratorContext<T>(context: IteratorContext<T>): Option<IteratorContext<T>> {
  let cursor = context.prev
  while (
    cursor &&
    (cursor.index + 1) >= (cursor.node as BitmapIndexedNode<T>).content.length
  ) {
    cursor = cursor.prev
  }

  if (!cursor) {
    return undefined
  }

  cursor.index = cursor.index + 1

  let node = (cursor.node as BitmapIndexedNode<T>).content[cursor.index]
  let nextContext = new IteratorContext(node, 0, cursor)

  while (node.constructor === BitmapIndexedNode) {
    node = (node as BitmapIndexedNode<T>).content[0]
    nextContext = new IteratorContext<T>(node, 0, nextContext)
  }

  return nextContext
}

export interface IteratorResult<T> {
  value?: T
  done: boolean
}

export default class Iterator<T, R> {
  context?: IteratorContext<T>
  transform: Transform<T, R>

  constructor(root: Node<T>, transform: Transform<T, R>) {
    this.transform = transform
    this.context = makeIteratorContext<T>(root)
  }

  next(): IteratorResult<R> {
    const { context } = this
    if (!context) {
      return { done: true }
    }

    let value: T
    let key: KVKey

    if (context.node instanceof ValueNode) {
      const node = context.node as ValueNode<T>
      this.context = advanceIteratorContext<T>(context)

      value = node.value
      key = node.key
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
      value: this.transform(value, key),
      done: false
    }
  }

  [IterableSymbol](): this {
    return this
  }
}
