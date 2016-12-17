import CollisionNode from '../CollisionNode'
import ValueNode from '../ValueNode'
import BitmapIndexedNode from '../BitmapIndexedNode'

import { KVKey } from '../../constants'
import { maskHash, indexBitOnBitmap } from '../../util/bitmap'

describe('CollisionNode', () => {
  const keys: KVKey[] = [ 1, 3 ]
  const values: number[] = [ 2, 4 ]

  describe('constructor', () => {
    it('creates an instance correctly', () => {
      const owner = {}
      const node = new CollisionNode<number>(1, 2, keys, values, owner)

      expect(node.level).toBe(1)
      expect(node.hashCode).toBe(2)
      expect(node.keys).toBe(keys)
      expect(node.values).toBe(values)
      expect(node.size).toBe(keys.length)
      expect(node.owner).toBe(owner)
    })
  })

  describe('get', () => {
    const node = new CollisionNode<number>(0, 1, keys, values)

    it('should return the value when keys match', () => {
      expect(node.get(1, 1)).toBe(2)
      expect(node.get(2, 1)).toBe(2)
      expect(node.get(1, 3)).toBe(4)
      expect(node.get(2, 3)).toBe(4)
    })

    it('should return the notSetVal when keys don\'t match', () => {
      const notSetVal = 64
      expect(node.get(1, 5, notSetVal)).toBe(notSetVal)
    })
  })

  describe('set', () => {
    const hashCode = 0x11111
    const node = new CollisionNode<number>(0, hashCode, keys, values)

    it('should add tuple to CollectionNode when hashCodes match', () => {
      const newKey = 0x22222
      const newValue = 42
      const result = node.set(hashCode, newKey, newValue) as CollisionNode<number>

      expect(result).toBeInstanceOf(CollisionNode)
      expect(result.keys.length).toBe(keys.length + 1)
      expect(result.keys[2]).toBe(newKey)
      expect(result.values[2]).toBe(newValue)
    })

    it('should assign owner when it\'s being passed', () => {
      const owner = {}
      const result = node.set(0x11111, 0x22222, 42, owner) as CollisionNode<number>

      expect(result).toBeInstanceOf(CollisionNode)
      expect(result.owner).toBe(owner)
    })

    it('should overwrite tuple on CollectionNode when hashCodes and keys match', () => {
      const key = 1
      const newValue = 42
      const result = node.set(hashCode, key, newValue) as CollisionNode<number>

      expect(result).toBeInstanceOf(CollisionNode)
      expect(result.size).toBe(keys.length)
      expect(result.keys[0]).toBe(key)
      expect(result.values[0]).toBe(newValue)
    })

    it('branches off if hashCodes don\'t match up', () => {
      const newHashCode = 0x22222
      const newKey = 64
      const newValue = 42

      const result = node.set(newHashCode, newKey, newValue) as BitmapIndexedNode<number>

      expect(result).toBeInstanceOf(BitmapIndexedNode)
      expect(result.size).toBe(3)

      const aNode = result.content[1] as CollisionNode<number>
      expect(aNode).toBeInstanceOf(CollisionNode)
      expect(aNode.keys).toBe(keys)
      expect(aNode.values).toBe(values)
      expect(aNode.hashCode).toBe(hashCode)

      const bNode = result.content[0] as ValueNode<number>
      expect(bNode).toBeInstanceOf(ValueNode)
      expect(bNode.key).toBe(newKey)
      expect(bNode.value).toBe(newValue)

      const aIndex = indexBitOnBitmap(result.bitmap, maskHash(hashCode, 0))
      expect(aIndex).toBe(1)

      const bIndex = indexBitOnBitmap(result.bitmap, maskHash(newHashCode, 0))
      expect(bIndex).toBe(0)
    })
  })

  describe('delete', () => {
    const node = new CollisionNode<number>(1, 2, keys, values)

    it('returns an unchanged node when key is not on the node (miss)', () => {
      const res = node.delete(123, 123) as CollisionNode<T>
      expect(res).toBe(node)
    })

    it('returns undefined when length was one (compaction)', () => {
      const sizeOne = new CollisionNode<number>(0, 1, [1], [1])
      const res = sizeOne.delete(1, 1)

      expect(res).toBe(undefined)
    })

    it('returns a ValueNode when length was two (compaction)', () => {
      const res = node.delete(1, 1) as ValueNode<T>

      expect(res).toBeInstanceOf(ValueNode)
      expect(res.key).toBe(3)
      expect(res.value).toBe(4)
    })

    it('returns node without the specified key', () => {
      const sizeThree = new CollisionNode<number>(0, 1, [ 1, 2, 3 ], [ 1, 2, 3 ])
      const res = sizeThree.delete(1, 1) as CollisionNode<number>

      expect(res).toBeInstanceOf(CollisionNode)
      expect(res.size).toBe(2)
      expect(res.get(1)).toBe(undefined)
    })

    it('should assign owner when it\'s being passed', () => {
      const sizeThree = new CollisionNode<number>(0, 1, [ 1, 2, 3 ], [ 1, 2, 3 ])
      const owner = {}
      const res = sizeThree.delete(1, 1, owner) as CollisionNode<number>

      expect(res).toBeInstanceOf(CollisionNode)
      expect(res.owner).toBe(owner)
    })
  })

  describe('map', () => {
    const node = new CollisionNode<number>(1, 2, keys, values)

    it('transforms all values using specified transformer function', () => {
      const res = node.map(x => x.toString())

      expect(res.size).toBe(node.size)
      expect(res.values[0]).toBe(node.values[0].toString())
    })

    it('should assign owner when it\'s being passed', () => {
      const owner = {}
      const res = node.map(x => x.toString(), owner)

      expect(res.size).toBe(node.size)
      expect(res.owner).toBe(owner)
    })
  })

  describe('iterate', () => {
    const node = new CollisionNode<number>(1, 2, keys, values)

    it('iterates through all entries', () => {
      const keys = []
      const values = []

      node.iterate((value, key) => {
        keys.push(key)
        values.push(value)
      })

      expect(keys.length).toBe(node.size)
      expect(keys.length).toBe(node.keys.length)
      expect(values.length).toBe(node.values.length)

      for (let i = 0; i < node.keys.length; i++) {
        expect(keys[i]).toBe(node.keys[i])
      }

      for (let i = 0; i < node.values.length; i++) {
        expect(values[i]).toBe(node.values[i])
      }
    })
  })

  describe('iterateReverse', () => {
    const node = new CollisionNode<number>(1, 2, keys, values)

    it('iterates through all entries in reverse', () => {
      const keys = []
      const values = []

      node.iterate((value, key) => {
        keys.push(key)
        values.push(value)
      })

      expect(keys.length).toBe(node.size)
      expect(keys.length).toBe(node.keys.length)
      expect(values.length).toBe(node.values.length)

      for (let i = node.keys.length - 1; i >= 0; i--) {
        expect(keys[i]).toBe(node.keys[i])
      }

      for (let i = node.values.length - 1; i >= 0; i--) {
        expect(values[i]).toBe(node.values[i])
      }
    })
  })

  describe('clone', () => {
    const node = new CollisionNode<number>(1, 2, keys, values)

    it('clones the node', () => {
      const res = node.clone()

      expect(node).not.toBe(res)
      expect(node.level).toBe(res.level)
      expect(node.hashCode).toBe(res.hashCode)
      expect(node.keys).toBe(res.keys)
      expect(node.values).toBe(res.values)
      expect(node.size).toBe(res.size)
    })

    it('should assign owner when it\'s being passed', () => {
      const owner = {}
      const res = node.clone(owner)
      expect(res.owner).toBe(owner)
    })
  })
})
