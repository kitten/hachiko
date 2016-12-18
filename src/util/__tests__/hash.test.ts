import hash from '../hash'

describe('hash', () => {
  it('returns an int32 when passed a number', () => {
    expect(hash(42)).toBe(42)
    expect(hash(Math.pow(2, 32) + 1)).toBe(1)
  })

  // Non exhaustive test for sure... Should maybe be expanded?
  it('returns an int32 hash when passed a string', () => {
    const input = String.fromCharCode(65, 66, 67)

    expect(hash(input)).toBe(64578)
  })
})
