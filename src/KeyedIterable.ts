import {
  Transform
} from './constants'

import Iterable from './Iterable'

abstract class KeyedIterable<K, T> extends Iterable<K, T> {
  static isKeyedIterable(object: any) {
    return object && object instanceof KeyedIterable
  }

  mapKeys<G>(
    transform: (key: K) => G
  ): Iterable<G, T> {
    const self = (this as Iterable<any, any>)

    let mutable = (self.owner ? self : self.asMutable()) as Iterable<G, T>
    this.__iterate((value: T, key: K) => {
      const newKey = transform(key)
      if (newKey as any !== key) {
        mutable = mutable
          .delete(key as any)
          .set(newKey, value)
      }

      return false
    })

    return this.owner ? mutable : mutable.asImmutable()
  }

  mapEntries<U, G>(transform: Transform<K, T, [U, G]>): Iterable<U, G> {
    const self = (this as Iterable<any, any>)

    let mutable = (self.owner ? self : self.asMutable()) as Iterable<U, G>
    this.__iterate((value: T, key: K) => {
      const [newKey, newValue] = transform(value, key)
      if (newKey as any !== key) {
        mutable = mutable.delete(key as any)
      }

      mutable = mutable.set(newKey, newValue)
      return false
    })

    return self.owner ? mutable : mutable.asImmutable()
  }
}

export default KeyedIterable
