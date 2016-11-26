import ValueNode from '../ValueNode'
import CollisionNode from '../CollisionNode'
import BitmapIndexedNode from '../BitmapIndexedNode'
import { maskHash, indexBitOnBitmap } from '../../util/bitmap'

describe('ValueNode', () => {
  describe('constructor', () => {
    it('creates an instance correctly', () => {
      const node = new ValueNode<number>(1, 2, 3, 4)

      expect(node.level).toBe(1)
      expect(node.size).toBe(1)
      expect(node.hashCode).toBe(2)
      expect(node.key).toBe(3)
      expect(node.value).toBe(4)
    })
  })

  describe('get', () => {
    const key = 'key'
    const value = 'value'
    const notSetVal = 'not-set'

    const node = new ValueNode<string>(0, 1, key, value)

    it('should return the value when keys match', () => {
      expect(node.get(1, key)).toBe(value)
      expect(node.get(2, key)).toBe(value)
    })

    it('should return the notSetVal when keys don\'t match', () => {
      expect(node.get(1, 'test', notSetVal)).toBe(notSetVal)
    })
  })

  describe('set', () => {
    const hashCode = 0x11111
    const key = 'key'
    const value = 'value'

    const node = new ValueNode<string>(0, hashCode, key, value)

    // This happens when the user updates a key's value
    it('should update ValueNode when keys match', () => {
      const result = node.set(hashCode, key, 'newValue') as ValueNode<string>

      expect(result).toBeInstanceOf(ValueNode)
      expect(result.value).toBe('newValue')
    })

    // This is due to a hashCode collision, where two keys have the same hashCode
    it('should create a CollisionNode when only hashCodes match', () => {
      const newKey = 'newKey'
      const newValue = 'newValue'
      const result = node.set(hashCode, newKey, newValue) as CollisionNode<string>

      expect(result).toBeInstanceOf(CollisionNode)
      expect(result.size).toBe(2)
      expect(result.content).toEqual([
        [ key, value ],
        [ newKey, newValue ]
      ])
    })

    // This happens when the current node is too "unspecific" for the new key, value
    // and a new branch needs to be created
    it('branches off if keys and hashCodes don\'t match up', () => {
      const newHashCode = 0x22222
      const newKey = 'newKey'
      const newValue = 'newValue'

      const result = node.set(newHashCode, newKey, newValue) as BitmapIndexedNode<string>

      expect(result).toBeInstanceOf(BitmapIndexedNode)
      expect(result.size).toBe(2)

      const aNode = result.content[0] as ValueNode<string>
      expect(aNode.key).toBe(key)
      expect(aNode.value).toBe(value)

      const bNode = result.content[1] as ValueNode<string>
      expect(bNode.key).toBe(newKey)
      expect(bNode.value).toBe(newValue)

      const aIndex = indexBitOnBitmap(result.bitmap, maskHash(newHashCode, 1))
      expect(aIndex).toBe(1)

      const bIndex = indexBitOnBitmap(result.bitmap, maskHash(hashCode, 1))
      expect(bIndex).toBe(0)
    })
  })
})
