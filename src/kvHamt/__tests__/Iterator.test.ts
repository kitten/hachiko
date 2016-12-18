import { KeyIterator, ValueIterator, EntryIterator } from '../Iterator'
import BitmapIndexedNode from '../BitmapIndexedNode'
import ValueNode from '../ValueNode'
import CollisionNode from '../CollisionNode'
import IteratorSymbol from '../../util/iteratorSymbol'

describe('Iterator', () => {
  const root = new BitmapIndexedNode(0, 3, 0, [
    new ValueNode(1, 0, 'a', 'a'),
    new CollisionNode(1, 0, ['b'], ['b']),
    new BitmapIndexedNode(1, 1, 0, [
      new ValueNode(2, 0, 'c', 'c')
    ])
  ])

  it('iterates correctly', () => {
    const iterator = new KeyIterator(root)

    const val1 = iterator.next()
    expect(val1.value).toBe('a')
    expect(val1.done).toBeFalsy()

    const val2 = iterator.next()
    expect(val2.value).toBe('b')
    expect(val2.done).toBeFalsy()

    const val3 = iterator.next()
    expect(val3.value).toBe('c')
    expect(val3.done).toBeFalsy()

    const val4 = iterator.next()
    expect(val4.value).toBe(undefined)
    expect(val4.done).toBeTruthy()
  })

  describe('@@iterator', () => {
    it('returns itself', () => {
      const iterator = new KeyIterator(root)
      expect(iterator[IteratorSymbol]()).toBe(iterator)
    })
  })

  describe('KeyIterator', () => {
    it('__transform', () => {
      const transform = new KeyIterator(root).__transform

      expect(transform('key', 'value')).toEqual({
        value: 'key',
        done: false
      })
    })
  })

  describe('ValueIterator', () => {
    it('__transform', () => {
      const transform = new ValueIterator(root).__transform

      expect(transform('key', 'value')).toEqual({
        value: 'value',
        done: false
      })
    })
  })

  describe('EntryIterator', () => {
    it('__transform', () => {
      const transform = new EntryIterator(root).__transform

      expect(transform('key', 'value')).toEqual({
        value: [ 'key', 'value' ],
        done: false
      })
    })
  })
})
