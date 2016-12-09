import Map from '../Map'

describe('Map', () => {
  const obj = { firstName: 'Uname', lastName: 'SUname' }
  const firstKey = Object.keys(obj)[0]
  const newValue = 'newName'

  it('should instantiate a Map from an object', () => {
    const instantiatedMap = new Map(obj)

    expect(instantiatedMap.size).toBe(2)
  })

  it('should get a value', () => {
    const instantiatedMap = new Map(obj)

    expect(instantiatedMap.get(firstKey)).toBe(obj[firstKey])
  })

  it('should set a value', () => {
    const instantiatedMap = new Map().set(firstKey, obj[firstKey])

    expect(instantiatedMap.get(firstKey)).toBe(obj[firstKey])
  })

  it('should delete a value', () => {
    const instantiatedMap = new Map(obj)

    const newInstantiatedMap = instantiatedMap.delete(firstKey)

    expect(newInstantiatedMap.size).toBe(1)
    expect(newInstantiatedMap.get(firstKey)).toBeUndefined()
  })

  it('should update a value', () => {
    const instantiatedMap = new Map(obj)

    const newInstantiatedMap = instantiatedMap.update(firstKey, (value) => {
      expect(value).toBe(obj[firstKey])
      return newValue
    })

    expect(newInstantiatedMap.get(firstKey)).toBe(newValue)
  })

  it('should map over the structure', () => {
    const instantiatedMap = new Map(obj)
    const firstKey = Object.keys(obj)[0]
    const mockFunction = jest.fn()

    instantiatedMap.map(mockFunction)

    expect(mockFunction).toHaveBeenCalledTimes(2)
    expect(mockFunction).toHaveBeenLastCalledWith(obj[firstKey], firstKey)
  })

  it('should clear the structure', () => {
    const instantiatedMap = new Map(obj)
    const newInstantiatedMap = instantiatedMap.clear()
    expect(newInstantiatedMap.size).toBe(0)
  })

  it('should return a mutable structure', () => {
    const instantiatedMap = new Map(obj)
    const mutableStruct = instantiatedMap.asMutable()
    mutableStruct.set(firstKey, newValue)

    expect(mutableStruct.get(firstKey)).toBe(newValue)
  })

  it('should return an immutable structure', () => {
    const instantiatedMap = new Map(obj)
    const mutableStruct = instantiatedMap.asMutable()
    const immutableStructure = mutableStruct.asImmutable()
    immutableStructure.set(firstKey, newValue)

    expect(immutableStructure.get(firstKey)).not.toBe(newValue)
  })

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

  it('should return the values of the structure', () => {
    const valuesIterator = new Map(obj).values()
    const keys = Object.keys(obj)

    let i = 0
    for (const value of valuesIterator) {
      const val = obj[keys[i]]
      expect(value).toBe(val)
      i++
    }
  })

  it('should return the keys of the structure', () => {
    const keysIterator = new Map(obj).keys()
    const keys = Object.keys(obj)

    let i = 0
    for (const key of keysIterator) {
      const k = keys[i]
      expect(key).toBe(k)
      i++
    }
  })

  it('should return the entries of the structure', () => {
    const entriesIterator = new Map(obj).entries()
    const keys = Object.keys(obj)

    let i = 0
    for (const [key, value] of entriesIterator) {
      const k = keys[i]
      const val = obj[k]

      expect(key).toBe(k)
      expect(value).toBe(val)
      i++
    }
  })
})
