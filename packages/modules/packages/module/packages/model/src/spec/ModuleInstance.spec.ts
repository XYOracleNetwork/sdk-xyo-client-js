/**
 * @group module
 */

import { includesReservedModuleIdentifierCharacter, isModuleIdentifierPart } from '../instance'

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
