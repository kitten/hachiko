import KVNode from '../node'

describe('KVNode', () => {
  describe('constructor', () => {
    it('should construct a node using the provided data', () => {
      const content = [ 1, 1 ]
      const node = new KVNode<number>(content, 1, 1, 1)

      expect(node.content).toBe(content)
      expect(node.dataMap).toBe(1)
      expect(node.nodeMap).toBe(1)
      expect(node.level).toBe(1)
    })
  })

  describe('set', () => {
    it('should set data without collisions on one node', () => {
      const node = new KVNode<string>()
        .set(0, '00')
        .set(1, '01')
        .set(2, '10')

      expect(node.content).toEqual([
        0, '00',
        1, '01',
        2, '10'
      ])

      expect(node.dataMap).toBe(7) // 111
      expect(node.nodeMap).toBe(0)
    })

    it('should set data in order on one node', () => {
      const node = new KVNode<string>()
        .set(1, '01')
        .set(0, '00')
        .set(3, '11')

      expect(node.content).toEqual([
        0, '00',
        1, '01',
        3, '11'
      ])

      expect(node.dataMap).toBe(11) // 1011
      expect(node.nodeMap).toBe(0)
    })

    it('should set data with collisions on subnodes', () => {
      const node = new KVNode<string>()
        .set(0, '0')
        .set(32, '0')
        .set(1, '1')
        .set(33, '1')

      expect(node).toEqual({
        content: [{
          content: [
            1, '1',
            33, '1'
          ],
          dataMap: 3,
          level: 1,
          nodeMap: 0
        }, {
          content: [
            0, '0',
            32, '0'
          ],
          dataMap: 3,
          level: 1,
          nodeMap: 0
        }],
        dataMap: 0,
        level: 0,
        nodeMap: 3
      })
    })

    it('should overwrite values with the same keys', () => {
      const node = new KVNode<string>()
        .set(0, '0')
        .set(1, '1')
        .set(0, 'test')

      expect(node.content).toEqual([
        0, 'test',
        1, '1'
      ])

      expect(node.dataMap).toBe(3) // 11
      expect(node.nodeMap).toBe(0)
    })
  })
})
