import BitmapIndexedNode from './BitmapIndexedNode'
import ValueNode from './ValueNode'
import CollisionNode from './CollisionNode'

type Node<T> = BitmapIndexedNode<T> | ValueNode<T> | CollisionNode<T>

export default Node
