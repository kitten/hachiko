import { Option, SIZE } from '../constants'
import ArrayNode from './ArrayNode'
import LeafNode from './LeafNode'

function appendLeafNode<T>(
  root: Option<ArrayNode<T>>,
  node: LeafNode<T>,
  owner?: Object
): ArrayNode<T> {
  if (!root) {
    return new ArrayNode<T>(
      1,
      [ node ],
      node.size,
      owner
    )
  }

  const capacity = 1 << ((root.level + 1) * SIZE)

  let newRoot = root
  if (root.size >= capacity) {
    newRoot = new ArrayNode<T>(
      root.level + 1,
      [ root ],
      root.size,
      owner
    )
  }

  return newRoot.pushLeafNode(
    node,
    owner
  )
}

export default appendLeafNode
