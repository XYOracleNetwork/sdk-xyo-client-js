import { ModuleInstance } from '../instance/index.ts'
import { ModuleName } from '../ModuleIdentifier.ts'
import { ModuleResolveDirection } from './model.ts'

export const resolveLocalNameToInstanceUp = async (root: ModuleInstance, modName: ModuleName): Promise<ModuleInstance | undefined> => {
  const parents = (await root.parents?.()) ?? []
  return parents.find((parent) => parent.config.name === modName)
}

//since this is a modName, it only checks the children of the root module
export const resolveLocalNameToInstanceDown = async (
  root: ModuleInstance,
  modName: ModuleName,
  includePrivate: boolean | undefined = undefined,
): Promise<ModuleInstance | undefined> => {
  const privateChildren = (includePrivate ? await root.privateChildren?.() : []) ?? []
  const publicChildren = (await root.publicChildren?.()) ?? []
  const children = [...privateChildren, ...publicChildren]
  return children.find((child) => child.config.name === modName)
}

export const resolveLocalNameToInstanceAll = async (
  root: ModuleInstance,
  modName: ModuleName,
  includePrivate = false,
): Promise<ModuleInstance | undefined> => {
  return (await resolveLocalNameToInstanceDown(root, modName, includePrivate)) ?? (await resolveLocalNameToInstanceUp(root, modName))
}

export const resolveLocalNameToInstance = async (
  root: ModuleInstance,
  modName: ModuleName,
  includePrivate = false,
  direction: ModuleResolveDirection = 'all',
): Promise<ModuleInstance | undefined> => {
  switch (direction) {
    case 'all': {
      return await resolveLocalNameToInstanceAll(root, modName, includePrivate)
    }
    case 'up': {
      return await resolveLocalNameToInstanceUp(root, modName)
    }
    case 'down': {
      return await resolveLocalNameToInstanceDown(root, modName, includePrivate)
    }
  }
}
