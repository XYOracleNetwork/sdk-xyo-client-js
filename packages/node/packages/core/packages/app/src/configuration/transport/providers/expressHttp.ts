import { tryParseInt } from '@xylabs/sdk-api-express-ecs'
import { getServer } from '@xyo-network/express-node-server'
import { MemoryNode } from '@xyo-network/node-memory'

import { NodeConfigurationFunction } from '../../../model'

export const configureExpressHttpTransport: NodeConfigurationFunction = async (node: MemoryNode) => {
  // TODO: ON/OFF via presence
  // TODO: Convert port to URI to allow for local socket operation
  const port = tryParseInt(process.env.APP_PORT) ?? 80
  await getServer(port, node)
}
