import BitmapIndexedNode from '../BitmapIndexedNode'
import ValueNode from '../ValueNode'
import { Node } from '../common'

describe('BitmapIndexedNode', () => {
  const bitmap = 6
  const content: Node<number>[] = [
    new ValueNode(0, 1, 1, 36),
    new ValueNode(0, 2, 2, 42)
  ]

  describe('constructor', () => {
    it('creates an instance correctly', () => {
      const node = new BitmapIndexedNode<number>(0, content.length, bitmap, content)

      expect(node.level).toBe(0)
      expect(node.size).toBe(2)
      expect(node.bitmap).toBe(6)
      expect(node.content).toBe(content)
    })
  })

  describe('get', () => {
    const notSetVal = 999
    const node = new BitmapIndexedNode<number>(0, content.length, bitmap, content)

    it('should return the sub-node when hashCode is known', () => {
      expect(node.get(1, 1)).toBe(36)
      expect(node.get(2, 2)).toBe(42)
    })

    it('should return the notSetVal when keys don\'t match', () => {
      expect(node.get(8, 8, notSetVal)).toBe(notSetVal)
      expect(node.get(16, 16, notSetVal)).toBe(notSetVal)
    })
  })
})
