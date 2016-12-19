Math.imul = undefined
const murmurHash = require('../hash.ts').murmurHash

// Barely sufficient, I guess
describe('imul without Math.imul', () => {
  it('works', () => {
    expect(murmurHash(2, 2)).toBe(-403707546)
  })
})
