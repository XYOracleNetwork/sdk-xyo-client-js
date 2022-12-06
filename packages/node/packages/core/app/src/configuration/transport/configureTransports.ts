import { AbstractNode } from '@xyo-network/modules'

import { NodeConfigurationFunction } from '../../model'
import { configureExpressHttpTransport, configureFileTransport } from './providers'

export const configureTransports: NodeConfigurationFunction = async (node: AbstractNode) => {
  await configureFileTransport(node)
  await configureExpressHttpTransport(node)
}
