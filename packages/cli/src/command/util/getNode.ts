import { HttpProxyModule } from '@xyo-network/http-proxy-module'
import { AbstractModuleConfigSchema, Module } from '@xyo-network/modules'

import { BaseArguments } from '../BaseArguments'
import { getApiConfig } from './getApiConfig'

export const getNode = async (args: BaseArguments): Promise<Module> => {
  const { verbose } = args
  try {
    const apiConfig = await getApiConfig(args)
    const module = await HttpProxyModule.create({ apiConfig, config: { schema: AbstractModuleConfigSchema } })
    return module
  } catch (error) {
    if (verbose) console.error(error)
    throw new Error('Unable to connect to XYO Node')
  }
}
