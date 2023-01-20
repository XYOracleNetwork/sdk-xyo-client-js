import { QueryConverterRegistry } from '@xyo-network/express-node-lib'
import { XyoPayloadToQueryConverterRegistry } from '@xyo-network/express-node-middleware'
import { TYPES } from '@xyo-network/node-core-types'
import { Container } from 'inversify'

export const addQueryConverterRegistry = (container: Container) => {
  container.bind<QueryConverterRegistry>(TYPES.PayloadToQueryConverterRegistry).toConstantValue(new XyoPayloadToQueryConverterRegistry())
}
