import { assertEx } from '@xylabs/assert'
import { Module } from '@xyo-network/module-model'
import { DirectNodeModule } from '@xyo-network/node-model'

export const resolveBySymbol = async <T extends Module>(node: DirectNodeModule, name: symbol): Promise<T> => {
  const description = assertEx(name.description, 'Unable to obtain symbol description')
  const mods = await node.resolve({ name: [description] })
  const mod = assertEx(mods?.[0], `Unable to obtain module with name ${description}`)
  return mod as T
}
