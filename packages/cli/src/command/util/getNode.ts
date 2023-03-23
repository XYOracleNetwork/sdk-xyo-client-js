import { assertEx } from '@xylabs/assert'
import { AxiosJson } from '@xyo-network/axios'
import { HttpBridge, HttpBridgeConfigSchema } from '@xyo-network/http-bridge'
import { NodeModule, NodeWrapper } from '@xyo-network/modules'

import { printError } from '../../lib'
import { BaseArguments } from '../BaseArguments'
import { getApiConfig } from './getApiConfig'

const schema = HttpBridgeConfigSchema
const security = { allowAnonymous: true }
export const getNode = async (args: BaseArguments): Promise<NodeWrapper> => {
  const { verbose } = args
  try {
    const apiConfig = await getApiConfig(args)
    const nodeUrl = `${apiConfig.apiDomain}`
    const axios = new AxiosJson()
    const bridge = await HttpBridge.create({ axios, config: { nodeUrl, schema, security } })
    const node = assertEx((await bridge.downResolver.resolve({ address: [bridge.rootAddress] }))?.pop(), 'Failed to resolve rootNode')
    return NodeWrapper.wrap(node as NodeModule)
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error('Unable to connect to XYO Node')
  }
}
