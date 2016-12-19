import BitmapIndexedNode from '../BitmapIndexedNode'
import ValueNode from '../ValueNode'
import Node from '../Node'

describe('BitmapIndexedNode', () => {
  const bitmap = 6
  const content: Node<number, number>[] = [
    new ValueNode(0, 1, 1, 36),
    new ValueNode(0, 2, 2, 42)
  ]

  describe('constructor', () => {
    it('creates an instance correctly', () => {
      const node = new BitmapIndexedNode<number, number>(0, content.length, bitmap, content)

      expect(node.level).toBe(0)
      expect(node.size).toBe(2)
      expect(node.bitmap).toBe(6)
      expect(node.content).toBe(content)
    })
  })

  describe('get', () => {
    const notSetVal = 999
    const node = new BitmapIndexedNode<number, number>(0, content.length, bitmap, content)

    it('should return the sub-node when hashCode is known', () => {
      expect(node.get(1, 1)).toBe(36)
      expect(node.get(2, 2)).toBe(42)
    })

    it('should return the notSetVal when keys don\'t match', () => {
      expect(node.get(8, 8, notSetVal)).toBe(notSetVal)
      expect(node.get(16, 16, notSetVal)).toBe(notSetVal)
    })
  })

  describe('set', () => {
    const node = new BitmapIndexedNode<number, number>(0, content.length, bitmap, content)

    it('should set new entries as ValueNodes on content array', () => {
      const newKey = 3
      const newValue = 111
      const result = node.set(newKey, newKey, newValue) as BitmapIndexedNode<number, number>

      expect(result.size).toBe(content.length + 1)
      expect(result.bitmap).toBe(14)
      expect(result.get(newKey, newKey)).toBe(newValue)
      expect(result.content[2]).toBeInstanceOf(ValueNode)
    })

    it('should call set on node when new entry\'s hash-fragment collides', () => {
      const newKey = 2 + 32
      const newValue = 123
      const result = node.set(newKey, newKey, newValue) as BitmapIndexedNode<number, number>

      expect(result.size).toBe(content.length + 1)
      expect(result.bitmap).toBe(6)
      expect(result.get(newKey, newKey)).toBe(newValue)
      expect(result.get(2, 2)).toBe(42)
      expect(result.content[1]).toBeInstanceOf(BitmapIndexedNode)
    })

    it('should mutate in place if owner matches', () => {
      const owner = {}
      const first = new BitmapIndexedNode<number>(0, content.length, bitmap, content, owner)
      const res = first.set(3, 3, 111, owner) as BitmapIndexedNode<number, number>

      expect(res).toBeInstanceOf(BitmapIndexedNode)
      expect(res).toBe(first)
      expect(res.owner).toBe(owner)
    })
  })

  describe('delete', () => {
    const node = new BitmapIndexedNode<number, number>(0, content.length, bitmap, content)

    it('should return unchanged node if hashCode fragment is not on the node', () => {
      const res = node.delete(123, 123, 123)
      expect(res).toBe(node)
    })

    it('should return unchanged node if subnode hasn\'t changed', () => {
      const res = node.delete(1, 123)
      expect(res).toBe(node)
    })

    it('should return remaining subnode if node of length 2 is deleted on', () => {
      const subNode = new BitmapIndexedNode(1, 0, 0, [])
        .set(0x11111, 33, 33)
        .set(0x22222, 34, 34)

      const res = subNode.delete(0x11111, 33)
      expect(res).toBeInstanceOf(ValueNode)
      expect(res.level).toBe(subNode.level)
    })

    it('should return undefined if subnode of length 1 is deleted on', () => {
      const subNode = new BitmapIndexedNode(1, 0, 0, [])
        .set(0x22222, 34, 34)

      const res = subNode.delete(0x22222, 34)

      expect(res).toBe(undefined)
    })

    it('should return changed node if subnode is modified due to a deletion', () => {
      const subNode = new BitmapIndexedNode(1, 0, 0, [])
        .set(0x22222, 34, 34)
        .set(0x22222, 35, 35)

      const res = subNode.delete(0x22222, 35)

      expect(res).toBeInstanceOf(BitmapIndexedNode)
      expect(res).not.toBe(subNode)
      expect(res.content[0]).toBeInstanceOf(ValueNode)
    })

    it('should mutate and return subnode directly if it\'s of the same owner', () => {
      const owner = {}
      const subNode = new BitmapIndexedNode(1, 0, 0, [], owner)
        .set(0x11111, 33, 33, owner)
        .set(0x22222, 34, 34, owner)

      const res = subNode.delete(0x11111, 33, owner)

      expect(res).toBeInstanceOf(ValueNode)
      expect(res).toBe(subNode.content[1])
    })

    it('should mutate in place if owner matches', () => {
      const owner = {}
      const subNode = new BitmapIndexedNode(1, 0, 0, [], owner)
        .set(0x22222, 34, 34, owner)
        .set(0x22222, 35, 35, owner)

      const res = subNode.delete(0x22222, 35, owner)

      expect(res).toBeInstanceOf(BitmapIndexedNode)
      expect(res).toBe(subNode)
      expect(res.content[0]).toBeInstanceOf(ValueNode)
    })
  })

  describe('map', () => {
    const owner = {}
    const mockMap = jest.fn(() => ({}))
    const mockContent = [{
      map: mockMap
    }]

    const node = new BitmapIndexedNode<number, number>(0, mockContent.length, 1, mockContent, owner)

    it('transforms subnodes by recursively calling map on them', () => {
      const transform = x => x
      const res = node.map(transform)

      expect(res).toBeInstanceOf(BitmapIndexedNode)
      expect(res).not.toBe(node)
      expect(mockMap).toHaveBeenCalledWith(transform, undefined)
    })

    it('modifies node in place if owner matches', () => {
      const transform = x => x
      const res = node.map(transform, owner)

      expect(res).toBeInstanceOf(BitmapIndexedNode)
      expect(res).toBe(node)
      expect(mockMap).toHaveBeenCalledWith(transform, owner)
    })
  })

  describe('iterate', () => {
    it('calls iterate on all subnodes', () => {
      const mockIterate1 = jest.fn(() => ({}))
      const mockIterate2 = jest.fn(() => ({}))

      const mockContent = [{ iterate: mockIterate1 }, { iterate: mockIterate2 }]
      const node = new BitmapIndexedNode<number, number>(0, mockContent.length, 1, mockContent)

      const step = x => x
      node.iterate(step)

      expect(mockIterate1).toHaveBeenCalledWith(step)
      expect(mockIterate2).toHaveBeenCalledWith(step)
    })

    it('calls iterate on all subnodes until step returns true', () => {
      const mockIterate1 = jest.fn(() => true)
      const mockIterate2 = jest.fn(() => ({}))

      const mockContent = [{ iterate: mockIterate1 }, { iterate: mockIterate2 }]
      const node = new BitmapIndexedNode<number, number>(0, mockContent.length, 1, mockContent)

      const step = x => x
      node.iterate(step)

      expect(mockIterate1).toHaveBeenCalledWith(step)
      expect(mockIterate2).not.toHaveBeenCalled()
    })
  })

  describe('iterateReverse', () => {
    it('calls iterateReverse on all subnodes', () => {
      const mockIterate1 = jest.fn(() => ({}))
      const mockIterate2 = jest.fn(() => ({}))

      const mockContent = [{ iterateReverse: mockIterate1 }, { iterateReverse: mockIterate2 }]
      const node = new BitmapIndexedNode<number, number>(0, mockContent.length, 1, mockContent)

      const step = x => x
      node.iterateReverse(step)

      expect(mockIterate2).toHaveBeenCalledWith(step)
      expect(mockIterate1).toHaveBeenCalledWith(step)
    })

    it('calls iterate on all subnodes in reverse until step returns true', () => {
      const mockIterate1 = jest.fn(() => ({}))
      const mockIterate2 = jest.fn(() => true)

      const mockContent = [{ iterateReverse: mockIterate1 }, { iterateReverse: mockIterate2 }]
      const node = new BitmapIndexedNode<number, number>(0, mockContent.length, 1, mockContent)

      const step = x => x
      node.iterateReverse(step)

      expect(mockIterate1).not.toHaveBeenCalled()
      expect(mockIterate2).toHaveBeenCalledWith(step)
    })
  })

  describe('clone', () => {
    const node = new BitmapIndexedNode<number, number>(0, content.length, bitmap, content)

    it('clones the node', () => {
      const res = node.clone()

      expect(node).not.toBe(res)
      expect(node.level).toBe(res.level)
      expect(node.hashCode).toBe(res.hashCode)
      expect(node.content).toBe(res.content)
      expect(node.size).toBe(res.size)
    })

    it('should assign owner when it\'s being passed', () => {
      const owner = {}
      const res = node.clone(owner)
      expect(res.owner).toBe(owner)
    })
  })
})
