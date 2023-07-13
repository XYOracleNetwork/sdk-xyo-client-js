import { IndirectModule } from '../Module'

/**
 * Used to filter duplicates from an array of modules
 * @example: modulesArray.filter(duplicateModules)
 * @param value Current Module
 * @param index Current Module's index
 * @param array Module Array
 * @returns True if the Module's address is the first occurrence of
 * that address in the array, false otherwise
 */
export const duplicateModules = (value: IndirectModule, index: number, array: IndirectModule[]): value is IndirectModule => {
  return array.findIndex((v) => v.address === value.address) === index
}
