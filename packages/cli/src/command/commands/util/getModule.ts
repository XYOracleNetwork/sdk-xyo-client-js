import { HttpProxyModule, HttpProxyModuleConfigSchema } from '@xyo-network/http-proxy-module'
import { Module } from '@xyo-network/modules'

import { printError } from '../../../lib'
import { getApiConfig } from '../../util'
import { ModuleArguments } from '../ModuleArguments'

export const getModule = async (args: ModuleArguments): Promise<Module> => {
  const { address, verbose } = args
  try {
    const apiConfig = await getApiConfig(args)
    const module = await HttpProxyModule.create({ apiConfig, config: { address, schema: HttpProxyModuleConfigSchema } })
    return module
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error(`Unable to connect to XYO Module at ${address}`)
  }
}
