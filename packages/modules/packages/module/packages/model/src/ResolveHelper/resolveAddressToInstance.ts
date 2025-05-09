import type { Address } from '@xylabs/hex'

import type { ModuleInstance } from '../instance/index.ts'
import type { ModuleResolveDirection } from './model.ts'

export const resolveAddressToInstanceDown = async (
  root: ModuleInstance,
  address: Address,
  includePrivate: boolean | undefined = undefined,
  ignore: Address[] = [],
): Promise<ModuleInstance | undefined> => {
  if (root.address === address) {
    return root
  }
  const cache = root.addressCache?.('up', !!includePrivate)
  const privateChildren = (includePrivate ? await root.privateChildren?.() : []) ?? []
  const publicChildren = (await root.publicChildren?.()) ?? []
  const children = [...privateChildren, ...publicChildren]
  for (const child of children) {
    const found = await resolveAddressToInstanceDown(child, address, includePrivate, ignore)
    if (found) {
      cache?.set(address, new WeakRef(found))
      return found
    }
  }
  cache?.set(address, null)
}

export const resolveAddressToInstanceSiblings = async (
  root: ModuleInstance,
  address: Address,
  includePrivate: boolean | undefined = undefined,
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
  includePrivate: boolean | undefined = undefined,
  ignore: Address[] = [],
): Promise<ModuleInstance | undefined> => {
  const cache = root.addressCache?.('up', includePrivate ?? true)
  const parents = (await root.parents?.()) ?? []
  for (const parent of parents) {
    const found = await resolveAddressToInstance(parent, address, includePrivate, ignore)
    if (found) {
      cache?.set(address, new WeakRef(found))
      return found
    }
  }
  cache?.set(address, null)
}

export const resolveAddressToInstanceAll = async (
  root: ModuleInstance,
  address: Address,
  includePrivate: boolean | undefined = undefined,
  ignore: Address[] = [],
): Promise<ModuleInstance | undefined> => {
  const cache = root.addressCache?.('all', !!includePrivate)
  const result
    = (await resolveAddressToInstanceDown(root, address, includePrivate ?? false, ignore))
      ?? (await resolveAddressToInstanceUp(root, address, includePrivate ?? true, ignore))
  cache?.set(address, result ? new WeakRef(result) : null)
  return result
}

export const resolveAddressToInstance = async (
  root: ModuleInstance,
  address: Address,
  includePrivate: boolean | undefined = undefined,
  ignore: Address[] = [],
  direction: ModuleResolveDirection = 'all',
): Promise<ModuleInstance | undefined> => {
  switch (direction) {
    case 'all': {
      return await resolveAddressToInstanceAll(root, address, includePrivate, ignore)
    }
    case 'up': {
      return await resolveAddressToInstanceUp(root, address, includePrivate ?? true, ignore)
    }
    case 'down': {
      return await resolveAddressToInstanceDown(root, address, includePrivate ?? false, ignore)
    }
  }
}
