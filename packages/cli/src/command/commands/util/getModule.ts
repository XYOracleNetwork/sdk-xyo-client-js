import { HttpBridge, HttpBridgeConfigSchema } from '@xyo-network/http-bridge'
import { assertEx } from '@xylabs/assert'
import { Module, ModuleWrapper } from '@xyo-network/modules'


import { printError } from '../../../lib'
import { getApiConfig } from '../../util'
import { ModuleArguments } from '../ModuleArguments'

export const getModule = async (args: ModuleArguments): Promise<Module> => {
  const { address, verbose } = args
  try {
    const apiConfig = await getApiConfig(args)
    const node = await HttpBridge.create({ config: { nodeUri: `${apiConfig.apiDomain}/node`, schema: HttpBridgeConfigSchema } })
    return new ModuleWrapper(assertEx((await node.resolve({ address: [address] })).pop(), `Failed to load module [${address}]`))
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error(`Unable to connect to XYO Module at ${address}`)
  }
}
