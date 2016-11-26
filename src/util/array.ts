// From Immutable.js, see: https://jsperf.com/copy-array-inline
export const copyArray = (arr: any[]) => {
  const length = arr.length
  const newArr = new Array(length)

  for (let i = 0; i < length; i++) {
    newArr[i] = arr[i]
  }

  return newArr
}
