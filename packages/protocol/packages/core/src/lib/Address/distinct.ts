import { concat } from './concat'

const distinct = <T>(value: T, index: number, array: T[]) => array.indexOf(value) === index

export const distinctAddresses = (a: string | string[] | undefined, b: string | string[] | undefined): string[] => {
  return concat(a, b).filter(distinct)
}
