import { Option } from '../constants'

export default class ValueNode<T> {
  value: T
  size: number
  owner?: Object

  constructor(
    value: T,
    owner?: Object
  ) {
    this.value = value
    this.size = 1
    this.owner = owner
  }

  get(level: number, key: number, notSetVal?: T): Option<T> {
    return this.value
  }

  set(level: number, key: number, value: T, owner?: Object) {
    if (owner && owner === this.owner) {
      this.value = value
      return this
    }

    return new ValueNode<T>(
      value,
      owner
    )
  }
}
