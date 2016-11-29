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
      const node = new CollisionNode<number>(1, 2, keys, values)

      expect(node.level).toBe(1)
      expect(node.hashCode).toBe(2)
      expect(node.keys).toBe(keys)
      expect(node.values).toBe(values)
      expect(node.size).toBe(keys.length)
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

      const aNode = result.content[0] as CollisionNode<number>
      expect(aNode).toBeInstanceOf(CollisionNode)
      expect(aNode.keys).toBe(keys)
      expect(aNode.values).toBe(values)
      expect(aNode.hashCode).toBe(hashCode)

      const bNode = result.content[1] as ValueNode<number>
      expect(bNode).toBeInstanceOf(ValueNode)
      expect(bNode.key).toBe(newKey)
      expect(bNode.value).toBe(newValue)

      const aIndex = indexBitOnBitmap(result.bitmap, maskHash(hashCode, 1))
      expect(aIndex).toBe(0)

      const bIndex = indexBitOnBitmap(result.bitmap, maskHash(newHashCode, 1))
      expect(bIndex).toBe(1)
    })
  })
})
