import { ModuleInstance } from '@xyo-network/module-model'
import { NodeInstance, asNodeInstance } from '@xyo-network/node-model'

export const attachedPrivateModules = async (node: NodeInstance, maxDepth = 1): Promise<ModuleInstance[]> => {
  const remainingDepth = maxDepth - 1
  const mods: ModuleInstance[] = []
  const publicChildren = await node.privateChildren()
  mods.push(...publicChildren)

  if (remainingDepth > 0) {
    await Promise.all(
      publicChildren.map(async (mod) => {
        const node = asNodeInstance(mod)
        if (node) {
          const children = await attachedPrivateModules(node, remainingDepth)
          mods.push(...children)
        }
      }),
    )
  }
  return mods
}
