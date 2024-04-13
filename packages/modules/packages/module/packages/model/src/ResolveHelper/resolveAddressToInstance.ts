import { Address } from '@xylabs/hex'

import { ModuleInstance } from '../instance'

export const resolveAddressToInstanceDown = async (
  root: ModuleInstance,
  address: Address,
  includePrivate = false,
  ignore: Address[] = [],
): Promise<ModuleInstance | undefined> => {
  if (root.address === address) {
    return root
  }
  const privateChildren = (includePrivate ? await root.privateChildren?.() : []) ?? []
  const publicChildren = (await root.publicChildren?.()) ?? []
  const children = [...privateChildren, ...publicChildren]
  for (const child of children) {
    const found = await resolveAddressToInstanceDown(child, address, includePrivate, ignore)
    if (found) {
      return found
    }
  }
}

export const resolveAddressToInstanceSiblings = async (
  root: ModuleInstance,
  address: Address,
  includePrivate = false,
  ignore: Address[] = [],
): Promise<ModuleInstance | undefined> => {
  const siblings = (await root.siblings?.()) ?? []
  for (const sibling of siblings) {
    const found = await resolveAddressToInstanceDown(sibling, address, includePrivate, ignore)
    if (found) {
      return found
    }
  }
}

export const resolveAddressToInstanceUp = async (
  root: ModuleInstance,
  address: Address,
  includePrivate = false,
  ignore: Address[] = [],
): Promise<ModuleInstance | undefined> => {
  const parents = (await root.parents?.()) ?? []
  for (const parent of parents) {
    const found = await resolveAddressToInstance(parent, address, includePrivate, ignore)
    if (found) {
      return found
    }
  }
}

export const resolveAddressToInstance = async (
  root: ModuleInstance,
  address: Address,
  includePrivate = false,
  ignore: Address[] = [],
): Promise<ModuleInstance | undefined> => {
  return (
    (await resolveAddressToInstanceDown(root, address, includePrivate, ignore)) ??
    (await resolveAddressToInstanceUp(root, address, includePrivate, ignore))
  )
}
