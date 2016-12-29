import List from '../List'

describe('List', () => {
  describe('push', () => {
    it('correctly appends values and expands root as necessary', () => {
      let inst = new List()
      for (let i = 0; i <= 1024; i++) {
        inst = inst.push(i.toString())
      }

      expect(inst.size).toBe(1025)
      expect(inst.root.size).toBe(1024)
      expect(inst.tail.size).toBe(1)

      expect(inst).toMatchSnapshot()
    })

    it('should append a value', () => {
      const inst = new List().push('first')
      expect(inst.get(0)).toBe('first')
      expect(inst.tail.get(0)).toBe('first')
    })

    it('should append values and wrap them into the root', () => {
      let inst = new List()
      for (let i = 0; i <= 32; i++) {
        inst = inst.push(i.toString())
      }

      expect(inst.size).toBe(33)
      expect(inst.root.size).toBe(32)
      expect(inst.tail.size).toBe(1)

      expect(inst.get(0)).toBe('0')
      expect(inst.get(1)).toBe('1')
      expect(inst.get(32)).toBe('32')

      expect(inst.tail.get(32)).toBe('32')
      expect(inst.root.get(2)).toBe('2')
    })
  })

  describe('pop', () => {
    it('correctly removes values and shrinks root as necessary', () => {
      let inst = new List()
      for (let i = 0; i <= 1024; i++) {
        inst = inst.push(i.toString())
      }

      for (let j = 0; j < 512; j++) {
        inst = inst.pop()
      }

      expect(inst.size).toBe(1025 - 512)
      expect(inst.root.size).toBe(512)
      expect(inst.tail.size).toBe(1)

      expect(inst).toMatchSnapshot()
    })

    it('should truncate a value', () => {
      const inst = new List().push('first')
      expect(inst.get(0)).toBe('first')

      const res = inst.pop()

      expect(res.size).toBe(0)
      expect(res.root).toBe(undefined)
      expect(res.tail.size).toBe(0)
    })

    it('should truncate a value and unwrap the root', () => {
      let inst = new List()
      for (let i = 0; i <= 32; i++) {
        inst = inst.push(i.toString())
      }

      expect(inst.size).toBe(33)
      expect(inst.root.size).toBe(32)

      inst = inst.pop()

      expect(inst.root).toBeFalsy()
      expect(inst.tail.size).toBe(32)
      expect(inst.get(31)).toBe('31')
    })
  })
})
