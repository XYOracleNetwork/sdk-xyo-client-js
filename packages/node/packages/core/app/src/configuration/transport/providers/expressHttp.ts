import { getApp, server } from '@xyo-network/express-node-server'
import { AbstractNode } from '@xyo-network/modules'

import { NodeConfigurationFunction } from '../../../model'

export const configureExpressHttpTransport: NodeConfigurationFunction = async (_node: AbstractNode) => {
  // TODO: Configure express server handing it the Node
  await server()
}
