// Remove WeakMap support
global.WeakMap = undefined
// Mock symbol as an identity function
global.Symbol = x => x

const Cache = require('../Cache.ts').default

describe('Cache with defineProperty', () => {
  describe('constructor', () => {
    it('sets nothing on this', () => {
      const inst = new Cache()

      expect(inst.weakMap).toBe(undefined)
      expect(inst.keys).toBe(undefined)
      expect(inst.values).toBe(undefined)
    })
  })

  describe('set', () => {
    const cache = new Cache()
    const _isExtensible = Object.isExtensible

    beforeEach(() => {
      Object.isExtensible = () => true
    })

    afterAll(() => {
      Object.isExtensible = _isExtensible
    })

    it('defines the hash key property on an extensible object ', () => {
      Object.isExtensible = () => true
      const key = {}

      cache.set(key, 'test')

      expect(key[cache.hashKey]).toBe('test')
      expect(Object.keys(key).includes(cache.hashKey)).toBeFalsy()
    })

    it('throws when defining the hash key property on a non-extensible object', () => {
      Object.isExtensible = () => false
      const key = {}

      expect(() => {
        cache.set(key, 'test')
      }).toThrow()
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
    const cache = new Cache()
    const key = {}
    cache.set(key, 'test')

    it('retrieves values from the cache', () => {
      expect(cache.get({})).toBe(undefined)
      expect(cache.get(key)).toBe('test')
    })
  })
})
