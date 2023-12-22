export const countCombinations = <T>(jaggedArray: T[][]): number => {
  return jaggedArray.reduce((total, currentArray) => total * currentArray.length, 1)
}
