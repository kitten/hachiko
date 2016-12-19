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

    it('defines the hash key property on an extensible object ', () => {
      Object.isExtensible = () => true
      const key = {}

      cache.set(key, 'test')

      expect(key['@@_HACHIKO_HASH_@@']).toBe('test')
      expect(Object.keys(key).includes('@@_HACHIKO_HASH_@@')).toBeFalsy()
    })

    it('throws when defining the hash key property on a non-extensible object', () => {
      Object.isExtensible = () => false
      const key = {}

      expect(() => {
        cache.set(key, 'test')
      }).toThrow()
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
