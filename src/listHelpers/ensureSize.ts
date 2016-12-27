import List, { makeList } from '../List'
import ArrayNode from '../rrbTree/ArrayNode'
import { SIZE } from '../constants'

function ensureSize<T>(
  list: List<T>,
  size: number
): List<T> {
  let root = list.root
  let levels: number

  for (
    levels = list.levels;
    size > (1 << (levels * SIZE));
    levels++
  ) {
    root = new ArrayNode<T>([ root ], root.size, list.owner)
  }

  if (levels === list.levels) {
    return list
  }

  if (list.owner) {
    list.root = root
    list.levels = levels
    return list
  }

  return makeList<T>(
    root,
    levels,
    list.size
  )
}

export default ensureSize
