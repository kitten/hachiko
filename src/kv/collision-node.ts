import { KVTuple, KVKey } from './constants'

class CollisionNode<T> {
  public content: KVTuple<T>[]
  public hash: number
  public size: number

  public constructor(
    hash: number,
    content?: KVTuple<T>[]
  ) {
    this.hash = hash
    this.content = content || []
    this.size = this.content.length
    return this
  }

  public get(key: KVKey): T {
    const { content } = this
    const size = content.length

    for (let i = 0; i < size; i++) {
      const [ _key, value ] = content[i]

      if (_key === key) {
        return value
      }
    }

    return undefined
  }

  public set(key: KVKey, value: T): CollisionNode<T> {
    const _content = this.content.concat([ key, value ])

    return new CollisionNode<T>(this.hash, _content)
  }
}

export default CollisionNode
