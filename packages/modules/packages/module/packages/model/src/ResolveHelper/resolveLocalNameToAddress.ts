import type { Address } from '@xylabs/sdk-js'

import type { ModuleInstance } from '../instance/index.ts'
import type { ModuleName } from '../ModuleIdentifier.ts'
import type { ModuleResolveDirection } from './model.ts'
import {
  resolveLocalNameToInstance,
  resolveLocalNameToInstanceAll,
  resolveLocalNameToInstanceDown,
  resolveLocalNameToInstanceUp,
} from './resolveLocalNameToInstance.ts'

export const resolveLocalNameToAddressUp = async (root: ModuleInstance, modName: ModuleName): Promise<Address | undefined> => {
  return (await resolveLocalNameToInstanceUp(root, modName))?.address
}

export const resolveLocalNameToAddressDown = async (
  root: ModuleInstance,
  modName: ModuleName,
  includePrivate: boolean | undefined = undefined,
): Promise<Address | undefined> => {
  return (await resolveLocalNameToInstanceDown(root, modName, includePrivate))?.address
}

export const resolveLocalNameToAddressAll = async (
  root: ModuleInstance,
  modName: ModuleName,
  includePrivate: boolean | undefined = undefined,
): Promise<Address | undefined> => {
  return (await resolveLocalNameToInstanceAll(root, modName, includePrivate))?.address
}

export const resolveLocalNameToAddress = async (
  root: ModuleInstance,
  modName: ModuleName,
  includePrivate: boolean | undefined = undefined,
  direction: ModuleResolveDirection = 'all',
): Promise<Address | undefined> => {
  return (await resolveLocalNameToInstance(root, modName, includePrivate, direction))?.address
}
