/**
 * @group module
 */

import { isModuleIdentifierPart, isReservedModuleIdentifierCharacter } from '../instance'

describe('ModuleInstance', () => {
  it('isReservedModuleIdentifierCharacter', () => {
    expect(isReservedModuleIdentifierCharacter(':')).toBeTrue()
    expect(isReservedModuleIdentifierCharacter('?')).toBeTrue()
    expect(isReservedModuleIdentifierCharacter('&')).toBeTrue()
    expect(isReservedModuleIdentifierCharacter('&&')).toBeTrue()
    expect(isReservedModuleIdentifierCharacter('a')).toBeFalse()
  })
  it('isModuleIdentifierPart', () => {
    expect(isModuleIdentifierPart('module-a')).toBeTrue()
    expect(isModuleIdentifierPart('module:a')).toBeFalse()
    expect(isModuleIdentifierPart('module&a')).toBeFalse()
    expect(isModuleIdentifierPart('module?a')).toBeFalse()
    expect(isModuleIdentifierPart('module:&?a')).toBeFalse()
  })
})
