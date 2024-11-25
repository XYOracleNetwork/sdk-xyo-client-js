/**
 * @group module
 */

import '@xylabs/vitest-extended'

import {
  describe, expect, it,
} from 'vitest'

import { includesReservedModuleIdentifierCharacter, isModuleIdentifierPart } from '../ModuleIdentifier.ts'

describe('ModuleInstance', () => {
  it('isReservedModuleIdentifierCharacter', () => {
    expect(includesReservedModuleIdentifierCharacter(':')).toBeTrue()
    expect(includesReservedModuleIdentifierCharacter('?')).toBeTrue()
    expect(includesReservedModuleIdentifierCharacter('&')).toBeTrue()
    expect(includesReservedModuleIdentifierCharacter('&&')).toBeTrue()
    expect(includesReservedModuleIdentifierCharacter('a')).toBeFalse()
  })
  it('isModuleIdentifierPart', () => {
    expect(isModuleIdentifierPart('module-a')).toBeTrue()
    expect(isModuleIdentifierPart('module:a')).toBeFalse()
    expect(isModuleIdentifierPart('module&a')).toBeFalse()
    expect(isModuleIdentifierPart('module?a')).toBeFalse()
    expect(isModuleIdentifierPart('module:&?a')).toBeFalse()
  })
})
