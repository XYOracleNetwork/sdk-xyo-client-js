import { HttpBridge, HttpBridgeConfigSchema } from '@xyo-network/http-bridge'
import { NodeModule, NodeWrapper } from '@xyo-network/modules'

import { printError } from '../../lib'
import { BaseArguments } from '../BaseArguments'
import { getApiConfig } from './getApiConfig'

export const getNode = async (args: BaseArguments): Promise<NodeWrapper> => {
  const { verbose } = args
  try {
    const apiConfig = await getApiConfig(args)
    const module = await HttpBridge.create({ config: { nodeUri: `${apiConfig.apiDomain}/node`, schema: HttpBridgeConfigSchema } })
    const node = new NodeWrapper(module as unknown as NodeModule)
    return node
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error('Unable to connect to XYO Node')
  }
}
