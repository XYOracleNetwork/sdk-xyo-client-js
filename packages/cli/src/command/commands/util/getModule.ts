import { assertEx } from '@xylabs/assert'
import { HttpBridge, HttpBridgeConfigSchema } from '@xyo-network/http-bridge'
import { ModuleWrapper } from '@xyo-network/modules'

import { printError } from '../../../lib'
import { getApiConfig } from '../../util'
import { ModuleArguments } from '../ModuleArguments'

const schema = HttpBridgeConfigSchema
const security = { allowAnonymous: true }

export const getModule = async (args: ModuleArguments): Promise<ModuleWrapper> => {
  const { address, verbose } = args
  try {
    const apiConfig = await getApiConfig(args)
    const bridge = await HttpBridge.create({ config: { nodeUrl: `${apiConfig.apiDomain}`, schema, security } })
    const resolved = await bridge.downResolver.resolve({ address: [address] })
    const mod = assertEx(resolved.pop(), `Failed to load module [${address}]`)
    return ModuleWrapper.wrap(mod)
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error(`Unable to connect to XYO Module at ${address}`)
  }
}
