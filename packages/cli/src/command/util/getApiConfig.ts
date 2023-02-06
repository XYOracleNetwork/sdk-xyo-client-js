import { XyoApiConfig } from '@xyo-network/sdk'

import { printError } from '../../lib'
import { BaseArguments } from '../BaseArguments'

export const getApiConfig = async (args: BaseArguments): Promise<XyoApiConfig> => {
  const { verbose } = args
  try {
    await Promise.resolve('TODO: Might need to obtain from config')
    const apiDomain = process.env.API_DOMAIN || 'http://localhost:8080'
    return { apiDomain }
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error('Unable to obtain config for module')
  }
}
