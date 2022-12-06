import { tryParseInt } from '@xylabs/sdk-api-express-ecs'
import { server } from '@xyo-network/express-node-server'
import { MemoryNode } from '@xyo-network/modules'

import { NodeConfigurationFunction } from '../../../model'

export const configureExpressHttpTransport: NodeConfigurationFunction = async (node: MemoryNode) => {
  // TODO: ON/OFF via presence
  // TODO: Convert port to URI to allow for local socket operation
  const port = tryParseInt(process.env.APP_PORT) ?? 80
  await server(port, node)
}
