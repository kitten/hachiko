import ArrayNode from './ArrayNode'
import ValueNode from './ValueNode'

type Node<T> = ArrayNode<T> | ValueNode<T>

export default Node
