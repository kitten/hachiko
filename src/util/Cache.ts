import { Option } from '../constants'
import { indexOf } from './array'

const IS_EXTENSIBLE_SUPPORT = typeof Object.isExtensible === 'function'
const WEAK_MAP_SUPPORT = typeof WeakMap === 'function'
const DEFINE_PROPERTY_SUPPORT = (function () {
  try {
    Object.defineProperty({}, '@', {})
    return true
  } catch (e) {
    return false
  }
}())

let HASH_KEY: string | symbol = '@@_HACHIKO_HASH_@@'
if (typeof Symbol === 'function') {
  HASH_KEY = Symbol(HASH_KEY)
}

class Cache<T> {
  weakMap?: WeakMap<any, T>
  keys?: any[]
  values?: T[]

  constructor() {
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
    return x[HASH_KEY]
  }

  Cache.prototype.set = function set<T>(this: Cache<T>, x: any, value: T) {
    if (IS_EXTENSIBLE_SUPPORT && !Object.isExtensible(x)) {
      throw new TypeError(`Cannot cache hash ref on non-extensible object.`)
    }

    Object.defineProperty(x, HASH_KEY, {
      enumerable: false,
      configurable: false,
      writable: false,
      value
    })
  }
} else {
  // Multiple (mediocre) fallbacks for IE8
  Cache.prototype.get = function get<T>(this: Cache<T>, x: any): Option<T> {
    let res: T = x[HASH_KEY]
    if (res !== undefined) {
      return res
    }

    if (x.propertyIsEnumerable) {
      res = x.propertyIsEnumerable[HASH_KEY]
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
    if (x.nodeType !== undefined) {
      x[HASH_KEY] = value
    } else if (
      x.propertyIsEnumerable &&
      x.propertyIsEnumerable === x.constructor.prototype.propertyIsEnumerable
    ) {
      x.propertyIsEnumerable = function (this: Object) {
        return this.constructor.prototype.propertyIsEnumerable.apply(this, arguments)
      }

      x.propertyIsEnumerable[HASH_KEY] = value
    } else {
      const keys = this.keys as any[]
      const values = this.values as T[]

      keys.push(x)
      values.push(value)
    }
  }
}

export default Cache
