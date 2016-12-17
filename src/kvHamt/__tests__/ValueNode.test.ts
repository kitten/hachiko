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
      expect(result.keys).toEqual([ key, newKey ])
      expect(result.values).toEqual([ value, newValue ])
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

      const aNode = result.content[1] as ValueNode<string>
      expect(aNode.key).toBe(key)
      expect(aNode.value).toBe(value)

      const bNode = result.content[0] as ValueNode<string>
      expect(bNode.key).toBe(newKey)
      expect(bNode.value).toBe(newValue)

      const aIndex = indexBitOnBitmap(result.bitmap, maskHash(newHashCode, 0))
      expect(aIndex).toBe(0)

      const bIndex = indexBitOnBitmap(result.bitmap, maskHash(hashCode, 0))
      expect(bIndex).toBe(1)
    })

    it('should assign owner when it\'s being passed', () => {
      const owner = {}
      const res = node.set(hashCode, key, 'newValue', owner)

      expect(res).not.toBe(node)
      expect(res.value).toBe('newValue')
      expect(res.owner).toBe(owner)
    })
  })

  describe('delete', () => {
    const hashCode = 0x11111
    const key = 'key'
    const value = 'value'

    const node = new ValueNode<string>(0, hashCode, key, value)

    it('returns undefined when keys match (hit)', () => {
      const res = node.delete(hashCode, key)
      expect(res).toBe(undefined)
    })

    it('returns unchanged node when keys don\'t match (miss)', () => {
      const res = node.delete(123, 123)
      expect(res).toBe(node)
    })
  })

  describe('map', () => {
    it('should transform value using transformer function', () => {
      const node = new ValueNode<number>(0, 1, 1, 1)
      const res = node.map(x => x.toString())

      expect(res).toBeInstanceOf(ValueNode)
      expect(res.key).toBe(node.key)
      expect(res.value).toBe(node.value.toString())
    })

    it('should assign owner when it\'s being passed', () => {
      const owner = {}
      const node = new ValueNode<number>(0, 1, 1, 1)
      const res = node.map(x => x.toString(), owner)

      expect(res).not.toBe(node)
      expect(res.owner).toBe(owner)
    })
  })

  describe('iterate', () => {
    it('calls predicate using value and key', () => {
      const predicate = jest.fn()
      const node = new ValueNode<number>(0, 1, 1, 1)
      node.iterate(predicate)

      expect(predicate).toHaveBeenCalledTimes(1)
      expect(predicate).toHaveBeenCalledWith(1, 1)
    })
  })

  describe('iterateReverse', () => {
    it('calls predicate using value and key', () => {
      const predicate = jest.fn()
      const node = new ValueNode<number>(0, 1, 1, 1)
      node.iterateReverse(predicate)

      expect(predicate).toHaveBeenCalledTimes(1)
      expect(predicate).toHaveBeenCalledWith(1, 1)
    })
  })

  describe('clone', () => {
    const node = new ValueNode<number>(0, 1, 1, 1)

    it('clones the node', () => {
      const res = node.clone()

      expect(node).not.toBe(res)
      expect(node.level).toBe(res.level)
      expect(node.hashCode).toBe(res.hashCode)
      expect(node.key).toBe(res.key)
      expect(node.value).toBe(res.value)
      expect(node.size).toBe(res.size)
    })

    it('should assign owner when it\'s being passed', () => {
      const owner = {}
      const res = node.clone(owner)
      expect(res).not.toBe(node)
      expect(res.owner).toBe(owner)
    })
  })
})
