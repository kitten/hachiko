// Binary sideways addition
// See: http://jsperf.com/hamming-weight
const hammingWeight = (x: number): number => {
  x = x - ((x >> 1) & 0x55555555)
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333)
  x = (x + (x >> 4)) & 0x0f0f0f0f
  x = x + (x >> 8)
  x = x + (x >> 16)
  return x & 0x7f
}

export default hammingWeight
