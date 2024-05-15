import { Address } from '@xylabs/hex'

import { ModuleInstance } from '../instance'
import { ModuleName } from '../ModuleIdentifier'

export const resolveLocalNameToAddressUp = async (root: ModuleInstance, modName: ModuleName): Promise<Address | undefined> => {
  const parents = (await root.parents?.()) ?? []
  return parents.find((parent) => parent.modName === modName)?.address
}

//since this is a modName, it only checks the children of the root module
export const resolveLocalNameToAddressDown = async (
  root: ModuleInstance,
  modName: ModuleName,
  includePrivate = false,
): Promise<Address | undefined> => {
  const privateChildren = (includePrivate ? await root.privateChildren?.() : []) ?? []
  const publicChildren = (await root.publicChildren?.()) ?? []
  const children = [...privateChildren, ...publicChildren]
  return children.find((child) => child.modName === modName)?.address
}

export const resolveLocalNameToAddress = async (root: ModuleInstance, modName: ModuleName, includePrivate = false): Promise<Address | undefined> => {
  return (await resolveLocalNameToAddressDown(root, modName, includePrivate)) ?? (await resolveLocalNameToAddressUp(root, modName))
}
