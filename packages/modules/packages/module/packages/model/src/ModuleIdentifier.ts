import type { Address } from '@xylabs/sdk-js'
import { isAddress } from '@xylabs/sdk-js'

export const MODULE_PATH_SEPARATOR = ':' as const

export const DisallowedModuleIdentifierCharacters = {
  ' ': true,
  '!': true,
  '"': true,
  '#': true,
  '$': true,
  '%': true,
  '&': true,
  "'": true,
  '(': true,
  ')': true,
  '*': true,
  ',': true,
  '.': true,
  '/': true,
  ':': true,
  ';': true,
  '<': true,
  '=': true,
  '>': true,
  '?': true,
  '@': true,
  '[': true,
  ']': true,
  '^': true,
  '_': true,
  '{': true,
  '|': true,
  '}': true,
  '~': true,
}
export type ReservedModuleIdentifierCharacter = keyof typeof DisallowedModuleIdentifierCharacters
export const ReservedModuleIdentifierCharacters = new Set<ReservedModuleIdentifierCharacter>(
  Object.keys(DisallowedModuleIdentifierCharacters) as ReservedModuleIdentifierCharacter[],
)

// TODO: Use Brand, but avoid too complex error
// export type ModuleName = Brand<string, { __moduleName: true }>
export type ModuleName = string

export type ModuleIdentifier
  = | ColonPair<ModuleIdentifierPart>
    | ColonPair<ColonPair<ModuleIdentifierPart>>
    | ColonPair<ColonPair<ColonPair<ModuleIdentifierPart>>>
    | ColonPair<ColonPair<ColonPair<ColonPair<ModuleIdentifierPart>>>>
    | ColonPair<ColonPair<ColonPair<ColonPair<ColonPair<ModuleIdentifierPart>>>>>
    | ColonPair<ColonPair<ColonPair<ColonPair<ColonPair<ColonPair<ModuleIdentifierPart>>>>>>
    | ColonPair<ColonPair<ColonPair<ColonPair<ColonPair<ColonPair<ColonPair<ModuleIdentifierPart>>>>>>>

export type ColonPair<T extends string> = `${T}:${T}` | T

export type ModuleIdentifierPart = Exclude<Address | ModuleName, '*'>

export const isModuleName = (value: unknown): value is ModuleName => {
  return typeof value === 'string' && !isAddress(value) && !includesReservedModuleIdentifierCharacter(value)
}

export const includesReservedModuleIdentifierCharacter = (value: unknown): boolean => {
  return typeof value === 'string' && [...value].some(char => ReservedModuleIdentifierCharacters.has(char as ReservedModuleIdentifierCharacter))
}

export const isModuleIdentifierPart = (value: unknown): value is ModuleIdentifierPart => {
  return isModuleName(value) || isAddress(value)
}
