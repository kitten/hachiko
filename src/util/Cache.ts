import { Option } from '../constants'
import { indexOf } from './array'

const IS_EXTENSIBLE_SUPPORT = typeof Object.isExtensible === 'function'
const WEAK_MAP_SUPPORT = typeof WeakMap === 'function'
const SYMBOL_SUPPORT = typeof Symbol === 'function'
const DEFINE_PROPERTY_SUPPORT = (function () {
  try {
    Object.defineProperty({}, '@', {})
    return true
  } catch (e) {
    return false
  }
}())

let keyIndex = 1
const makeKey = (): string | symbol => {
  const key = '@@_HACHIKO_HASH_' + (++keyIndex) + '_@@'

  if (SYMBOL_SUPPORT) {
    return Symbol(key)
  }

  return key
}

class Cache<T> {
  hashKey: string | symbol
  weakMap?: WeakMap<any, T>
  keys?: any[]
  values?: T[]

  constructor() {
    this.hashKey = makeKey()

    if (WEAK_MAP_SUPPORT) {
      this.weakMap = new WeakMap()
    } else if (!WEAK_MAP_SUPPORT && !DEFINE_PROPERTY_SUPPORT) {
      this.keys = []
      this.values = []
    }
  }
}

interface Cache<T> {
  get<T>(this: Cache<T>, x: any): Option<T>
  set<T>(this: Cache<T>, x: any, value: T): void
}

if (WEAK_MAP_SUPPORT) {
  // WeakMap is supported by the browser
  Cache.prototype.get = function get<T>(this: Cache<T>, x: any): Option<T> {
    const weakMap = this.weakMap as WeakMap<any, T>
    return weakMap.get(x)
  }

  Cache.prototype.set = function set<T>(this: Cache<T>, x: any, value: T) {
    const weakMap = this.weakMap as WeakMap<any, T>
    weakMap.set(x, value)
  }
} else if (DEFINE_PROPERTY_SUPPORT) {
  // defineProperty is used to set hash on object
  Cache.prototype.get = function get<T>(this: Cache<T>, x: any): Option<T> {
    const { hashKey } = this
    return x[hashKey]
  }

  Cache.prototype.set = function set<T>(this: Cache<T>, x: any, value: T) {
    const { hashKey } = this

    if (IS_EXTENSIBLE_SUPPORT && !Object.isExtensible(x)) {
      throw new TypeError(`Cannot cache hash ref on non-extensible object.`)
    }

    Object.defineProperty(x, hashKey, {
      enumerable: false,
      configurable: false,
      writable: false,
      value
    })
  }
} else {
  // Multiple (mediocre) fallbacks for IE8
  Cache.prototype.get = function get<T>(this: Cache<T>, x: any): Option<T> {
    const { hashKey } = this

    let res: T = x[hashKey]
    if (res !== undefined) {
      return res
    }

    if (x.propertyIsEnumerable) {
      res = x.propertyIsEnumerable[hashKey]
      if (res !== undefined) {
        return res
      }
    }

    const keys = this.keys as any[]
    const values = this.values as T[]

    const keyIndex = indexOf(keys, x)
    if (keyIndex > -1) {
      return values[keyIndex]
    }

    return undefined
  }

  Cache.prototype.set = function set<T>(this: Cache<T>, x: any, value: T) {
    const { hashKey } = this

    if (x.nodeType !== undefined) {
      x[hashKey] = value
    } else if (
      x.propertyIsEnumerable &&
      x.propertyIsEnumerable === x.constructor.prototype.propertyIsEnumerable
    ) {
      x.propertyIsEnumerable = function (this: Object) {
        return this.constructor.prototype.propertyIsEnumerable.apply(this, arguments)
      }

      x.propertyIsEnumerable[hashKey] = value
    } else {
      const keys = this.keys as any[]
      const values = this.values as T[]

      keys.push(x)
      values.push(value)
    }
  }
}

export default Cache
