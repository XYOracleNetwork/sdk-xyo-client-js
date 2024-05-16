import { Address } from '@xylabs/hex'

import { ModuleInstance } from '../instance'
import { ModuleName } from '../ModuleIdentifier'
import { resolveLocalNameToInstance, resolveLocalNameToInstanceDown, resolveLocalNameToInstanceUp } from './resolveLocalNameToInstance'

export const resolveLocalNameToAddressUp = async (root: ModuleInstance, modName: ModuleName): Promise<Address | undefined> => {
  return (await resolveLocalNameToInstanceUp(root, modName))?.address
}

//since this is a modName, it only checks the children of the root module
export const resolveLocalNameToAddressDown = async (
  root: ModuleInstance,
  modName: ModuleName,
  includePrivate = false,
): Promise<Address | undefined> => {
  return (await resolveLocalNameToInstanceDown(root, modName, includePrivate))?.address
}

export const resolveLocalNameToAddress = async (root: ModuleInstance, modName: ModuleName, includePrivate = false): Promise<Address | undefined> => {
  return (await resolveLocalNameToInstance(root, modName, includePrivate))?.address
}
