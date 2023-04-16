import { HttpBridgeConfig, HttpBridgeConfigSchema } from '@xyo-network/http-bridge'
import { knownArchivists as knownNodes } from '@xyo-network/network'

import { printError } from '../../lib'
import { BaseArguments } from '../BaseArguments'

const schema = HttpBridgeConfigSchema
const security = { allowAnonymous: true }

export const getBridgeConfig = async (args: BaseArguments): Promise<HttpBridgeConfig> => {
  const { network, verbose } = args
  try {
    if (network) {
      const slug = network.toLowerCase()
      const known = knownNodes().find((node) => node.slug === slug)
      if (known) return { nodeUrl: known.uri, schema, security }
    }
    await Promise.resolve('TODO: Might need to obtain from config')
    const nodeUrl = process.env.API_DOMAIN || 'http://localhost:8080'
    return { nodeUrl, schema, security }
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error('Unable to obtain config for module')
  }
}
