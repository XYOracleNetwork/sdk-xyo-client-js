import { ModuleInstance } from '../instance'
import { ModuleName } from '../ModuleIdentifier'

export const resolveLocalNameToInstanceUp = async (root: ModuleInstance, modName: ModuleName): Promise<ModuleInstance | undefined> => {
  const parents = (await root.parents?.()) ?? []
  return parents.find((parent) => parent.modName === modName)
}

//since this is a modName, it only checks the children of the root module
export const resolveLocalNameToInstanceDown = async (
  root: ModuleInstance,
  modName: ModuleName,
  includePrivate = false,
): Promise<ModuleInstance | undefined> => {
  const privateChildren = (includePrivate ? await root.privateChildren?.() : []) ?? []
  const publicChildren = (await root.publicChildren?.()) ?? []
  const children = [...privateChildren, ...publicChildren]
  return children.find((child) => child.modName === modName)
}

export const resolveLocalNameToInstance = async (
  root: ModuleInstance,
  modName: ModuleName,
  includePrivate = false,
): Promise<ModuleInstance | undefined> => {
  return (await resolveLocalNameToInstanceDown(root, modName, includePrivate)) ?? (await resolveLocalNameToInstanceUp(root, modName))
}
