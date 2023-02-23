import { HttpBridge, HttpBridgeConfigSchema } from '@xyo-network/bridge'
import { Module } from '@xyo-network/modules'

import { printError } from '../../../lib'
import { getApiConfig } from '../../util'
import { ModuleArguments } from '../ModuleArguments'

export const getModule = async (args: ModuleArguments): Promise<Module> => {
  const { address, verbose } = args
  try {
    const apiConfig = await getApiConfig(args)
    const module = await HttpBridge.create({ config: { nodeUri: apiConfig.apiDomain, schema: HttpBridgeConfigSchema } })
    return module
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error(`Unable to connect to XYO Module at ${address}`)
  }
}
