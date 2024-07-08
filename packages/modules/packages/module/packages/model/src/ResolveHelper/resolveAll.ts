import { ModuleInstance } from '../instance'

export const resolveAllPublic = async (root: ModuleInstance, maxDepth = 10): Promise<ModuleInstance[]> => {
  if (maxDepth === 0) {
    return [root]
  }
  const children = await root.publicChildren()
  return maxDepth > 1 ? (await Promise.all(children.map((child) => resolveAllPublic(child, maxDepth - 1)))).flat() : [...children, root]
}

export const resolveAllPrivate = async (root: ModuleInstance, maxDepth = 10): Promise<ModuleInstance[]> => {
  if (maxDepth === 0) {
    return [root]
  }
  const children = await root.privateChildren()
  return maxDepth > 1 ? (await Promise.all(children.map((child) => resolveAllPrivate(child, maxDepth - 1)))).flat() : [...children, root]
}

export const resolveAll = async (root: ModuleInstance, maxDepth = 10, includePrivate = false): Promise<ModuleInstance[]> => {
  if (maxDepth === 0) {
    return [root]
  }
  const children = [...(includePrivate ? await root.privateChildren() : []), ...(await root.publicChildren())]
  return maxDepth > 1 ? (await Promise.all(children.map((child) => resolveAll(child, maxDepth - 1, includePrivate)))).flat() : [...children, root]
}
