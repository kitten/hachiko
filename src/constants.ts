export const SIZE = 5
export const BUCKET_SIZE = Math.pow(2, SIZE) // 32
export const MASK = BUCKET_SIZE - 1
export const OVERFLOW_LEVEL = Math.ceil(32 / SIZE)

export type Option<T> = T | undefined;

export type KVKey = string | number

export interface Predicate<T> {
  (value: T, key: KVKey): boolean
}

export interface Transform<T, G> {
  (value: T, key: KVKey): G
}

export interface Reducer<T, G> {
  (acc: any, value: T, key: KVKey): G
}

export interface Updater<T> {
  (value: T): T
}

