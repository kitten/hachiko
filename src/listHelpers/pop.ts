import List, { emptyList, makeList } from '../List'

function pop<T>(list: List<T>): List<T> {
  let tail = list.tail
  let root = list.root

  if (tail.size === 1) {
    if (!root) {
      return emptyList<T>()
    }

    const lastLeafNode = root.lastLeafNode()
    root = root.popLeafNode(list.owner)
    tail = lastLeafNode
  } else {
    tail = tail.pop(list.owner)
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

export default pop
