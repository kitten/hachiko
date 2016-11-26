import BitmapIndexedNode from './BitmapIndexedNode'
import ValueNode from './ValueNode'
import CollisionNode from './CollisionNode'

export type KVKey = string | number
export type Node<T> = BitmapIndexedNode<T> | ValueNode<T> | CollisionNode<T>
