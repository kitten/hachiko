import hammingWeight from './hammingWeight'

const SIZE = 5
const BUCKET_SIZE = Math.pow(2, SIZE) // 32
const MASK = BUCKET_SIZE - 1

export type Bitmap = number
export type Mask = number

export const toBitmap = (position: number): Bitmap => (
  1 << position
)

export const setBitOnBitmap = (bitmap: Bitmap, position: number): Bitmap => (
  bitmap | toBitmap(position)
)

export const unsetBitOnBitmap = (bitmap: Bitmap, position: number): Bitmap => (
  bitmap ^ toBitmap(position)
)

// NOTE: This should only be used to check truthiness
export const getBitOnBitmap = (bitmap: Bitmap, position: number): number => (
  (bitmap & toBitmap(position))
)

export const maskHash = (hash: number, level: number): Mask => (
  (hash >>> (level * SIZE)) & MASK
)

export const indexBitOnBitmap = (bitmap: Bitmap, position: number): number => (
  hammingWeight(bitmap & (toBitmap(position) - 1))
)

