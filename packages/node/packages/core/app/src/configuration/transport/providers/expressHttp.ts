import { server } from '@xyo-network/express-node-server'
import { MemoryNode } from '@xyo-network/modules'

import { NodeConfigurationFunction } from '../../../model'

export const configureExpressHttpTransport: NodeConfigurationFunction = async (_node: MemoryNode) => {
  // TODO: Configure express server handing it the Node
  await server()
}
