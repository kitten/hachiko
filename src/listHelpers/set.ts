import List, { makeList } from '../List'
import push from './push'

function set<T>(
  list: List<T>,
  key: number,
  value: T
): List<T> {
  if (key < 0) {
    return list
  }

  let tail = list.tail
  let root = list.root

  if (key < list.size) {
    if (root && key < root.size) {
      root = root.set(key, value, list.owner)
    } else {
      tail = tail.set(key, value, list.owner)
    }

    if (list.owner) {
      list.tail = tail
      list.root = root
      return list
    }

    return makeList<T>(tail, root)
  } else if (key === list.size) {
    return push<T>(list, value)
  }

  let mutList = list.owner ? list : list.asMutable()

  for (let i = list.size; i < key; i++) {
    mutList = push(mutList, undefined)
  }

  mutList = push<T>(mutList, value)
  return list.owner ? mutList : mutList.asImmutable()
}

export default set
