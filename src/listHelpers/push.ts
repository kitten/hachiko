import List, { makeList } from '../List'
import appendLeafNode from '../persistentVector/appendLeafNode'

function push<T>(
  list: List<T>,
  value: T
): List<T> {
  let tail = list.tail
  let root = list.root

  if (tail.size === BUCKET_SIZE) {
    root = appendLeafNode<T>(
      root,
      tail,
      list.owner
    )

    tail = new LeafNode<T>([ value ], list.owner)
  } else {
    tail = tail.push(value, list.owner)
  }

  if (list.owner) {
    list.tail = tail
    list.root = root
    list.size = tail.size + (root ? root.size : 0)
    return list
  }

  return makeList<T>(
    tail,
    root
  )
}

export default push
