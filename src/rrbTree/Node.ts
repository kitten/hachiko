import ArrayNode from './ArrayNode'
import LeafNode from './LeafNode'

type Node<T> = ArrayNode<T> | LeafNode<T>

export default Node
