import Map from '../Map'
import Iterable from '../Iterable'

describe('Iterable', () => {
  const obj = { firstName: 'Uname', lastName: 'SUname' }

  describe('isIterable', () => {
    it('should return boolean indicating whether input is an instance of Iterable', () => {
      expect(Iterable.isIterable(new Map())).toBeTruthy()
      expect(Iterable.isIterable(null)).toBeFalsy()
      expect(Iterable.isIterable({})).toBeFalsy()
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

  describe('filter', () => {
    it('filters out entries that don\'t pass the predicate', () => {
      const inst = new Map(obj)
      const res = inst.filter(x => x === 'SUname')

      expect(res.size).toBe(1)
      expect(res.first()).toBe('SUname')
    })
  })

  describe('filterNot', () => {
    it('filters out entries that pass the predicate', () => {
      const inst = new Map(obj)
      const res = inst.filterNot(x => x === 'SUname')

      expect(res.size).toBe(1)
      expect(res.first()).toBe('Uname')
    })
  })

  describe('find', () => {
    it('returns first value that passes the predicate', () => {
      expect(new Map(obj).find(x => !!x)).toBe('SUname')
    })

    it('returns notSetVal if no matching value is found', () => {
      expect(new Map(obj).find(x => x === 'abc', 'abc')).toBe('abc')
    })
  })

  describe('findLast', () => {
    it('returns last value that passes the predicate', () => {
      expect(new Map(obj).findLast(x => !!x)).toEqual('Uname')
    })
  })

  describe('findEntry', () => {
    it('returns first entry that passes the predicate', () => {
      expect(new Map(obj).findEntry(x => !!x)).toEqual([ 'lastName', 'SUname' ])
    })

    it('returns notSetVal if no matching entry is found', () => {
      expect(new Map(obj).findEntry(x => x === 'abc', 'abc')).toBe('abc')
    })
  })

  describe('findLastEntry', () => {
    it('returns last value that passes the predicate', () => {
      expect(new Map(obj).findLastEntry(x => !!x)).toEqual([ 'firstName', 'Uname' ])
    })
  })

  describe('findKey', () => {
    it('returns first key that passes the predicate', () => {
      expect(new Map(obj).findKey(x => !!x)).toEqual('lastName')
    })

    it('returns notSetVal if no matching key is found', () => {
      expect(new Map(obj).findKey(x => x === 'abc', 'abc')).toBe('abc')
    })
  })

  describe('findLastKey', () => {
    it('returns last key that passes the predicate', () => {
      expect(new Map(obj).findLastKey(x => !!x)).toEqual('firstName')
    })
  })

  describe('merge', () => {
    it('merges objects and iterables', () => {
      const res = new Map(obj).merge({ a: 'a' }, new Map({ b: 'b' }))

      expect(res.size).toBe(4)
      expect(res.get('a')).toBe('a')
      expect(res.get('b')).toBe('b')
    })

    it('returns unchanged iterable if nothing is passed', () => {
      const iter = new Map(obj)
      const res = iter.merge()

      expect(iter).toBe(res)
    })
  })

  describe('mergeWith', () => {
    const merger = (prev, value) => prev + value

    it('merges objects and iterables and resolves conflicts with the merger', () => {
      const res = new Map(obj).mergeWith(merger, { firstName: 'Test' }, new Map({ lastName: 'Test' }))

      expect(res.size).toBe(2)
      expect(res.get('firstName')).toBe('UnameTest')
      expect(res.get('lastName')).toBe('SUnameTest')
    })

    it('returns unchanged iterable if nothing is passed', () => {
      const iter = new Map(obj)
      const res = iter.mergeWith(merger)

      expect(iter).toBe(res)
    })
  })
})
