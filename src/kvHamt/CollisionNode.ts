import { Node, KVKey, KVTuple } from './common'
import ValueNode from './ValueNode'
import resolveConflict from './resolveConflict'

export default class CollisionNode<T> {
  level: number
  hashCode: number
  content: KVTuple<T>[]
  size: number

  constructor(level: number, hashCode: number, content: KVTuple<T>[]) {
    this.level = level
    this.hashCode = hashCode
    this.content = content
    this.size = content.length
  }

  get(hashCode: number, key: KVKey, notSetVal?: T): T {
    const length = this.content.length

    for (let i = 0; i < length; i++) {
      const tuple = this.content[i]
      if (tuple[0] === key) {
        return tuple[1]
      }
    }

    return notSetVal
  }

  set(hashCode: number, key: KVKey, value: T): Node<T> {
    // Resolve different hashCodes by branching off
    if (hashCode !== this.hashCode) {
      const valueNode = new ValueNode<T>(0, hashCode, key, value)

      return resolveConflict<T>(
        this.level,
        this.hashCode,
        this.clone(),
        hashCode,
        valueNode
      )
    }

    const length = this.content.length
    let index: number

    for (index = 0; index < length; index++) {
      const _key = this.content[index][0]
      if (_key === key) {
        break
      }
    }

    const content = this.content.slice()
    content[index] = [ key, value ]

    return new CollisionNode<T>(
      this.level,
      this.hashCode,
      content
    )
  }

  private clone(): CollisionNode<T> {
    return new CollisionNode(
      this.level,
      this.hashCode,
      this.content
    )
  }
}
