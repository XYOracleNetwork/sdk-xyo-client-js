import { assertEx } from '@xylabs/assert'
import { HttpBridge } from '@xyo-network/http-bridge'
import { ModuleWrapper } from '@xyo-network/modules'

import { printError } from '../../../lib'
import { getBridgeConfig } from '../../util'
import { ModuleArguments } from '../ModuleArguments'

export const getModule = async (args: ModuleArguments): Promise<ModuleWrapper> => {
  const { address, verbose } = args
  try {
    const config = await getBridgeConfig(args)
    const bridge = await HttpBridge.create({ config })
    const resolved = await bridge.downResolver.resolve({ address: [address] })
    const mod = assertEx(resolved.pop(), `Failed to load module [${address}]`)
    return ModuleWrapper.wrap(mod)
  } catch (error) {
    if (verbose) printError(JSON.stringify(error))
    throw new Error(`Unable to connect to XYO Module at ${address}`)
  }
}
