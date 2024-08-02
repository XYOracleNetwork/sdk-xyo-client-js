import { Address } from '@xylabs/hex'

import { ModuleInstance } from '../instance/index.ts'
import { duplicateModules } from '../lib/index.ts'

export const resolveAllUp = async (root: ModuleInstance, maxDepth = 10, exclude: Address[] = []): Promise<ModuleInstance[]> => {
  if (maxDepth === 0) {
    return [root].filter((mod) => !exclude.includes(mod.address))
  }
  const parents = (await root.parents()).filter((mod) => !exclude.includes(mod.address))
  return (
    maxDepth > 1 ?
      [
        ...(await Promise.all(parents.map(async (mod) => await resolveAllUp(mod, maxDepth - 1, [...exclude, root.address])))).flat(),
        ...(await Promise.all(parents.map(async (mod) => await resolveAllDown(mod, maxDepth - 1, [...exclude, root.address], true)))).flat(),
        ...parents,
        root,
      ]
    : [...parents, root])
    .filter((mod) => !exclude.includes(mod.address))
    .filter(duplicateModules)
}

export const resolveAllDown = async (
  root: ModuleInstance,
  maxDepth = 10,
  exclude: Address[] = [],
  includePrivate = false,
): Promise<ModuleInstance[]> => {
  if (maxDepth === 0) {
    return [root]
  }
  const children = (await root.publicChildren()).filter((mod) => !exclude.includes(mod.address))
  const privateChildren = includePrivate ? (await root.privateChildren()).filter((mod) => !exclude.includes(mod.address)) : []
  return (
    maxDepth > 1 ?
      [
        ...children,
        ...(await Promise.all(children.map((child) => resolveAllDown(child, maxDepth - 1, [...exclude, root.address])))).flat(),
        ...(await Promise.all(privateChildren.map((child) => resolveAllDown(child, maxDepth - 1, [...exclude, root.address])))).flat(),
        root,
      ]
    : [...children, root])
    .filter((mod) => !exclude.includes(mod.address))
    .filter(duplicateModules)
}

export const resolveAll = async (root: ModuleInstance, maxDepth = 10, exclude: Address[] = []): Promise<ModuleInstance[]> => {
  if (maxDepth === 0) {
    return [root]
  }
  return [...(await resolveAllUp(root, maxDepth, exclude)), ...(await resolveAllDown(root, maxDepth, exclude))].filter(duplicateModules)
}
