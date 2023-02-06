import { HttpProxyModule } from '@xyo-network/http-proxy-module'
import { AbstractModuleConfigSchema, Module } from '@xyo-network/modules'

import { ModuleArguments } from '../ModuleArguments'
import { getApiConfig } from './getApiConfig'

export const getModule = async (args: ModuleArguments): Promise<Module> => {
  const { address, verbose } = args
  try {
    const apiConfig = await getApiConfig(args)
    const module = await HttpProxyModule.create({ address, apiConfig, config: { schema: AbstractModuleConfigSchema } })
    return module
  } catch (error) {
    if (verbose) console.error(error)
    throw new Error('Unable to obtain module for supplied address')
  }
}
