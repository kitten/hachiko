import Map from '../Map'
import Iterable from '../Iterable'

describe('Iterable', () => {
  const obj = { firstName: 'Uname', lastName: 'SUname' }
  const firstKey = Object.keys(obj)[0]
  const newValue = 'newName'

  describe('isIterable', () => {
    it('should return boolean indicating whether input is an instance of Iterable', () => {
      expect(Iterable.isIterable(new Map())).toBeTruthy()
      expect(Iterable.isIterable(null)).toBeFalsy()
      expect(Iterable.isIterable({})).toBeFalsy()
    })
  })

  describe('withMutations', () => {
    it('should pass a mutable struct to a closure', () => {
      const instantiatedMap = new Map(obj)
      const structureNotMutated = instantiatedMap.withMutations((mutableMap) => {
        mutableMap.set(firstKey, newValue)
        expect(mutableMap.get(firstKey)).toBe(newValue)
      })

      expect(
        structureNotMutated
          .set(firstKey, obj[firstKey])
          .get(firstKey)
      ).not.toBe(newValue)
    })
  })

  describe('isEmpty', () => {
    it('should return boolean indicating whether iterable is empty', () => {
      expect(new Map().isEmpty()).toBeTruthy()
      expect(new Map(obj).isEmpty()).toBeFalsy()
    })
  })

  describe('forEach', () => {
    it('iterates all entries via __iterate', () => {
      let i = 0

      new Map(obj).forEach((value, key) => {
        expect(Object.keys(obj).includes(key)).toBeTruthy()
        expect(obj[key]).toBe(value)
        i++
      })

      expect(i).toBe(Object.keys(obj).length)
    })
  })

  describe('mapKeys', () => {
    it('maps entries to new keys', () => {
      const res = new Map(obj).mapKeys(key => (
        key + 'Test'
      ))

      Object.keys(obj).forEach(key => {
        expect(res.get(key)).toBe(undefined)
      })

      Object.keys(obj).forEach(key => {
        expect(res.get(key + 'Test')).toBe(obj[key])
      })
    })
  })

  describe('mapEntries', () => {
    it('maps entries to new keys and values', () => {
      const res = new Map(obj).mapEntries((value, key) => [
        key + 'Test',
        value + 'Test'
      ])

      Object.keys(obj).forEach(key => {
        expect(res.get(key)).toBe(undefined)
      })

      Object.keys(obj).forEach(key => {
        expect(res.get(key + 'Test')).toBe(obj[key] + 'Test')
      })
    })
  })

  describe('join', () => {
    it('joins values together using specified separator', () => {
      expect(new Map(obj).join(':')).toBe('SUname:Uname')
    })
  })

  describe('count', () => {
    it('returns count of entries', () => {
      const inst = new Map(obj)
      expect(inst.count(x => !!x)).toBe(inst.size)
    })
  })

  describe('has', () => {
    it('returns whether iterable contains key', () => {
      const inst = new Map(obj)
      expect(inst.has('firstName')).toBeTruthy()
      expect(inst.has('abc')).toBeFalsy()
    })
  })

  describe('includes', () => {
    it('returns whether iterable contains value', () => {
      const inst = new Map(obj)
      expect(inst.includes('Uname')).toBeTruthy()
      expect(inst.includes('abc')).toBeFalsy()
    })
  })

  describe('every', () => {
    it('returns whether iterable contains only entries satisfying predicate', () => {
      const inst = new Map(obj)
      expect(inst.every(x => typeof x === 'string')).toBeTruthy()
      expect(inst.every(x => x === 'Uname')).toBeFalsy()
    })
  })

  describe('some', () => {
    it('returns whether iterable contains at least one entry satisfying predicate', () => {
      const inst = new Map(obj)
      expect(inst.some(x => x === 'Uname')).toBeTruthy()
      expect(inst.some(x => x === 'abc')).toBeFalsy()
    })
  })

  describe('first', () => {
    it('returns first value in iterable', () => {
      const inst = new Map(obj)
      expect(inst.first()).toBe('SUname')
    })
  })

  describe('last', () => {
    it('returns last value in iterable', () => {
      const inst = new Map(obj)
      expect(inst.last()).toBe('Uname')
    })
  })
})
