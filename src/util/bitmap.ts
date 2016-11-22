import hammingWeight from './hammingWeight'

const SIZE = 5
const BUCKET_SIZE = Math.pow(2, SIZE) // 32
const MASK = BUCKET_SIZE - 1

export type Bitmap = number
export type Mask = number

export const setBitOnBitmap = (bitmap: Bitmap, positionBitmap: Bitmap): Bitmap => (
  bitmap | positionBitmap
)

export const unsetBitOnBitmap = (bitmap: Bitmap, positionBitmap: Bitmap): Bitmap => (
  bitmap ^ positionBitmap
)

// NOTE: This should only be used to check truthiness
export const getBitOnBitmap = (bitmap: Bitmap, positionBitmap: Bitmap): number => (
  (bitmap & positionBitmap)
)

export const maskHash = (hash: number, level: number): Mask => (
  (hash >>> (level * SIZE)) & MASK
)

export const indexBitOnBitmap = (bitmap: Bitmap, positionBitmap: Bitmap): number => (
  hammingWeight(bitmap & (positionBitmap - 1))
)

