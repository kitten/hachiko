// See: https://jsperf.com/copy-array-inline
export const copyArray = <T>(arr: T[]): T[] => {
  const length = arr.length
  const newArr = new Array(length)

  for (let i = 0; i < length; i++) {
    newArr[i] = arr[i]
  }

  return newArr
}

export const spliceIn = <T>(arr: T[], key: number, value: T): T[] => {
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

export const spliceOut = <T>(arr: T[], key: number): T[] => {
  const length = arr.length
  const newArr = new Array(length - 1)

  let after = 0
  for (let i = 0; i < length; i++) {
    if (i === key) {
      after = -1
    } else {
      newArr[i + after] = arr[i]
    }
  }

  return newArr
}

export const replaceValue = <T>(arr: T[], key: number, value: T): T[] => {
  const length = arr.length
  const newArr = new Array(length)

  for (let i = 0; i < length; i++) {
    newArr[i] = (i === key) ? value : arr[i]
  }

  return newArr
}

export const indexOf = <T>(arr: T[], needle: T): number => {
  const length = arr.length

  for (let i = 0; i < length; i++) {
    if (arr[i] === needle) {
      return i
    }
  }

  return -1
}
