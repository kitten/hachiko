import hash from '../hash'

describe('hash', () => {
  it('returns 0 when passed false, undefined or null', () => {
    expect(hash(false)).toBe(0)
    expect(hash(null)).toBe(0)
    expect(hash(undefined)).toBe(0)
  })

  it('returns 0 when passed NaN or Infinity', () => {
    expect(hash(NaN)).toBe(0)
    expect(hash(Infinity)).toBe(0)
    expect(hash(-Infinity)).toBe(0)
  })

  it('returns 1 when passed true', () => {
    expect(hash(true)).toBe(1)
  })

  it('returns an int32 when passed a number', () => {
    expect(hash(42)).toBe(42)
    expect(hash(Math.pow(2, 32) + 1)).toBe(1)
  })

  // Non exhaustive test for sure... Should maybe be expanded?
  it('returns an int32 hash when passed a string', () => {
    const input = String.fromCharCode(65, 66, 67)

    expect(hash(input)).toBe(64578)
  })

  it('calls .hashCode() and returns its result if it exists', () => {
    const expected = {}
    const input = {
      hashCode: jest.fn(() => expected)
    }

    expect(hash(input)).toBe(expected)
    expect(input.hashCode).toHaveBeenCalled()
  })

  it('calls .toString() if it exists', () => {
    function input() {
      return undefined
    }

    input.toString = function toString() {
      return 'test'
    }

    expect(hash(input)).toBe(hash('test'))
  })

  it('hashes objects by storing unique ids for them', () => {
    const first = {}
    const second = {}

    const firstHash = hash(first)
    const secondHash = hash(second)

    expect(firstHash).toBe(hash(first))
    expect(secondHash).toBe(hash(second))
    expect(firstHash).not.toBe(secondHash)
  })

  it('throws if hash cannot be generated', () => {
    function input() {
      return undefined
    }

    input.toString = undefined

    expect(() => {
      hash(input)
    }).toThrow()
  })
})
