const fpSplice = (arr: any[], index: number, remove: number, ...add: any[]): any[] => {
  const res = arr.slice()
  res.splice(index, remove, ...add)
  return res
}

export default fpSplice
