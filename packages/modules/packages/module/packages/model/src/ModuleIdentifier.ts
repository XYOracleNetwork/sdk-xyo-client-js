import type { Address } from '@xylabs/hex'
import { isAddress } from '@xylabs/hex'

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

// using Exclude to make this type not allowed to take a naked string
export type ModuleName = Exclude<string, 'reserved-module-name-56487634'>

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
