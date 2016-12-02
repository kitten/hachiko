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

export default class Iterator<T, R> {
  context?: IteratorContext<T>
  transform: Transform<T, R>

  constructor(root: Node<T>, transform: Transform<T, R>) {
    this.transform = transform
    this.context = wrapIteratorContext<T>(root)
  }

  next(): IteratorResult<R> {
    const { context } = this
    if (!context) {
      return { done: true }
    }

    if (context.node.constructor === ValueNode) {
      const node = context.node as ValueNode<T>
      this.context = advanceIteratorContext<T>(context)

      return {
        value: this.transform(node.value, node.key),
        done: false
      }
    }

    const node = context.node as CollisionNode<T>
    const value = node.values[context.index]
    const key = node.keys[context.index]

    context.index = context.index + 1
    if (context.index >= node.values.length) {
      this.context = advanceIteratorContext<T>(context)
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
