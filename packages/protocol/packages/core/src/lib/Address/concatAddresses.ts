import { exists } from '@xylabs/exists'

import { normalizeAddress } from './normalize'

export const concatAddressArrays = (a: string | string[] | undefined, b: string | string[] | undefined): string[] => {
  return ([] as (string | undefined)[]).concat(a).concat(b).filter(exists).map(normalizeAddress)
}

const distinct = <T>(value: T, index: number, array: T[]) => array.indexOf(value) === index

export const distinctAddresses = (a: string | string[] | undefined, b: string | string[] | undefined): string[] => {
  return ([] as (string | undefined)[]).concat(a).concat(b).filter(exists).map(normalizeAddress).filter(distinct)
}
