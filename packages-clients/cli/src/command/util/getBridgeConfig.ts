import { HttpBridgeConfig, HttpBridgeConfigSchema } from '@xyo-network/http-bridge'
import { knownArchivists as knownNodes } from '@xyo-network/network'

import { printError } from '../../lib'
import { BaseArguments } from '../BaseArguments'

const schema = HttpBridgeConfigSchema
const security = { allowAnonymous: true }

export const getBridgeConfig = async (args: BaseArguments): Promise<HttpBridgeConfig> => {
  const { network, verbose } = args
  try {
    let nodeUrl = process.env.API_DOMAIN || 'http://localhost:8080'
    if (network) {
      const slug = network.toLowerCase()
      const known = knownNodes().find((node) => node.slug === slug)
      if (known) nodeUrl = known.uri
    }
    await Promise.resolve('TODO: Might need to obtain from config')
    return { nodeUrl, schema, security }
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error('Unable to obtain config for module')
  }
}
