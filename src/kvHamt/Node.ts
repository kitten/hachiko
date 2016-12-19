import BitmapIndexedNode from './BitmapIndexedNode'
import ValueNode from './ValueNode'
import CollisionNode from './CollisionNode'

type Node<K, T> = BitmapIndexedNode<K, T> | ValueNode<K, T> | CollisionNode<K, T>

export default Node
