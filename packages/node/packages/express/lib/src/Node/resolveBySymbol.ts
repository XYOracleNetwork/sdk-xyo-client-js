import { assertEx } from '@xylabs/assert'
import { AbstractNode, XyoModule } from '@xyo-network/modules'

export const resolveBySymbol = async <T extends XyoModule>(node: AbstractNode, name: symbol): Promise<T> => {
  const description = assertEx(name.description, 'Unable to obtain symbol description')
  const mods = await node.resolve({ name: [description] })
  const mod = assertEx(mods?.[0], `Unable to obtain module with name ${description}`)
  return mod as T
}
