import { ModuleInstance } from '@xyo-network/module-model'
import { asNodeInstance, NodeInstance } from '@xyo-network/node-model'

export const attachedPublicModules = async (node: NodeInstance, maxDepth = 1): Promise<ModuleInstance[]> => {
  const remainingDepth = maxDepth - 1
  const mods: ModuleInstance[] = []
  const publicChildren = await node.publicChildren()
  mods.push(...publicChildren)

  if (remainingDepth > 0) {
    await Promise.all(
      publicChildren.map(async (mod) => {
        const node = asNodeInstance(mod)
        if (node) {
          const children = await attachedPublicModules(node, remainingDepth)
          mods.push(...children)
        }
      }),
    )
  }
  return mods
}
