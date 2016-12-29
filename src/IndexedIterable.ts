import Iterable from './Iterable'

abstract class IndexedIterable<T> extends Iterable<number, T> {
  static isIndexedIterable(object: any) {
    return object && object instanceof IndexedIterable
  }
}

export default IndexedIterable
