import Map from '../Map'

describe('Map', () => {
  const obj = { firstName: 'Uname', lastName: 'SUname' }
  const firstKey = Object.keys(obj)[0]
  const newValue = 'newName'

  describe('constructor', () => {
    it('should instantiate a Map from an object', () => {
      expect(new Map(obj).size).toBe(2)
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
      const firstKey = Object.keys(obj)[0]
      const mockFunction = jest.fn()

      instantiatedMap.map(mockFunction)

      expect(mockFunction).toHaveBeenCalledTimes(2)
      expect(mockFunction).toHaveBeenLastCalledWith(obj[firstKey], firstKey)
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
  })

  describe('asImmutable', () => {
    it('should return an immutable structure', () => {
      const instantiatedMap = new Map(obj)
      const mutableStruct = instantiatedMap.asMutable()
      const immutableStructure = mutableStruct.asImmutable()
      immutableStructure.set(firstKey, newValue)

      expect(immutableStructure.get(firstKey)).not.toBe(newValue)
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
      const keysIterator = new Map(obj).entries()
      const keys = Object.keys(obj)
      const values = Object.keys(obj).map(key => obj[key])

      let done = false
      let i = 0

      while (!done) {
        const { value, done: _done } = keysIterator.next()
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


})
