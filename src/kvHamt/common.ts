import BitmapIndexedNode from './BitmapIndexedNode'
import ValueNode from './ValueNode'
import CollisionNode from './CollisionNode'

export type KVKey = string | number
export type Node<T> = BitmapIndexedNode<T> | ValueNode<T> | CollisionNode<T>

// This is a predicate for iteration steps on nodes
// A return value of true indicates that the iteration is done
// and should abort.
export interface IteratorStep<T> {
  (value: T, key: KVKey): boolean
}
