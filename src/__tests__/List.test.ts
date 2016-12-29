import List from '../List'

describe('List', () => {
  describe('push', () => {
    it('should append a value', () => {
      const inst = new List().push('first')
      expect(inst.get(0)).toBe('first')
      expect(inst.tail.get(0)).toBe('first')
    })

    it('should append values and wrap them into the root', () => {
      let inst = new List()
      for (let i = 0; i < 33; i++) {
        inst = inst.push(i.toString())
      }

      expect(inst.get(0)).toBe('0')
      expect(inst.get(1)).toBe('1')
      expect(inst.get(32)).toBe('32')

      expect(inst.tail.get(32)).toBe('32')
      expect(inst.root.get(2)).toBe('2')
    })
  })
})
