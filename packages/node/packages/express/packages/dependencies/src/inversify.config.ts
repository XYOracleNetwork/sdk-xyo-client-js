import 'reflect-metadata'

import { assertEx } from '@xylabs/assert'
import { getLogger, Logger, LoggerVerbosity } from '@xylabs/sdk-api-express-ecs'
import { MemoryNode } from '@xyo-network/modules'
import { ConfigModuleFactoryDictionary } from '@xyo-network/node-core-model'
import { addMongo } from '@xyo-network/node-core-modules-mongo'
import { TYPES } from '@xyo-network/node-core-types'
import { config } from 'dotenv'
import { Container } from 'inversify'

import { addMemoryNode } from './addMemoryNode'
import { tryGetServiceName } from './Util'
import { addWitnessConfigModuleFactories } from './Witness'
config()
export const container = new Container({
  autoBindInjectable: true,
  // Set to true to prevent warning when child constructor has less
  // parameters than the parent
  // "The number of constructor arguments in the derived
  // class <ClassName> must be >= than the number of constructor
  // arguments of its base class."
  // See:
  // https://github.com/inversify/InversifyJS/issues/522#issuecomment-682246076
  skipBaseClassChecks: true,
})

let configured = false

export const configureDependencies = async (node?: MemoryNode) => {
  if (configured) return
  configured = true

  const mnemonic = assertEx(process.env.MNEMONIC, 'MNEMONIC ENV VAR required to create Archivist')
  const verbosity: LoggerVerbosity = (process.env.VERBOSITY as LoggerVerbosity) ?? process.env.NODE_ENV === 'test' ? 'error' : 'info'
  const logger = getLogger(verbosity)

  container.bind<string>(TYPES.AccountMnemonic).toConstantValue(mnemonic)
  container.bind<ConfigModuleFactoryDictionary>(TYPES.ConfigModuleFactoryDictionary).toConstantValue({})

  container.bind<Logger>(TYPES.Logger).toDynamicValue((context) => {
    const service = tryGetServiceName(context)
    // TODO: Configure logger with service name
    // const defaultMeta = { service }
    // const config = { defaultMeta }
    return service ? logger : logger
  })
  await addMongo(container)
  addWitnessConfigModuleFactories(container)
  await addMemoryNode(container, node)
}
