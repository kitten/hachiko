import Map from '../Map'
import IterableSymbol from '../util/iteratorSymbol'
import { EntryIterator } from '../kvHamt/Iterator'

describe('Map', () => {
  const obj = { firstName: 'Uname', lastName: 'SUname' }
  const firstKey = Object.keys(obj)[0]
  const newValue = 'newName'

  describe('constructor', () => {
    it('should instantiate a Map from an object', () => {
      const res = new Map(obj)
      expect(res.size).toBe(2)
      expect(res.owner).toBe(undefined)
    })

    it('should return the empty Map reference when it yields an empty Map', () => {
      const empty = new Map()

      const test = new Map({})
      expect(test.size).toBe(0)
      expect(test).toBe(empty)

      expect(new Map()).toBe(empty)
    })
  })

  describe('isMap', () => {
    it('should return boolean indicating whether input is an instance of Map', () => {
      expect(Map.isMap(new Map())).toBeTruthy()
      expect(Map.isMap(null)).toBeFalsy()
      expect(Map.isMap({})).toBeFalsy()
    })
  })

  describe('get', () => {
    it('should get a value', () => {
      expect(
        new Map(obj).get(firstKey)
      ).toBe(obj[firstKey])
    })
  })

  describe('set', () => {
    it('should set a value', () => {
      const inst = new Map().set(firstKey, obj[firstKey])
      expect(inst.get(firstKey)).toBe(obj[firstKey])
    })
  })

  describe('delete', () => {
    it('should delete a value', () => {
      const instantiatedMap = new Map(obj)
      const newInstantiatedMap = instantiatedMap.delete(firstKey)

      expect(newInstantiatedMap.size).toBe(1)
      expect(newInstantiatedMap.get(firstKey)).toBeUndefined()
    })

    it('should mutate in-place when owner is set', () => {
      const inst = new Map(obj)
      inst.owner = {}

      const res = inst.delete(firstKey)
      expect(res).toBe(inst)
      expect(res.size).toBe(1)
    })
  })

  describe('update', () => {
    it('should update a value', () => {
      const instantiatedMap = new Map(obj)

      const newInstantiatedMap = instantiatedMap.update(firstKey, (value) => {
        expect(value).toBe(obj[firstKey])
        return newValue
      })

      expect(newInstantiatedMap.get(firstKey)).toBe(newValue)
    })
  })

  describe('map', () => {
    it('should map over the structure', () => {
      const instantiatedMap = new Map(obj)
      const mockFunction = jest.fn()

      instantiatedMap.map(mockFunction)

      expect(mockFunction).toHaveBeenCalledTimes(2)
      expect(mockFunction).toHaveBeenLastCalledWith(obj[firstKey], firstKey)
    })

    it('should mutate in-place when owner is set', () => {
      const inst = new Map(obj)
      inst.owner = {}

      const res = inst.map(x => x)
      expect(res).toBe(inst)
    })
  })

  describe('clear', () => {
    it('should clear the structure', () => {
      const instantiatedMap = new Map(obj)
      const newInstantiatedMap = instantiatedMap.clear()
      expect(newInstantiatedMap.size).toBe(0)
    })
  })

  describe('asMutable', () => {
    it('should return a mutable structure', () => {
      const instantiatedMap = new Map(obj)
      const mutableStruct = instantiatedMap.asMutable()
      mutableStruct.set(firstKey, newValue)

      expect(mutableStruct.get(firstKey)).toBe(newValue)
    })

    it('should return itself when owner is already set', () => {
      const inst = new Map(obj)

      const res = inst.asMutable()
      expect(res).not.toBe(inst)
      expect(res.asMutable()).toBe(res)
    })
  })

  describe('asImmutable', () => {
    it('should return an immutable structure', () => {
      const instantiatedMap = new Map(obj)
      const mutableStruct = instantiatedMap.asMutable()
      const immutableStructure = mutableStruct.asImmutable()
      immutableStructure.set(firstKey, newValue)

      expect(immutableStructure.get(firstKey)).not.toBe(newValue)
    })

    it('should return the empty Map instance when result is empty', () => {
      const empty = new Map()
      const inst = new Map().set('a', 'b').asMutable()

      expect(inst.delete('a').asImmutable()).toBe(empty)
    })
  })

  describe('__iterate', () => {
    it('should call step in normal order of items', () => {
      const res = new Map(obj)
      const step = jest.fn()

      res.__iterate(step)

      expect(step).toHaveBeenCalledTimes(res.size)

      step.mock.calls.forEach(([ value, key ]) => {
        expect(Object.keys(obj).includes(key)).toBeTruthy()
        expect(obj[key]).toBe(value)
      })
    })

    it('should call step in reverse order of items', () => {
      const res = new Map(obj)
      const step = jest.fn()

      res.__iterate(step, true)

      expect(step).toHaveBeenCalledTimes(res.size)

      step.mock.calls.forEach(([ value, key ]) => {
        expect(Object.keys(obj).includes(key)).toBeTruthy()
        expect(obj[key]).toBe(value)
      })
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

  describe('values', () => {
    it('should return an iterator for the values of the structure', () => {
      const valuesIterator = new Map(obj).values()
      const values = Object.keys(obj).map(key => obj[key])

      let done = false
      let i = 0

      while (!done) {
        const { value, done: _done } = valuesIterator.next()
        done = _done

        if (value) {
          expect(values.includes(value)).toBeTruthy()
        }

        i++
      }

      expect(i).toBe(3)
    })
  })

  describe('keys', () => {
    it('should return an iterator for the keys of the structure', () => {
      const keysIterator = new Map(obj).keys()
      const keys = Object.keys(obj)

      let done = false
      let i = 0

      while (!done) {
        const { value, done: _done } = keysIterator.next()
        done = _done

        if (value) {
          expect(keys.includes(value)).toBeTruthy()
        }

        i++
      }

      expect(i).toBe(3)
    })
  })

  describe('entries', () => {
    it('should return an iterator for the entries of the structure', () => {
      const entriesIterator = new Map(obj).entries()
      const keys = Object.keys(obj)
      const values = Object.keys(obj).map(key => obj[key])

      let done = false
      let i = 0

      while (!done) {
        const { value, done: _done } = entriesIterator.next()
        done = _done

        if (value) {
          expect(keys.includes(value[0])).toBeTruthy()
          expect(values.includes(value[1])).toBeTruthy()
        }

        i++
      }

      expect(i).toBe(3)
    })
  })

  describe('@@iterator', () => {
    it('returns entries iterator', () => {
      const inst = new Map()
      expect(inst[IterableSymbol]()).toBeInstanceOf(EntryIterator)
    })
  })
})
