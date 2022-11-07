import { dependencies } from '@xyo-network/express-node-dependencies'
import { Initializable } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'

export const initializeModules = async () => {
  const initializables: Initializable[] = dependencies.getAll(TYPES.Initializable)
  const initializations = initializables.map((mod) => mod.initialize())
  await Promise.all(initializations)
}
