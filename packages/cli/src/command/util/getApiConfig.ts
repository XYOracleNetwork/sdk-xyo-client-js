import { XyoApiConfig } from '@xyo-network/api-models'
import { knownArchivists } from '@xyo-network/network'

import { printError } from '../../lib'
import { BaseArguments } from '../BaseArguments'

export const getApiConfig = async (args: BaseArguments): Promise<XyoApiConfig> => {
  const { network, verbose } = args
  try {
    if (network) {
      const slug = network.toLowerCase()
      const known = knownArchivists().find((node) => node.slug === slug)
      if (known) return { apiDomain: known.uri }
    }
    await Promise.resolve('TODO: Might need to obtain from config')
    const apiDomain = process.env.API_DOMAIN || 'http://localhost:8080'
    return { apiDomain }
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error('Unable to obtain config for module')
  }
}
