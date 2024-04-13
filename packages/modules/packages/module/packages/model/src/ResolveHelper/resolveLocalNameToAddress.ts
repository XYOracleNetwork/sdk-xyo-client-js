import { Address } from '@xylabs/hex'

import { ModuleInstance } from '../instance'
import { ModuleName } from '../ModuleIdentifier'

export const resolveLocalNameToAddressUp = async (root: ModuleInstance, localName: ModuleName): Promise<Address | undefined> => {
  const parents = (await root.parents?.()) ?? []
  return parents.find((parent) => parent.localName === localName)?.address
}

//since this is a localName, it only checks the children of the root module
export const resolveLocalNameToAddressDown = async (
  root: ModuleInstance,
  localName: ModuleName,
  includePrivate = false,
): Promise<Address | undefined> => {
  const privateChildren = (includePrivate ? await root.privateChildren?.() : []) ?? []
  const publicChildren = (await root.publicChildren?.()) ?? []
  const children = [...privateChildren, ...publicChildren]
  return children.find((child) => child.localName === localName)?.address
}

export const resolveLocalNameToAddress = async (root: ModuleInstance, localName: ModuleName): Promise<Address | undefined> => {
  return (await resolveLocalNameToAddressDown(root, localName)) ?? (await resolveLocalNameToAddressUp(root, localName))
}
