import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import type { ModuleIdentifier } from '@xyo-network/module-model'
import { asAttachableModuleInstance } from '@xyo-network/module-model'
import type { NodeInstance } from '@xyo-network/node-model'

export const flatAttachAllToExistingNode = async (source: NodeInstance, destination: NodeInstance): Promise<NodeInstance> => {
  const children = (await source.publicChildren()).map(child => asAttachableModuleInstance(child)).filter(exists)
  await Promise.all(
    children.map(async (child) => {
      await destination.register?.(child)
      await destination.attach(child.address, true)
    }),
  )
  return destination
}

export const flatAttachChildToExistingNode = async (source: NodeInstance, id: ModuleIdentifier, destination: NodeInstance): Promise<NodeInstance> => {
  assertEx(id !== '*', () => '* is not a single child')
  const child = assertEx(await source.resolve(id), () => `Module ${id} not found`)
  const attachableChild = asAttachableModuleInstance(child, () => `Module ${id} is not attachable`)
  await destination.register?.(attachableChild)
  await destination.attach(child.address, true)
  return destination
}

export const flatAttachToExistingNode = async (source: NodeInstance, id: ModuleIdentifier, destination: NodeInstance): Promise<NodeInstance> => {
  return id === '*' ? await flatAttachAllToExistingNode(source, destination) : flatAttachChildToExistingNode(source, id, destination)
}
