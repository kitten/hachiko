export const SIZE = 5
export const BUCKET_SIZE = Math.pow(2, SIZE) // 32
export const MASK = BUCKET_SIZE - 1
export const OVERFLOW_LEVEL = Math.ceil(32 / SIZE)

export type Option<T> = T | undefined;

export interface Dict<T> {
  [key: string]: T
}

export interface Predicate<K, T> {
  (value: T, key: K): boolean
}

export interface Transform<K, T, G> {
  (value: T, key: K): G
}

export interface Reducer<K, T, G> {
  (acc: any, value: T, key: K): G
}

export interface Updater<T> {
  (value: T): T
}

export interface Merger<K, T> {
  (prev: T, next: T, key: K): T
}

