import { Option, BUCKET_SIZE } from '../constants'
import ArrayNode from './ArrayNode'
import LeafNode from './LeafNode'

function appendLeafNode<T>(
  root: Option<ArrayNode<T>>,
  node: LeafNode<T>,
  owner?: Object
): ArrayNode<T> {
  if (!root) {
    return new ArrayNode<T>(
      0,
      [ node ],
      node.size,
      owner
    )
  }

  const capacity = 1 << ((root.level + 1) * BUCKET_SIZE)

  let newRoot = root
  if (root.size >= capacity) {
    newRoot = new ArrayNode<T>(
      root.level + 1,
      [ root ],
      root.size,
      owner
    )
  }

  return newRoot.setLeafNode(
    newRoot.size + 1,
    node,
    owner
  )
}

export default appendLeafNode