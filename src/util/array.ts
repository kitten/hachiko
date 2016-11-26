// These are mostly the same as Immutable.js's
// They've done great work to make sure these functions are the fastest

// See: https://jsperf.com/copy-array-inline
export const copyArray = <T>(arr: T[]) => {
  const length = arr.length
  const newArr = new Array(length)

  for (let i = 0; i < length; i++) {
    newArr[i] = arr[i]
  }

  return newArr
}

export const spliceIn = <T>(arr: T[], key: number, value: T) => {
  const newLength = arr.length + 1
  const newArr = new Array(newLength)

  let after = 0
  for (let i = 0; i < newLength; i++) {
    if (i === key) {
      newArr[i] = value
      after = -1
    } else {
      newArr[i] = arr[i + after]
    }
  }

  return newArr
}

export const replaceValue = <T>(arr: T[], key: number, value: T) => {
  const length = arr.length
  const newArr = new Array(length)

  for (let i = 0; i < length; i++) {
    newArr[i] = (i === key) ? value : arr[i]
  }

  return newArr
}
