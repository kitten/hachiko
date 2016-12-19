// Remove WeakMap support
global.WeakMap = undefined
// Mock symbol as an identity function
global.Symbol = x => x
// Remove defineProperty support
Object.defineProperty = undefined

const Cache = require('../Cache.ts').default

describe('Cache without defineProperty or WeakMap', () => {
  describe('constructor', () => {
    it('sets keys and values array', () => {
      const inst = new Cache()

      expect(inst.weakMap).toBe(undefined)
      expect(inst.keys).toEqual([])
      expect(inst.values).toEqual([])
    })
  })

  describe('set', () => {
    const cache = new Cache()

    it('sets hash key property directly on nodes', () => {
      const key = { nodeType: 1 }
      cache.set(key, 'test')

      expect(key[cache.hashKey]).toBe('test')
      expect(Object.keys(key).includes(cache.hashKey)).toBeTruthy()
    })

    it('sets hash key property on propertyIsEnumerable if it can', () => {
      const key = {}
      cache.set(key, 'test')

      expect(key['@@_HACHIKO_HASH_@@']).toBe(undefined)
      expect(key.propertyIsEnumerable[cache.hashKey]).toBe('test')
      expect(key.propertyIsEnumerable('test')).toBe(false)
    })

    it('adds mapping to internal arrays as a fallback', () => {
      const key = { propertyIsEnumerable: null }
      cache.set(key, 'test')

      expect(key[cache.hashKey]).toBe(undefined)
      expect(cache.keys[0]).toBe(key)
      expect(cache.values[0]).toBe('test')
    })

    it('doesn\'t affect other Caches', () => {
      const first = new Cache()
      const second = new Cache()

      const a = {}
      const b = {}

      first.set(a, '1')
      second.set(a, '2')

      first.set(b, 'b')

      expect(first.get(a)).toBe('1')
      expect(second.get(a)).toBe('2')
      expect(first.get(b)).toBe('b')
      expect(second.get(b)).toBe(undefined)
    })

  })

  describe('get', () => {
    it('gets cached value directly from nodes', () => {
      const cache = new Cache()
      const key = { nodeType: 1 }
      cache.set(key, 'test')

      expect(cache.get(key)).toBe('test')
    })

    it('gets cached value on propertyIsEnumerable if it existed', () => {
      const cache = new Cache()
      const key = {}
      cache.set(key, 'test')

      expect(cache.get(key)).toBe('test')
    })

    it('gets mapping from internal arrays as a fallback', () => {
      const cache = new Cache()
      const key = { propertyIsEnumerable: null }
      cache.set(key, 'test')

      expect(cache.get(key)).toBe('test')
    })

    it('returns undefined if key is not found', () => {
      const cache = new Cache()
      expect(cache.get({})).toBe(undefined)
    })
  })
})
