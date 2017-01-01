import Node from '../Node'

function createSizeTable(content: Node<any>[]): number[] {
  const length = content.length
  const sizeTable = new Array(length)

  let sum = 0
  for (let i = 0; i < length; i++) {
    const node = content[i]
    sum = sum + node.size
    sizeTable[i] = sum
  }

  return sizeTable
}

export default createSizeTable
