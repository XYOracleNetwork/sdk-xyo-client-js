import { SchemaToQueryProcessorRegistry } from '@xyo-network/express-node-middleware'
import { QueryProcessorRegistry } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { Container } from 'inversify'

export const addQueryProcessorRegistry = (container: Container) => {
  container.bind<QueryProcessorRegistry>(TYPES.SchemaToQueryProcessorRegistry).toConstantValue(new SchemaToQueryProcessorRegistry())
}
